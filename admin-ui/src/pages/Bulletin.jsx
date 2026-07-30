import React, { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, IconButton, Skeleton, Badge, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, TextField, FormControl,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Refresh as RefreshIcon,
  Newspaper as BulletinIcon,
} from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const Bulletin = ({ onSnackbar, canEdit }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0=all, 1=pending, 2=approved, 3=rejected
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [statusDialog, setStatusDialog] = useState({ open: false, id: null, currentStatus: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, post: null });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getBulletinPosts();
      setPosts(data || []);
    } catch (error) {
      onSnackbar('Failed to load bulletin posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChangeStatus = async (postId, newStatus) => {
    try {
      await api.updateBulletinStatus(postId, newStatus);
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, status: newStatus } : p)
      );
      onSnackbar(`Post ${newStatus}`, 'success');
      setStatusDialog({ open: false, id: null, currentStatus: null });
    } catch (error) {
      onSnackbar('Failed to update post status', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteBulletinPost(confirmDelete.id);
      setPosts(prev => prev.filter(p => p.id !== confirmDelete.id));
      onSnackbar('Post deleted', 'success');
      setConfirmDelete({ open: false, id: null });
    } catch {
      onSnackbar('Failed to delete post', 'error');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    return {
      approved: { bgcolor: '#E8F5E9', color: '#2E7D32' },
      pending: { bgcolor: '#FFF3E0', color: '#E65100' },
      rejected: { bgcolor: '#FFEBEE', color: '#C62828' },
      archived: { bgcolor: '#F3E5F5', color: '#6A1B9A' },
    }[status] || { bgcolor: '#f5f5f5', color: '#666' };
  };

  let filteredPosts = posts;
  if (tabValue === 1) filteredPosts = posts.filter(p => p.status === 'pending');
  if (tabValue === 2) filteredPosts = posts.filter(p => p.status === 'approved');
  if (tabValue === 3) filteredPosts = posts.filter(p => p.status === 'rejected');

  const pendingCount = posts.filter(p => p.status === 'pending').length;
  const approvedCount = posts.filter(p => p.status === 'approved').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            📰 Community Bulletin
          </Typography>
          {pendingCount > 0 && (
            <Chip label={`${pendingCount} pending`} color="warning" size="small" sx={{ fontWeight: 600 }} />
          )}
        </Box>
        <IconButton onClick={load} size="small" title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Card sx={{ mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label={`All (${posts.length})`} />
            <Tab label={`Pending (${pendingCount})`} />
            <Tab label={`Approved (${approvedCount})`} />
            <Tab label="Rejected" />
          </Tabs>
        </Box>
      </Card>

      <Card>
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} height={80} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : filteredPosts.length === 0 ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <BulletinIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }} />
              <Typography color="textSecondary">
                No posts in this category yet
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 20 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Title (Tamil)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Poster</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Posted</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPosts.map(post => (
                  <TableRow key={post.id}>
                    <TableCell sx={{ color: '#9e9e9e', fontSize: 12 }}>
                      {post.id}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: '"Noto Sans Tamil", sans-serif',
                        maxWidth: 300,
                        fontWeight: 500,
                        cursor: 'pointer',
                        color: '#1A237E',
                        textDecoration: 'underline',
                      }}
                      onClick={() => setDetailsDialog({ open: true, post })}
                    >
                      {post.title_tamil || post.title_english}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      <div>{post.name_tamil}</div>
                      <div sx={{ color: '#999', fontSize: 11 }}>{post.phone}</div>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: '#757575', whiteSpace: 'nowrap' }}>
                      {formatDate(post.created_at)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={post.status}
                        size="small"
                        sx={getStatusColor(post.status)}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      {canEdit && post.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              sx={{ color: '#2E7D32' }}
                              onClick={() =>
                                handleChangeStatus(post.id, 'approved')
                              }
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleChangeStatus(post.id, 'rejected')
                              }
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {canEdit && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setConfirmDelete({ open: true, id: post.id })
                            }
                          >
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

      {/* Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, post: null })}
        maxWidth="sm"
        fullWidth
      >
        {detailsDialog.post && (
          <>
            <DialogTitle sx={{ fontFamily: '"Noto Sans Tamil", sans-serif', fontSize: 16 }}>
              {detailsDialog.post.title_tamil || detailsDialog.post.title_english}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Poster:</strong> {detailsDialog.post.name_tamil} ({detailsDialog.post.phone})
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Posted:</strong> {formatDate(detailsDialog.post.created_at)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  <strong>Status:</strong>{' '}
                  <Chip label={detailsDialog.post.status} size="small" sx={getStatusColor(detailsDialog.post.status)} />
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: '"Noto Sans Tamil", sans-serif', mb: 1 }}>
                  Content (Tamil):
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    fontFamily: '"Noto Sans Tamil", sans-serif',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {detailsDialog.post.content_tamil}
                </Box>
              </Box>
              {detailsDialog.post.content_english && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Content (English):
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {detailsDialog.post.content_english}
                  </Box>
                </Box>
              )}
              {detailsDialog.post.image_url && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Image:
                  </Typography>
                  <img
                    src={detailsDialog.post.image_url}
                    alt="post-image"
                    style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 4 }}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog({ open: false, post: null })}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Post"
        message="Delete this bulletin post? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default Bulletin;
