import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, IconButton, Skeleton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Switch,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Refresh as RefreshIcon,
  Newspaper as BulletinIcon,
  Favorite as LikeIcon,
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
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [details, setDetails] = useState({ open: false, post: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, po] = await Promise.all([
        api.getBulletinPosts(),
        api.getBulletinPosters(),
      ]);
      setPosts(p || []);
      setPosters(po || []);
    } catch {
      onSnackbar('Failed to load bulletin', 'error');
    } finally {
      setLoading(false);
    }
  }, [onSnackbar]);

  useEffect(() => { load(); }, [load]);

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
        <IconButton onClick={load} size="small" title="Refresh"><RefreshIcon /></IconButton>
      </Box>

      <Card sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Posts (${posts.length})`} />
          <Tab label={`Villagers (${posters.length})`} />
        </Tabs>
      </Card>

      {loading ? (
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
