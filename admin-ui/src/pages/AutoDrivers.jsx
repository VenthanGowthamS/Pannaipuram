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

const AutoDrivers = ({ onSnackbar }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name_tamil: '',
    name_english: '',
    phone: '',
    vehicle_type: 'auto',
    coverage_tamil: '',
    schedule_tamil: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const vehicleTypes = [
    { id: 'auto', label: '🚙 Auto', emoji: '🚙' },
    { id: 'van', label: '🚐 Van', emoji: '🚐' },
    { id: 'taxi', label: '🚕 Taxi', emoji: '🚕' },
  ];

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await api.getAutoDrivers();
      setDrivers(data || []);
    } catch (error) {
      onSnackbar('Failed to load drivers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (
      !form.name_tamil ||
      !form.name_english ||
      !form.phone ||
      !form.vehicle_type
    ) {
      onSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      if (editingId) {
        await api.updateAutoDriver(editingId, form);
        onSnackbar('Driver updated successfully', 'success');
        setEditingId(null);
      } else {
        await api.addAutoDriver(form);
        onSnackbar('Driver added successfully', 'success');
      }
      setForm({
        name_tamil: '',
        name_english: '',
        phone: '',
        vehicle_type: 'auto',
        coverage_tamil: '',
        schedule_tamil: '',
      });
      loadDrivers();
    } catch (error) {
      onSnackbar(
        editingId ? 'Failed to update driver' : 'Failed to add driver',
        'error'
      );
    }
  };

  const handleEdit = (driver) => {
    setEditingId(driver.id);
    setForm({
      name_tamil: driver.name_tamil,
      name_english: driver.name_english,
      phone: driver.phone,
      vehicle_type: driver.vehicle_type,
      coverage_tamil: driver.coverage_tamil || '',
      schedule_tamil: driver.schedule_tamil || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      name_tamil: '',
      name_english: '',
      phone: '',
      vehicle_type: 'auto',
      coverage_tamil: '',
      schedule_tamil: '',
    });
  };

  const handleDelete = async () => {
    try {
      await api.deleteAutoDriver(confirmDelete.id);
      onSnackbar('Driver deleted', 'success');
      setConfirmDelete({ open: false, id: null });
      loadDrivers();
    } catch (error) {
      onSnackbar('Failed to delete driver', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        🚗 Auto/Van Drivers Management
      </Typography>

      {/* Add Form */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {editingId ? 'Edit Driver' : 'Add New Driver'}
        </Typography>
        <Box component="form" onSubmit={handleAddDriver}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name (Tamil)"
                value={form.name_tamil}
                onChange={(e) =>
                  setForm({ ...form, name_tamil: e.target.value })
                }
                placeholder="பெயர்..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name (English)"
                value={form.name_english}
                onChange={(e) =>
                  setForm({ ...form, name_english: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                placeholder="e.g., 9876543210"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Vehicle Type"
                value={form.vehicle_type}
                onChange={(e) =>
                  setForm({ ...form, vehicle_type: e.target.value })
                }
                SelectProps={{
                  native: true,
                }}
              >
                {vehicleTypes.map((vt) => (
                  <option key={vt.id} value={vt.id}>
                    {vt.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Coverage Area (Tamil)"
                value={form.coverage_tamil}
                onChange={(e) =>
                  setForm({ ...form, coverage_tamil: e.target.value })
                }
                placeholder="பகுதி..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Schedule (Tamil)"
                value={form.schedule_tamil}
                onChange={(e) =>
                  setForm({ ...form, schedule_tamil: e.target.value })
                }
                placeholder="6:00 AM - 9:00 PM"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ bgcolor: '#1B5E20' }}
                >
                  {editingId ? 'Update Driver' : 'Add Driver'}
                </Button>
                {editingId && (
                  <Button onClick={handleCancel} color="inherit">
                    Cancel
                  </Button>
                )}
              </Box>
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
          ) : drivers.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No drivers recorded
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Name (Tamil)</TableCell>
                  <TableCell>Name (English)</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Coverage</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drivers.map((driver) => {
                  const typeInfo = vehicleTypes.find(
                    (vt) => vt.id === driver.vehicle_type
                  );
                  return (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <Chip
                          label={typeInfo?.label || driver.vehicle_type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{driver.name_tamil}</TableCell>
                      <TableCell>{driver.name_english}</TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>{driver.coverage_tamil}</TableCell>
                      <TableCell>{driver.schedule_tamil}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(driver)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setConfirmDelete({ open: true, id: driver.id })
                          }
                          title="Delete"
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
        title="Delete Driver"
        message="Are you sure you want to delete this driver?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default AutoDrivers;
