import React, { useState, useEffect } from 'react';
import {
  Box, Card, TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Typography, Grid, Skeleton,
  Switch, FormControlLabel, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import api from '../api';

const EMPTY = {
  name_tamil: '', name_english: '', phone: '', vehicle_type: 'any',
  coverage_tamil: '', coverage_english: '', schedule_tamil: '', display_order: 0,
};

export default function ActingDrivers({ onSnackbar, canEdit }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getActingDrivers();
      setDrivers(data || []);
    } catch (e) {
      onSnackbar?.('Could not load acting drivers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const resetForm = () => { setForm(EMPTY); setEditingId(null); };

  const handleSubmit = async () => {
    if (!form.name_tamil || !form.phone) {
      onSnackbar?.('பெயர் (தமிழ்) and phone are required', 'warning');
      return;
    }
    const digits = String(form.phone).replace(/\D/g, '');
    if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
      onSnackbar?.('Phone must be exactly 10 digits starting 6-9', 'warning');
      return;
    }
    try {
      if (editingId) {
        await api.updateActingDriver(editingId, form);
        onSnackbar?.('Acting driver updated', 'success');
      } else {
        await api.addActingDriver(form);
        onSnackbar?.('Acting driver added', 'success');
      }
      resetForm();
      load();
    } catch (e) {
      onSnackbar?.(e.message || 'Save failed', 'error');
    }
  };

  const handleEdit = (d) => {
    setForm({
      name_tamil: d.name_tamil || '', name_english: d.name_english || '',
      phone: d.phone || '', vehicle_type: d.vehicle_type || 'any',
      coverage_tamil: d.coverage_tamil || '', coverage_english: d.coverage_english || '',
      schedule_tamil: d.schedule_tamil || '', display_order: d.display_order || 0,
    });
    setEditingId(d.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleVerified = async (d) => {
    try {
      await api.updateActingDriver(d.id, { phone_verified: !d.phone_verified });
      load();
    } catch (e) { onSnackbar?.('Update failed', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await api.deleteActingDriver(confirmDelete.id);
      onSnackbar?.('Deleted', 'success');
      setConfirmDelete(null);
      load();
    } catch (e) { onSnackbar?.('Delete failed', 'error'); }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        🔄 Acting / Substitute Drivers
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Backup drivers who fill in for regular auto/van/car drivers. Shown in the PWA's "மேலும் (More)" section.
      </Typography>

      {canEdit && (
        <Card sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            {editingId ? '✏️ Edit driver' : '➕ Add driver'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="பெயர் (Tamil) *" value={form.name_tamil} onChange={handleChange('name_tamil')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name (English)" value={form.name_english} onChange={handleChange('name_english')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone (10 digits) *" value={form.phone} onChange={handleChange('phone')} size="small" inputProps={{ maxLength: 10 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Vehicle type" value={form.vehicle_type} onChange={handleChange('vehicle_type')} size="small">
                <MenuItem value="any">Any (எதுவும்)</MenuItem>
                <MenuItem value="auto">Auto</MenuItem>
                <MenuItem value="van">Van</MenuItem>
                <MenuItem value="car">Car</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="பகுதி / Coverage (Tamil)" value={form.coverage_tamil} onChange={handleChange('coverage_tamil')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="கிடைக்கும் நேரம் / Availability (Tamil)" value={form.schedule_tamil} onChange={handleChange('schedule_tamil')} size="small" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Order" type="number" value={form.display_order} onChange={handleChange('display_order')} size="small" />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleSubmit}>
              {editingId ? 'Update' : 'Add'}
            </Button>
            {editingId && <Button onClick={resetForm}>Cancel</Button>}
          </Box>
        </Card>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Coverage</TableCell>
              <TableCell>Verified</TableCell>
              {canEdit && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton /></TableCell></TableRow>
              ))
            ) : drivers.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No acting drivers yet</TableCell></TableRow>
            ) : (
              drivers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <strong>{d.name_tamil}</strong>{d.name_english ? ` · ${d.name_english}` : ''}
                  </TableCell>
                  <TableCell>{d.phone || '—'}</TableCell>
                  <TableCell><Chip size="small" label={d.vehicle_type} /></TableCell>
                  <TableCell>{d.coverage_tamil || '—'}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={<Switch size="small" checked={!!d.phone_verified} onChange={() => canEdit && toggleVerified(d)} disabled={!canEdit} />}
                      label={d.phone_verified ? 'Yes' : 'No'}
                    />
                  </TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(d)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setConfirmDelete(d)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete acting driver?</DialogTitle>
        <DialogContent>{confirmDelete?.name_tamil}</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
