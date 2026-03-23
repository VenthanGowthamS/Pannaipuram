import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid,
  Skeleton,
  IconButton,
  Chip,
  Switch,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const TYPES = [
  { id: 'info', label: 'Info', color: '#1565C0' },
  { id: 'warning', label: 'Warning', color: '#E65100' },
  { id: 'urgent', label: 'Urgent', color: '#C62828' },
  { id: 'event', label: 'Event', color: '#6A1B9A' },
];

const Announcements = ({ onSnackbar, canEdit }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    message_tamil: '',
    message_english: '',
    type: 'info',
    priority: '0',
    expires_at: '',
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getAnnouncements();
      setItems(data || []);
    } catch {
      onSnackbar('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ message_tamil: '', message_english: '', type: 'info', priority: '0', expires_at: '' });
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      message_tamil: item.message_tamil || '',
      message_english: item.message_english || '',
      type: item.type || 'info',
      priority: String(item.priority || 0),
      expires_at: item.expires_at ? item.expires_at.slice(0, 16) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message_tamil) {
      onSnackbar('Tamil message is required', 'warning');
      return;
    }
    try {
      const payload = {
        message_tamil: form.message_tamil,
        message_english: form.message_english || null,
        type: form.type,
        priority: parseInt(form.priority) || 0,
        expires_at: form.expires_at || null,
      };

      if (editingId) {
        await api.updateAnnouncement(editingId, payload);
        onSnackbar('Announcement updated!', 'success');
      } else {
        await api.addAnnouncement(payload);
        onSnackbar('Announcement added!', 'success');
      }
      resetForm();
      load();
    } catch {
      onSnackbar(editingId ? 'Failed to update announcement' : 'Failed to add announcement', 'error');
    }
  };

  const handleToggle = async (item) => {
    try {
      await api.updateAnnouncement(item.id, { is_active: !item.is_active });
      load();
    } catch {
      onSnackbar('Failed to toggle announcement', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteAnnouncement(confirmDelete.id);
      onSnackbar('Deleted', 'success');
      setConfirmDelete({ open: false, id: null });
      load();
    } catch {
      onSnackbar('Failed to delete', 'error');
      setConfirmDelete({ open: false, id: null });
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        📢 Community Announcements
      </Typography>

      {canEdit && (
        <Card sx={{ p: 3, mb: 3, border: editingId ? '2px solid #1B5E20' : 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {editingId ? '✏️ Edit Announcement' : 'Post New Announcement'}
            </Typography>
            {editingId && (
              <Button size="small" color="inherit" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </Box>
          <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message (Tamil)"
                value={form.message_tamil}
                onChange={(e) => setForm({ ...form, message_tamil: e.target.value })}
                placeholder="எ.கா. நாளை காலை கரண்ட் கட் இருக்கும்..."
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message (English)"
                value={form.message_english}
                onChange={(e) => setForm({ ...form, message_english: e.target.value })}
                placeholder="e.g. Power cut tomorrow morning..."
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                SelectProps={{ native: true }}
              >
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Priority (higher = top)"
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Expires At"
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for no expiry"
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#1B5E20', mr: 1 }}>
                {editingId ? 'Update Announcement' : 'Post Announcement'}
              </Button>
              {editingId && (
                <Button variant="outlined" color="inherit" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Card>
      )}

      <Card>
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} height={60} />)}
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No announcements yet</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Message (Tamil)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>English</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const typeInfo = TYPES.find((t) => t.id === item.type);
                  return (
                    <TableRow key={item.id} sx={editingId === item.id ? { bgcolor: '#E8F5E9' } : {}}>
                      <TableCell>
                        <Chip
                          label={typeInfo?.label || item.type}
                          size="small"
                          sx={{ bgcolor: typeInfo?.color + '22', color: typeInfo?.color, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: '"Noto Sans Tamil", sans-serif', maxWidth: 300 }}>
                        {item.message_tamil}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, fontSize: '12px' }}>
                        {item.message_english || '—'}
                      </TableCell>
                      <TableCell>
                        {canEdit ? (
                          <Switch
                            checked={item.is_active}
                            onChange={() => handleToggle(item)}
                            size="small"
                            color="success"
                          />
                        ) : (
                          <Switch
                            checked={item.is_active}
                            disabled
                            size="small"
                            color="success"
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px' }}>
                        {item.expires_at ? new Date(item.expires_at).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell align="center">
                        {canEdit && (
                          <>
                            <IconButton
                              size="small"
                              sx={{ color: '#1B5E20' }}
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setConfirmDelete({ open: true, id: item.id })}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default Announcements;
