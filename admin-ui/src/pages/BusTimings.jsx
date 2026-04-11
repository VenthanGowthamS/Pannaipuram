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
  Chip,
  IconButton,
  Typography,
  Grid,
  Skeleton,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const BusTimings = ({ onSnackbar, canEdit }) => {
  const [corridors, setCorridors] = useState([]);
  const [timings, setTimings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCorridor, setSelectedCorridor] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    corridor_id: '',
    departs_at: '06:00',
    days_of_week: 'daily',
    bus_type: 'ordinary',
    operator_name: '',
    is_last_bus: false,
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const loadCorridors = async () => {
    try {
      const data = await api.getBusCorridors();
      setCorridors(data || []);
      if (data && data.length > 0) {
        setSelectedCorridor(data[0].id);
        loadTimings(data[0].id);
      }
    } catch (error) {
      onSnackbar('Failed to load corridors', 'error');
    }
  };

  const loadTimings = async (corridorId) => {
    setLoading(true);
    try {
      const data = await api.getBusTimings(corridorId);
      setTimings(data || []);
    } catch (error) {
      onSnackbar('Failed to load timings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorridors();
  }, []);

  const handleCorridorChange = (corridorId) => {
    setSelectedCorridor(corridorId);
    setForm({ ...form, corridor_id: corridorId });
    loadTimings(corridorId);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      corridor_id: selectedCorridor,
      departs_at: '06:00',
      days_of_week: 'daily',
      bus_type: 'ordinary',
      operator_name: '',
      is_last_bus: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.departs_at) {
      onSnackbar('Please select a departure time', 'warning');
      return;
    }
    if (!selectedCorridor) {
      onSnackbar('Please select a corridor', 'warning');
      return;
    }

    try {
      if (editingId) {
        // Update existing timing
        await api.updateBusTiming(editingId, {
          departs_at: form.departs_at.includes(':') && form.departs_at.split(':').length === 2
            ? form.departs_at + ':00' : form.departs_at,
          days_of_week: form.days_of_week,
          bus_type: form.bus_type,
          is_last_bus: form.is_last_bus,
        });
        onSnackbar('Bus timing updated ✅', 'success');
      } else {
        // Add new timing
        await api.addBusTiming({
          ...form,
          corridor_id: selectedCorridor,
        });
        onSnackbar('Bus timing added ✅', 'success');
      }
      resetForm();
      loadTimings(selectedCorridor);
    } catch (error) {
      onSnackbar(error.message || 'Failed to save bus timing', 'error');
    }
  };

  const handleEdit = (timing) => {
    setEditingId(timing.id);
    // Parse time: might be "06:00:00" → need "06:00"
    let time = timing.departs_at || '06:00';
    if (time.split(':').length === 3) time = time.split(':').slice(0, 2).join(':');
    setForm({
      corridor_id: selectedCorridor,
      departs_at: time,
      days_of_week: timing.days_of_week || 'daily',
      bus_type: timing.bus_type || 'ordinary',
      operator_name: timing.operator_name || '',
      is_last_bus: timing.is_last_bus || false,
    });
  };

  const handleDelete = async () => {
    try {
      await api.deleteBusTiming(confirmDelete.id);
      onSnackbar('Bus timing deleted', 'success');
      setConfirmDelete({ open: false, id: null });
      loadTimings(selectedCorridor);
    } catch (error) {
      onSnackbar('Failed to delete bus timing', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        🚌 Bus Timings Management
      </Typography>

      {/* Add/Edit Form */}
      {canEdit && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingId ? 'Edit Bus Timing' : 'Add New Bus Timing'}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Corridor"
                value={selectedCorridor}
                onChange={(e) => handleCorridorChange(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">-- Select Corridor --</option>
                {corridors.map((corridor) => (
                  <option key={corridor.id} value={corridor.id}>
                    {corridor.name_english}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departure Time"
                type="time"
                value={form.departs_at}
                onChange={(e) =>
                  setForm({ ...form, departs_at: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Days of Week"
                value={form.days_of_week}
                onChange={(e) =>
                  setForm({ ...form, days_of_week: e.target.value })
                }
                SelectProps={{ native: true }}
              >
                <option value="daily">Daily (Every day)</option>
                <option value="Mon-Fri">Weekdays (Mon-Fri)</option>
                <option value="Sat-Sun">Weekends (Sat-Sun)</option>
                <option value="Mon-Sat">Mon-Sat</option>
                <option value="Sun">Sunday only</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Bus Type"
                value={form.bus_type}
                onChange={(e) => setForm({ ...form, bus_type: e.target.value })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="ordinary">Ordinary (TNSTC)</option>
                <option value="express">Express (TNSTC)</option>
                <option value="SETC">SETC</option>
                <option value="private">Private Travels</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Operator Name (private buses only)"
                placeholder="e.g. Subam Travels, Vignesh TAT"
                value={form.operator_name}
                onChange={(e) => setForm({ ...form, operator_name: e.target.value })}
                helperText="Leave blank for TNSTC / government buses"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ bgcolor: '#1B5E20' }}
                >
                  {editingId ? 'Update Timing' : 'Add Bus Timing'}
                </Button>
                {editingId && (
                  <Button onClick={resetForm} color="inherit">
                    Cancel
                  </Button>
                )}
              </Box>
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
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={60} />
              ))}
            </Box>
          ) : timings.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No bus timings for this corridor
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Departure Time</TableCell>
                  <TableCell>Bus Type</TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Last Bus</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timings.map((timing) => (
                  <TableRow key={timing.id}>
                    <TableCell>{timing.departs_at}</TableCell>
                    <TableCell>
                      <Chip
                        label={timing.bus_type}
                        size="small"
                        variant="outlined"
                        color={timing.bus_type === 'private' ? 'secondary' : 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#666' }}>
                      {timing.operator_name || '—'}
                    </TableCell>
                    <TableCell>{timing.days_of_week}</TableCell>
                    <TableCell>
                      {timing.is_last_bus ? '✓' : ''}
                    </TableCell>
                    <TableCell>
                      {canEdit && (
                        <>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(timing)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setConfirmDelete({ open: true, id: timing.id })
                            }
                            title="Delete"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
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
        title="Delete Bus Timing"
        message="Are you sure you want to delete this bus timing?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default BusTimings;
