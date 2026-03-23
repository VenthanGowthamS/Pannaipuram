import React, { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, IconButton, Skeleton, Badge, Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  MarkEmailRead as ReadIcon,
  Refresh as RefreshIcon,
  ChatBubble as FeedbackIcon,
} from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const Feedback = ({ onSnackbar, canEdit }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getFeedback();
      setItems(data || []);
    } catch (error) {
      onSnackbar('Failed to load feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markFeedbackRead(id);
      setItems(prev => prev.map(item => item.id === id ? { ...item, is_read: true } : item));
      onSnackbar('Marked as read', 'success');
    } catch {
      onSnackbar('Failed to update', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteFeedback(confirmDelete.id);
      setItems(prev => prev.filter(item => item.id !== confirmDelete.id));
      onSnackbar('Deleted', 'success');
      setConfirmDelete({ open: false, id: null });
    } catch {
      onSnackbar('Failed to delete', 'error');
      setConfirmDelete({ open: false, id: null });
    }
  };

  const unreadCount = items.filter(i => !i.is_read).length;

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            💬 Villager Feedback
          </Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} new`} color="error" size="small" sx={{ fontWeight: 600 }} />
          )}
        </Box>
        <IconButton onClick={load} size="small" title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Card>
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3, 4].map(i => <Skeleton key={i} height={60} />)}
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <FeedbackIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }} />
              <Typography color="textSecondary">
                No feedback yet — will appear here once villagers submit via the app
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 20 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name / Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Received</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}
                    sx={{ bgcolor: item.is_read ? 'inherit' : '#FFFDE7', fontWeight: item.is_read ? 'normal' : 700 }}>
                    <TableCell sx={{ color: '#9e9e9e', fontSize: 12 }}>{item.id}</TableCell>
                    <TableCell sx={{
                      fontFamily: '"Noto Sans Tamil", sans-serif',
                      maxWidth: 400,
                      fontWeight: item.is_read ? 'normal' : 600,
                    }}>
                      {item.message}
                    </TableCell>
                    <TableCell sx={{ color: item.name_or_contact ? 'inherit' : '#bdbdbd', fontStyle: item.name_or_contact ? 'normal' : 'italic' }}>
                      {item.name_or_contact || 'anonymous'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: '#757575', whiteSpace: 'nowrap' }}>
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell>
                      {item.is_read
                        ? <Chip label="Read" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }} />
                        : <Chip label="New" size="small" color="error" />
                      }
                    </TableCell>
                    <TableCell align="center">
                      {!item.is_read && (
                        <Tooltip title="Mark as read">
                          <IconButton size="small" sx={{ color: '#1B5E20' }} onClick={() => handleMarkRead(item.id)}>
                            <ReadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canEdit && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setConfirmDelete({ open: true, id: item.id })}>
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

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Feedback"
        message="Delete this feedback entry? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default Feedback;
