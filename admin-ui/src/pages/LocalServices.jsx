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
  Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

// Same keys, same order as the API (backend/src/utils/serviceCategories.js)
// and the PWA (pwa/js/more.js) — a pwa-tests check fails if they drift.
// `hint` says what belongs in the category, so "car wash" isn't filed as "Others".
export const CATEGORIES = [
  { id: 'milk',        emoji: '🥛', tamil: 'பால்',                 english: 'Milk',               hint: 'Milk delivery' },
  { id: 'grocery',     emoji: '🛒', tamil: 'மளிகை & காய்கறி',      english: 'Grocery & Vegetables', hint: 'Grocery shops, vegetables, fruits' },
  { id: 'flower',      emoji: '🌺', tamil: 'பூக்கடை',              english: 'Flowers',            hint: 'Flower shops, garlands' },
  { id: 'vehicle',     emoji: '🚗', tamil: 'வண்டி சர்வீஸ்',        english: 'Vehicle Service',    hint: 'Car / bike wash, mechanic, tyre, battery, puncture' },
  { id: 'esevai',      emoji: '🖥️', tamil: 'இ-சேவை & நெட் சென்டர்', english: 'e-Sevai & Net Centre', hint: 'Aadhaar, PAN, online forms, print / xerox' },
  { id: 'logistics',   emoji: '📦', tamil: 'பார்சல் & லாஜிஸ்டிக்ஸ்', english: 'Parcel & Logistics', hint: 'Courier, parcel, goods transport' },
  { id: 'post',        emoji: '📮', tamil: 'தபால்',                english: 'Post',               hint: 'Postman, post office' },
  { id: 'plumber',     emoji: '🔧', tamil: 'பிளம்பர்',             english: 'Plumber',            hint: 'Pipes, motor, tank' },
  { id: 'electrician', emoji: '⚡', tamil: 'எலக்ட்ரீஷியன்',        english: 'Electrician',        hint: 'Wiring, fan, light, inverter' },
  { id: 'carpenter',   emoji: '🪚', tamil: 'தச்சர்',               english: 'Carpenter',          hint: 'Doors, furniture, wood work' },
  { id: 'other',       emoji: '🛍', tamil: 'மற்றவை',               english: 'Others',             hint: 'Anything that fits nowhere above' },
];
const CATEGORY_ORDER = CATEGORIES.map((c) => c.id);

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
      // Same order villagers see in the app: by category, then display order
      const rank = (c) => { const i = CATEGORY_ORDER.indexOf(c); return i === -1 ? 99 : i; };
      setServices((data || []).slice().sort((a, b) =>
        rank(a.category) - rank(b.category) || (a.display_order || 0) - (b.display_order || 0) || a.id - b.id));
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

  // Hide a service from the app without deleting it (e.g. shop closed for a while)
  const handleToggleActive = async (svc) => {
    try {
      await api.updateLocalService(svc.id, { is_active: !svc.is_active });
      onSnackbar(svc.is_active ? 'Hidden from the app' : 'Shown in the app', 'success');
      loadServices();
    } catch (error) {
      onSnackbar(error.message || 'Failed to update', 'error');
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
            <Typography sx={{ fontSize: 12, color: '#666', mt: -1, mb: 2 }}>
              {getCategoryInfo(form.category).emoji} {getCategoryInfo(form.category).english}: {getCategoryInfo(form.category).hint}
            </Typography>

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
                  multiline
                  rows={2}
                  label="More Details (Tamil) — shown in the app 📝"
                  value={form.notes_tamil}
                  onChange={(e) => setForm({ ...form, notes_tamil: e.target.value })}
                  placeholder="எ.கா. காலை 6-8 மணி மட்டும், வீட்டுக்கு டெலிவரி உண்டு, விலை..."
                  helperText="Timing, price, delivery info etc. — appears under the service in the PWA More tab"
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
                  <TableCell sx={{ fontWeight: 600 }} align="center">In app</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((svc) => {
                  const cat = getCategoryInfo(svc.category);
                  return (
                    <TableRow key={svc.id} sx={{ ...(editingId === svc.id ? { bgcolor: '#E8F5E9' } : {}), ...(svc.is_active === false ? { opacity: 0.55 } : {}) }}>
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
                        <Tooltip title={svc.is_active === false ? 'Hidden — tap to show in the app' : 'Shown — tap to hide from the app'}>
                          <span>
                            <Switch
                              size="small"
                              checked={svc.is_active !== false}
                              disabled={!canEdit}
                              onChange={() => handleToggleActive(svc)}
                              inputProps={{ 'aria-label': `Show ${svc.name_tamil} in the app` }}
                            />
                          </span>
                        </Tooltip>
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
