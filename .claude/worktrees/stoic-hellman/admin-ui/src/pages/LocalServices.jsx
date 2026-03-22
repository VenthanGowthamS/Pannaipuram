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
  FormControlLabel,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const CATEGORIES = [
  { id: 'milk',        emoji: '🥛', tamil: 'பால் காரர்',        english: 'Milk Man' },
  { id: 'post',        emoji: '📮', tamil: 'தபால்காரர்',         english: 'Postman' },
  { id: 'flower',      emoji: '🌺', tamil: 'பூ காரர்',           english: 'Flower Seller' },
  { id: 'plumber',     emoji: '🔧', tamil: 'குழாய்காரர்',        english: 'Plumber' },
  { id: 'electrician', emoji: '⚡', tamil: 'மின் தொழிலாளி',     english: 'Electrician' },
  { id: 'other',       emoji: '🛠', tamil: 'மற்றவை',             english: 'Others' },
];

const getCategoryInfo = (id) =>
  CATEGORIES.find((c) => c.id === id) || { emoji: '?', tamil: id, english: id };

const LocalServices = ({ onSnackbar }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name_tamil || !form.phone) {
      onSnackbar('Please fill in Tamil name and phone number', 'warning');
      return;
    }
    try {
      await api.addLocalService(form);
      onSnackbar('Service contact added!', 'success');
      setForm({
        category: form.category,
        name_tamil: '',
        name_english: '',
        phone: '',
        area_tamil: '',
        area_english: '',
        notes_tamil: '',
        display_order: '0',
      });
      loadServices();
    } catch {
      onSnackbar('Failed to add service contact', 'error');
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

      {/* Add Form */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add Service Contact</Typography>
        <Box component="form" onSubmit={handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                SelectProps={{ native: true }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.english} — {c.tamil}
                  </option>
                ))}
              </TextField>
            </Grid>
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
              <Button type="submit" variant="contained" sx={{ bgcolor: '#1B5E20' }}>
                Add Service Contact
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

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
                    <TableRow key={svc.id}>
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
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setConfirmDelete({ open: true, id: svc.id })}
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
        title="Delete Service Contact"
        message="Are you sure you want to delete this service contact?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default LocalServices;
