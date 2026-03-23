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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const Doctors = ({ onSnackbar, canEdit }) => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    hospital_id: '',
    name_tamil: '',
    name_english: '',
    specialisation: '',
  });
  const [scheduleDialog, setScheduleDialog] = useState({
    open: false,
    doctorId: null,
    doctorName: '',
  });
  const [scheduleForm, setScheduleForm] = useState({
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    start_time: '09:00',
    end_time: '17:00',
    notes_tamil: '',
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const loadHospitals = async () => {
    try {
      const data = await api.getHospitals();
      setHospitals(data || []);
      // Set default hospital_id to first hospital
      if (data && data.length > 0 && !form.hospital_id) {
        setForm(prev => ({ ...prev, hospital_id: String(data[0].id) }));
      }
    } catch (error) {
      console.error('Failed to load hospitals:', error);
      // Fallback: at least show hospital 1
      setHospitals([{ id: 1, name_english: 'PTV Padmavathy Hospital' }]);
      if (!form.hospital_id) {
        setForm(prev => ({ ...prev, hospital_id: '1' }));
      }
    }
  };

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctors();
      setDoctors(data || []);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      onSnackbar('Failed to load doctors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
    loadDoctors();
  }, []);

  const resetForm = () => {
    setForm({
      hospital_id: hospitals.length > 0 ? String(hospitals[0].id) : '1',
      name_tamil: '',
      name_english: '',
      specialisation: '',
    });
    setEditingId(null);
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setForm({
      hospital_id: String(doctor.hospital_id || '1'),
      name_tamil: doctor.name_tamil || '',
      name_english: doctor.name_english || '',
      specialisation: doctor.specialisation || '',
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name_tamil || !form.name_english || !form.specialisation) {
      onSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      if (editingId) {
        // Update existing doctor
        await api.updateDoctor(editingId, {
          hospital_id: parseInt(form.hospital_id),
          name_tamil: form.name_tamil,
          name_english: form.name_english,
          specialisation: form.specialisation,
        });
        onSnackbar('Doctor updated successfully', 'success');
      } else {
        // Add new doctor
        await api.addDoctor({
          hospital_id: parseInt(form.hospital_id),
          name_tamil: form.name_tamil,
          name_english: form.name_english,
          specialisation: form.specialisation,
        });
        onSnackbar('Doctor added successfully', 'success');
      }
      resetForm();
      loadDoctors();
    } catch (error) {
      console.error('Doctor save error:', error);
      onSnackbar(error.message || (editingId ? 'Failed to update doctor' : 'Failed to add doctor'), 'error');
    }
  };

  const handleAddSchedule = async () => {
    if (scheduleForm.days.length === 0) {
      onSnackbar('Please select at least one day', 'warning');
      return;
    }
    if (!scheduleForm.start_time || !scheduleForm.end_time) {
      onSnackbar('Please fill in start and end times', 'warning');
      return;
    }
    if (scheduleForm.start_time >= scheduleForm.end_time) {
      onSnackbar('End time must be after start time', 'warning');
      return;
    }

    try {
      const promises = scheduleForm.days.map(day =>
        api.addDoctorSchedule(scheduleDialog.doctorId, {
          day_of_week: day,
          start_time: scheduleForm.start_time,
          end_time: scheduleForm.end_time,
          notes_tamil: scheduleForm.notes_tamil,
        })
      );
      await Promise.all(promises);
      onSnackbar('Schedule added successfully', 'success');
      setScheduleDialog({ open: false, doctorId: null, doctorName: '' });
      setScheduleForm({
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        start_time: '09:00',
        end_time: '17:00',
        notes_tamil: '',
      });
      loadDoctors();
    } catch (error) {
      console.error('Schedule add error:', error);
      onSnackbar(error.message || 'Failed to add schedule', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteDoctor(confirmDelete.id);
      onSnackbar('Doctor deleted', 'success');
      setConfirmDelete({ open: false, id: null });
      loadDoctors();
    } catch (error) {
      onSnackbar('Failed to delete doctor', 'error');
    }
  };

  const getHospitalName = (hospitalId) => {
    const h = hospitals.find(h => h.id === hospitalId);
    return h ? h.name_english : `Hospital #${hospitalId}`;
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        🏥 Doctors Management
      </Typography>

      {/* Add / Edit Form */}
      {canEdit && (
        <Card sx={{ p: 3, mb: 3, border: editingId ? '2px solid #1B5E20' : 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {editingId ? '✏️ Edit Doctor' : '➕ Add New Doctor'}
            </Typography>
            {editingId && (
              <Button size="small" color="inherit" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </Box>
          <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Hospital"
                value={form.hospital_id}
                onChange={(e) =>
                  setForm({ ...form, hospital_id: e.target.value })
                }
                SelectProps={{
                  native: true,
                }}
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>{h.name_english}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name (Tamil)"
                value={form.name_tamil}
                onChange={(e) =>
                  setForm({ ...form, name_tamil: e.target.value })
                }
                placeholder="டாக்டர் பெயர்..."
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
                placeholder="Dr. Name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Specialisation"
                value={form.specialisation}
                onChange={(e) =>
                  setForm({ ...form, specialisation: e.target.value })
                }
                placeholder="e.g., பொது மருத்துவம் (General Medicine)"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: '#1B5E20', mr: 1 }}
              >
                {editingId ? 'Update Doctor' : 'Add Doctor'}
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
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={60} />
              ))}
            </Box>
          ) : doctors.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No doctors recorded — use the form above to add doctors
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Hospital</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name (Tamil)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name (English)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Specialisation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id} sx={editingId === doctor.id ? { bgcolor: '#E8F5E9' } : {}}>
                    <TableCell>
                      <Chip
                        label={getHospitalName(doctor.hospital_id)}
                        size="small"
                        sx={{
                          bgcolor: doctor.hospital_id === 1 ? '#FFEBEE' : '#FFF3E0',
                          color: doctor.hospital_id === 1 ? '#B71C1C' : '#E65100',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"Noto Sans Tamil", sans-serif' }}>
                      {doctor.name_tamil}
                    </TableCell>
                    <TableCell>{doctor.name_english}</TableCell>
                    <TableCell>
                      <Chip
                        label={doctor.specialisation}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {canEdit && (
                        <>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              setScheduleDialog({
                                open: true,
                                doctorId: doctor.id,
                                doctorName: doctor.name_english || doctor.name_tamil,
                              })
                            }
                            title="Add Schedule"
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: '#1B5E20' }}
                            onClick={() => handleEdit(doctor)}
                            title="Edit Doctor"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setConfirmDelete({ open: true, id: doctor.id })
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

      {/* Add Schedule Dialog */}
      {canEdit && (
        <Dialog
          open={scheduleDialog.open}
          onClose={() => setScheduleDialog({ open: false, doctorId: null, doctorName: '' })}
          maxWidth="sm"
          fullWidth
        >
        <DialogTitle>
          Add Schedule {scheduleDialog.doctorName ? `for ${scheduleDialog.doctorName}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Days</Typography>
              <FormGroup row>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <FormControlLabel
                    key={day}
                    control={
                      <Checkbox
                        checked={scheduleForm.days.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...scheduleForm.days, day]
                            : scheduleForm.days.filter(d => d !== day);
                          setScheduleForm({ ...scheduleForm, days: newDays });
                        }}
                        size="small"
                      />
                    }
                    label={day.substring(0, 3)}
                  />
                ))}
              </FormGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={scheduleForm.start_time}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    start_time: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={scheduleForm.end_time}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    end_time: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Tamil)"
                multiline
                rows={2}
                value={scheduleForm.notes_tamil}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    notes_tamil: e.target.value,
                  })
                }
                placeholder="e.g., காலை 9 – மாலை 5"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setScheduleDialog({ open: false, doctorId: null, doctorName: '' })
            }
            color="inherit"
          >
            Cancel
          </Button>
          <Button onClick={handleAddSchedule} variant="contained" sx={{ bgcolor: '#1B5E20' }}>
            Add Schedule
          </Button>
        </DialogActions>
      </Dialog>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor? This will also delete all their schedules."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default Doctors;
