import React, { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, IconButton, Skeleton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Switch, TextField,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Refresh as RefreshIcon,
  Newspaper as BulletinIcon,
  Favorite as LikeIcon,
  Campaign as OfficialIcon,
} from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_STYLE = {
  approved: { bgcolor: '#E8F5E9', color: '#2E7D32' },
  pending:  { bgcolor: '#FFF3E0', color: '#E65100' },
  rejected: { bgcolor: '#FFEBEE', color: '#C62828' },
  archived: { bgcolor: '#F3E5F5', color: '#6A1B9A' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const Bulletin = ({ onSnackbar, canEdit }) => {
  const [tab, setTab] = useState(0);            // 0 = posts, 1 = posters
  const [posts, setPosts] = useState([]);
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [details, setDetails] = useState({ open: false, post: null });
  const BLANK_POST = { title_tamil: '', title_english: '', content_tamil: '', content_english: '', image_url: null };
  const [compose, setCompose] = useState({ open: false, saving: false, ...BLANK_POST });

  // NOTE: `load` must NOT be a useCallback keyed on `onSnackbar`, and the
  // effect below must NOT depend on `load`. onSnackbar is recreated on every
  // App render, so a failing load would snackbar -> App re-render -> new
  // onSnackbar -> new load -> effect refires -> load fails again, looping
  // forever (measured: ~1,400 requests/second). Plain function + [] on mount,
  // matching every other admin page.
  const load = async () => {
    setLoading(true);
    try {
      const [p, po] = await Promise.all([
        api.getBulletinPosts(),
        api.getBulletinPosters(),
      ]);
      setPosts(p || []);
      setPosters(po || []);
      setLoadError(null);
    } catch (err) {
      // Render the failure in-page instead of firing a snackbar, which is
      // what fed the render loop.
      setLoadError(err?.message || 'Failed to load bulletin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (id, status) => {
    try {
      await api.updateBulletinStatus(id, status);
      setPosts(prev => prev.map(p => (p.id === id ? { ...p, status } : p)));
      onSnackbar(`Post ${status}`, 'success');
      setDetails({ open: false, post: null });
    } catch {
      onSnackbar('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteBulletinPost(confirmDelete.id);
      setPosts(prev => prev.filter(p => p.id !== confirmDelete.id));
      onSnackbar('Post deleted', 'success');
    } catch {
      onSnackbar('Failed to delete', 'error');
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  const togglePoster = async (id, field, value) => {
    try {
      const updated = await api.updateBulletinPoster(id, { [field]: value });
      setPosters(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
      onSnackbar(
        field === 'is_trusted'
          ? (value ? 'Trusted — their posts now go live instantly' : 'Trust removed — posts will queue again')
          : (value ? 'Poster blocked' : 'Poster unblocked'),
        'success',
      );
    } catch {
      onSnackbar('Failed to update poster', 'error');
    }
  };

  // Same budget the PWA uses: resize to 1024px and step quality down until
  // the data URL fits ~80KB, so official posts don't blow the DB tier either.
  const pickImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        const MAX = 1024;
        if (w > h && w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        else if (h >= w && h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        let q = 0.7;
        let out = canvas.toDataURL('image/jpeg', q);
        while (out.length > 80 * 1024 && q > 0.3) { q -= 0.1; out = canvas.toDataURL('image/jpeg', q); }
        setCompose(c => ({ ...c, image_url: out }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const publishOfficial = async () => {
    if (compose.title_tamil.trim().length < 5) { onSnackbar('Tamil title must be at least 5 characters', 'warning'); return; }
    if (compose.content_tamil.trim().length < 10) { onSnackbar('Tamil content must be at least 10 characters', 'warning'); return; }
    setCompose(c => ({ ...c, saving: true }));
    try {
      await api.createOfficialBulletinPost({
        title_tamil: compose.title_tamil,
        title_english: compose.title_english,
        content_tamil: compose.content_tamil,
        content_english: compose.content_english,
        image_url: compose.image_url,
      });
      onSnackbar('Published — live in the app now', 'success');
      setCompose({ open: false, saving: false, ...BLANK_POST });
      load();
    } catch {
      onSnackbar('Failed to publish', 'error');
      setCompose(c => ({ ...c, saving: false }));
    }
  };

  const pendingCount = posts.filter(p => p.status === 'pending').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>📰 Community Bulletin</Typography>
          {pendingCount > 0 && (
            <Chip label={`${pendingCount} awaiting review`} color="warning" size="small" sx={{ fontWeight: 600 }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<OfficialIcon />}
              onClick={() => setCompose({ open: true, saving: false, ...BLANK_POST })}
              sx={{ bgcolor: '#E65100', '&:hover': { bgcolor: '#BF360C' }, whiteSpace: 'nowrap' }}
            >
              New official post
            </Button>
          )}
          <IconButton onClick={load} size="small" title="Refresh"><RefreshIcon /></IconButton>
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Posts (${posts.length})`} />
          <Tab label={`Villagers (${posters.length})`} />
        </Tabs>
      </Card>

      {loadError ? (
        <Card sx={{ borderLeft: '4px solid #C62828' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Couldn't load the bulletin</Typography>
            <Typography variant="body2" sx={{ color: '#C62828', mb: 2, fontFamily: 'monospace' }}>
              {loadError}
            </Typography>
            {/setup|migration|not found|relation/i.test(loadError) && (
              <Box sx={{ bgcolor: '#FFF8E1', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  The bulletin tables don't exist yet. Open the <strong>Supabase SQL Editor</strong> and run:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  backend/src/db/migration_community_posts.sql
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
                  Then run migration_community_purge.sql after enabling the pg_cron extension.
                </Typography>
              </Box>
            )}
            <Button variant="outlined" onClick={load} startIcon={<RefreshIcon />}>Try again</Button>
          </Box>
        </Card>
      ) : loading ? (
        <Card><Box sx={{ p: 3 }}>{[1, 2, 3, 4].map(i => <Skeleton key={i} height={70} sx={{ mb: 1 }} />)}</Box></Card>
      ) : tab === 0 ? (
        <Card>
          <TableContainer component={Paper}>
            {posts.length === 0 ? (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <BulletinIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }} />
                <Typography color="textSecondary">No posts yet</Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Villager</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Posted</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">❤️</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {posts.map(post => (
                    <TableRow key={post.id} sx={{ bgcolor: post.status === 'pending' ? '#FFFDE7' : 'inherit' }}>
                      <TableCell
                        sx={{
                          fontFamily: '"Noto Sans Tamil", sans-serif',
                          maxWidth: 320, fontWeight: 600,
                          color: '#1A237E', cursor: 'pointer', textDecoration: 'underline',
                        }}
                        onClick={() => setDetails({ open: true, post })}
                      >
                        {post.title_tamil}
                        {post.image_url && <span title="Has image"> 🖼</span>}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        <Box sx={{ fontFamily: '"Noto Sans Tamil", sans-serif' }}>{post.name_tamil}</Box>
                        <Box sx={{ color: '#999' }}>{post.phone}</Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, color: '#757575', whiteSpace: 'nowrap' }}>
                        {formatDate(post.created_at)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: 12 }}>{post.like_count}</TableCell>
                      <TableCell>
                        <Chip label={post.status} size="small" sx={STATUS_STYLE[post.status]} />
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        {canEdit && post.status !== 'approved' && (
                          <Tooltip title="Approve — everyone sees it">
                            <IconButton size="small" sx={{ color: '#2E7D32' }} onClick={() => setStatus(post.id, 'approved')}>
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canEdit && post.status !== 'rejected' && (
                          <Tooltip title="Reject — hide from the app">
                            <IconButton size="small" color="error" onClick={() => setStatus(post.id, 'rejected')}>
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canEdit && (
                          <Tooltip title="Delete permanently">
                            <IconButton size="small" color="error" onClick={() => setConfirmDelete({ open: true, id: post.id })}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Card>
      ) : (
        <Card>
          <Box sx={{ px: 2, pt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Trusted</strong> villagers skip the approval queue — their posts go live instantly.
              <strong> Blocked</strong> villagers cannot post at all.
            </Typography>
          </Box>
          <TableContainer component={Paper}>
            {posters.length === 0 ? (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="textSecondary">No one has registered yet</Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Posts</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Registered</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Trusted</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Blocked</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {posters.map(p => (
                    <TableRow key={p.id} sx={{ bgcolor: p.is_blocked ? '#FFEBEE' : 'inherit' }}>
                      <TableCell sx={{ fontFamily: '"Noto Sans Tamil", sans-serif', fontWeight: 600 }}>
                        {p.name_tamil}
                        {p.name_english && <Box sx={{ fontSize: 11, color: '#999' }}>{p.name_english}</Box>}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{p.phone}</TableCell>
                      <TableCell align="center" sx={{ fontSize: 13 }}>{p.post_count}</TableCell>
                      <TableCell sx={{ fontSize: 12, color: '#757575', whiteSpace: 'nowrap' }}>
                        {formatDate(p.registered_at)}
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          size="small" color="success"
                          checked={p.is_trusted === true}
                          disabled={!canEdit || p.is_blocked}
                          onChange={(e) => togglePoster(p.id, 'is_trusted', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          size="small" color="error"
                          checked={p.is_blocked === true}
                          disabled={!canEdit}
                          onChange={(e) => togglePoster(p.id, 'is_blocked', e.target.checked)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Card>
      )}

      {/* Full post preview — this is what the villager will see */}
      <Dialog open={details.open} onClose={() => setDetails({ open: false, post: null })} maxWidth="sm" fullWidth>
        {details.post && (
          <>
            <DialogTitle sx={{ fontFamily: '"Noto Sans Tamil", sans-serif', fontSize: 17, fontWeight: 700 }}>
              {details.post.title_tamil}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                <strong>{details.post.name_tamil}</strong> · {details.post.phone} · {formatDate(details.post.created_at)}
                {'  '}
                <Chip label={details.post.status} size="small" sx={{ ...STATUS_STYLE[details.post.status], ml: 1 }} />
                {details.post.is_trusted && <Chip label="trusted" size="small" color="success" sx={{ ml: 0.5 }} />}
              </Typography>

              {details.post.title_english && (
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>{details.post.title_english}</Typography>
              )}

              <Box sx={{
                p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2,
                fontFamily: '"Noto Sans Tamil", sans-serif',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {details.post.content_tamil}
              </Box>

              {details.post.content_english && (
                <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 1, mb: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {details.post.content_english}
                </Box>
              )}

              {details.post.image_url && (
                <img src={details.post.image_url} alt="" style={{ maxWidth: '100%', borderRadius: 4 }} />
              )}

              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2, color: '#999' }}>
                <LikeIcon sx={{ fontSize: 14 }} /> {details.post.like_count} · expires {formatDate(details.post.expires_at)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetails({ open: false, post: null })}>Close</Button>
              {canEdit && details.post.status !== 'rejected' && (
                <Button color="error" onClick={() => setStatus(details.post.id, 'rejected')}>Reject</Button>
              )}
              {canEdit && details.post.status !== 'approved' && (
                <Button variant="contained" color="success" onClick={() => setStatus(details.post.id, 'approved')}>
                  Approve
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Publish as the official village account — goes live immediately */}
      <Dialog open={compose.open} onClose={() => !compose.saving && setCompose(c => ({ ...c, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OfficialIcon sx={{ color: '#E65100' }} />
          Post as admin
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Goes live in the app immediately with an official badge — no approval step.
            Villagers see it credited to <strong>பண்ணைப்புரம் நிர்வாகம்</strong>.
            For a short urgent alert on every screen, use the Announcements tab instead.
          </Typography>
          <TextField
            fullWidth required label="தலைப்பு (Tamil title)" margin="dense"
            value={compose.title_tamil} inputProps={{ maxLength: 200 }}
            onChange={(e) => setCompose(c => ({ ...c, title_tamil: e.target.value }))}
            InputProps={{ sx: { fontFamily: '"Noto Sans Tamil", sans-serif' } }}
          />
          <TextField
            fullWidth label="English title (optional)" margin="dense"
            value={compose.title_english} inputProps={{ maxLength: 200 }}
            onChange={(e) => setCompose(c => ({ ...c, title_english: e.target.value }))}
          />
          <TextField
            fullWidth required multiline rows={4} label="விபரம் (Tamil content)" margin="dense"
            value={compose.content_tamil} inputProps={{ maxLength: 1000 }}
            onChange={(e) => setCompose(c => ({ ...c, content_tamil: e.target.value }))}
            InputProps={{ sx: { fontFamily: '"Noto Sans Tamil", sans-serif' } }}
          />
          <TextField
            fullWidth multiline rows={2} label="English content (optional)" margin="dense"
            value={compose.content_english} inputProps={{ maxLength: 1000 }}
            onChange={(e) => setCompose(c => ({ ...c, content_english: e.target.value }))}
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label" size="small">
              {compose.image_url ? 'Change image' : 'Add image (optional)'}
              <input hidden type="file" accept="image/*" onChange={(e) => pickImage(e.target.files[0])} />
            </Button>
            {compose.image_url && (
              <Box sx={{ mt: 1 }}>
                <img src={compose.image_url} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }} />
                <Typography variant="caption" sx={{ display: 'block', color: '#999' }}>
                  {Math.round(compose.image_url.length / 1024)} KB after compression
                  {' · '}
                  <Button size="small" onClick={() => setCompose(c => ({ ...c, image_url: null }))}>remove</Button>
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button disabled={compose.saving} onClick={() => setCompose(c => ({ ...c, open: false }))}>Cancel</Button>
          <Button
            variant="contained" disabled={compose.saving} onClick={publishOfficial}
            sx={{ bgcolor: '#E65100', '&:hover': { bgcolor: '#BF360C' } }}
          >
            {compose.saving ? 'Publishing…' : 'Publish now'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Post"
        message="Delete this bulletin post permanently? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default Bulletin;
