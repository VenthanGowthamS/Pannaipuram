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
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const CATEGORIES = [
  { id: 'milk',        emoji: '🥛', tamil: 'பால் விற்பனையாளர்', english: 'Milk Man' },
  { id: 'post',        emoji: '📮', tamil: 'தபால்காரர்',          english: 'Postman' },
  { id: 'flower',      emoji: '🌺', tamil: 'பூ விற்பனையாளர்',    english: 'Flower Seller' },
  { id: 'plumber',     emoji: '🔧', tamil: 'குழாய் சரி செய்பவர்', english: 'Plumber' },
  { id: 'electrician', emoji: '⚡', tamil: 'மின் தொழிலாளி',      english: 'Electrician' },
  { id: 'other',       emoji: '🛠', tamil: 'மற்றவை',              english: 'Others' },
];

const getCategoryInfo = (id) =>
  CATEGORIES.find((c) => c.id === id) || { emoji: '?', tamil: id, english: id };

const LocalServices = ({ onSnackbar, canEdit }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    category: 'milk',
    name_tamil: '',
    name_english: '',
    phone: '',
    area_tamil: '',
    area_english: '',
    notes_tamil: '',
    display_order: '0',
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await api.getLocalServices();
      setServices(data || []);
    } catch {
      onSnackbar('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices(); }, []);

  const resetForm = () => {
    setForm({
      category: 'milk',
      name_tamil: '',
      name_english: '',
      phone: '',
      area_tamil: '',
      area_english: '',
      notes_tamil: '',
      display_order: '0',
    });
    setEditingId(null);
  };

  const handleEdit = (svc) => {
    setEditingId(svc.id);
    setForm({
      category: svc.category || 'milk',
      name_tamil: svc.name_tamil || '',
      name_english: svc.name_english || '',
      phone: svc.phone || '',
      area_tamil: svc.area_tamil || '',
      area_english: svc.area_english || '',
      notes_tamil: svc.notes_tamil || '',
      display_order: String(svc.display_order || 0),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name_tamil || !form.phone) {
      onSnackbar('Please fill in Tamil name and phone number', 'warning');
      return;
    }
    try {
      if (editingId) {
        await api.updateLocalService(editingId, {
          ...form,
          display_order: parseInt(form.display_order) || 0,
        });
        onSnackbar('Service contact updated!', 'success');
      } else {
        await api.addLocalService(form);
        onSnackbar('Service contact added!', 'success');
      }
      resetForm();
      loadServices();
    } catch (error) {
      onSnackbar(error.message || (editingId ? 'Failed to update service' : 'Failed to add service contact'), 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteLocalService(confirmDelete.id);
      onSnackbar('Deleted', 'success');
      setConfirmDelete({ open: false, id: null });
      loadServices();
    } catch {
      onSnackbar('Failed to delete', 'error');
      setConfirmDelete({ open: false, id: null });
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        🛍 Local Services Management
      </Typography>

      {/* Add / Edit Form */}
      {canEdit && (
        <Card sx={{ p: 3, mb: 3, border: editingId ? '2px solid #1B5E20' : 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {editingId ? '✏️ Edit Service Contact' : 'Add Service Contact'}
            </Typography>
            {editingId && (
              <Button size="small" color="inherit" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </Box>
          <Box component="form" onSubmit={handleSubmit}>

            {/* ── Category Horizontal Scroll Tabs ── */}
            <Typography variant="body2" sx={{ mb: 1, color: '#555', fontWeight: 600 }}>
              Category
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 1,
                mb: 2,
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 2 },
              }}
            >
              {CATEGORIES.map((cat) => {
                const selected = form.category === cat.id;
                return (
                  <Box
                    key={cat.id}
                    onClick={() => setForm({ ...form, category: cat.id })}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 88,
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      border: selected ? '2px solid #1B5E20' : '2px solid #e0e0e0',
                      bgcolor: selected ? '#E8F5E9' : '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      userSelect: 'none',
                      '&:hover': { borderColor: '#388E3C', bgcolor: '#F1F8E9' },
                    }}
                  >
                    <Typography sx={{ fontSize: 22, lineHeight: 1.2 }}>{cat.emoji}</Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontFamily: '"Noto Sans Tamil", sans-serif',
                        fontWeight: selected ? 700 : 400,
                        color: selected ? '#1B5E20' : '#555',
                        textAlign: 'center',
                        mt: 0.4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cat.tamil}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 10, color: selected ? '#2E7D32' : '#999', textAlign: 'center' }}
                    >
                      {cat.english}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* ── Rest of Form ── */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name (Tamil)"
                  value={form.name_tamil}
                  onChange={(e) => setForm({ ...form, name_tamil: e.target.value })}
                  placeholder="தமிழ் பெயர்..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name (English)"
                  value={form.name_english}
                  onChange={(e) => setForm({ ...form, name_english: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Area Covered (Tamil)"
                  value={form.area_tamil}
                  onChange={(e) => setForm({ ...form, area_tamil: e.target.value })}
                  placeholder="எ.கா. முழு ஊர், 1-5 வார்டு..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Area Covered (English)"
                  value={form.area_english}
                  onChange={(e) => setForm({ ...form, area_english: e.target.value })}
                  placeholder="e.g. Whole village, Ward 1-5..."
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Notes (Tamil)"
                  value={form.notes_tamil}
                  onChange={(e) => setForm({ ...form, notes_tamil: e.target.value })}
                  placeholder="எ.கா. காலை 6-8 மணி மட்டும்..."
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Display Order"
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" sx={{ bgcolor: '#1B5E20', mr: 1 }}>
                  {editingId ? 'Update Service Contact' : 'Add Service Contact'}
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

      {/* Data Table */}
      <Card>
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} height={60} />)}
            </Box>
          ) : services.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No service contacts yet</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name (Tamil)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name (English)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Area</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((svc) => {
                  const cat = getCategoryInfo(svc.category);
                  return (
                    <TableRow key={svc.id} sx={editingId === svc.id ? { bgcolor: '#E8F5E9' } : {}}>
                      <TableCell>
                        <Chip
                          label={`${cat.emoji} ${cat.english}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: '"Noto Sans Tamil", sans-serif' }}>
                        {svc.name_tamil}
                      </TableCell>
                      <TableCell>{svc.name_english || '—'}</TableCell>
                      <TableCell>
                        <strong>{svc.phone}</strong>
                      </TableCell>
                      <TableCell sx={{ fontFamily: '"Noto Sans Tamil", sans-serif', fontSize: '12px' }}>
                        {svc.area_tamil || '—'}
                      </TableCell>
                      <TableCell align="center">
                        {canEdit && (
                          <>
                            <IconButton
                              size="small"
                              sx={{ color: '#1B5E20' }}
                              onClick={() => handleEdit(svc)}
                              title="Edit"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setConfirmDelete({ open: true, id: svc.id })}
                              title="Delete"
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
        title="Delete Service Contact"
        message="Are you sure you want to delete this service contact?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default LocalServices;
