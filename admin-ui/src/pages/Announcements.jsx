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
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const TYPES = [
  { id: 'info', label: 'Info', color: '#1565C0' },
  { id: 'warning', label: 'Warning', color: '#E65100' },
  { id: 'urgent', label: 'Urgent', color: '#C62828' },
  { id: 'event', label: 'Event', color: '#6A1B9A' },
];

const Announcements = ({ onSnackbar }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.message_tamil) {
      onSnackbar('Tamil message is required', 'warning');
      return;
    }
    try {
      await api.addAnnouncement({
        ...form,
        priority: parseInt(form.priority) || 0,
        expires_at: form.expires_at || null,
      });
      onSnackbar('Announcement added!', 'success');
      setForm({ message_tamil: '', message_english: '', type: 'info', priority: '0', expires_at: '' });
      load();
    } catch {
      onSnackbar('Failed to add announcement', 'error');
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

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Post New Announcement</Typography>
        <Box component="form" onSubmit={handleAdd}>
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
              <Button type="submit" variant="contained" sx={{ bgcolor: '#1B5E20' }}>
                Post Announcement
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

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
                    <TableRow key={item.id}>
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
                        <Switch
                          checked={item.is_active}
                          onChange={() => handleToggle(item)}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px' }}>
                        {item.expires_at ? new Date(item.expires_at).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setConfirmDelete({ open: true, id: item.id })}
                        >
                          <DeleteIcon />
                        </IconButton>
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
