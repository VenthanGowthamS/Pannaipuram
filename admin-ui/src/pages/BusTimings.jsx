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
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const BusTimings = ({ onSnackbar }) => {
  const [corridors, setCorridors] = useState([]);
  const [timings, setTimings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCorridor, setSelectedCorridor] = useState('');
  const [form, setForm] = useState({
    corridor_id: '',
    departs_at: '',
    days_of_week: 'Mon-Sun',
    bus_type: 'ordinary',
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

  const handleAddTiming = async (e) => {
    e.preventDefault();
    if (!form.departs_at || !selectedCorridor) {
      onSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      await api.addBusTiming({
        ...form,
        corridor_id: selectedCorridor,
      });
      onSnackbar('Bus timing added successfully', 'success');
      setForm({
        corridor_id: selectedCorridor,
        departs_at: '',
        days_of_week: 'Mon-Sun',
        bus_type: 'ordinary',
        is_last_bus: false,
      });
      loadTimings(selectedCorridor);
    } catch (error) {
      onSnackbar('Failed to add bus timing', 'error');
    }
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

      {/* Add Form */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add New Bus Timing
        </Typography>
        <Box component="form" onSubmit={handleAddTiming}>
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
                label="Days of Week"
                value={form.days_of_week}
                onChange={(e) =>
                  setForm({ ...form, days_of_week: e.target.value })
                }
                placeholder="e.g., Mon-Sun, Mon-Fri"
              />
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
                <option value="ordinary">Ordinary</option>
                <option value="express">Express</option>
                <option value="setc">SETC</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: '#1B5E20' }}
              >
                Add Bus Timing
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
                      />
                    </TableCell>
                    <TableCell>{timing.days_of_week}</TableCell>
                    <TableCell>
                      {timing.is_last_bus ? '✓' : ''}
                    </TableCell>
                    <TableCell>
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
