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
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const Doctors = ({ onSnackbar }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hospital_id: '1',
    name_tamil: '',
    name_english: '',
    specialisation: '',
  });
  const [scheduleDialog, setScheduleDialog] = useState({
    open: false,
    doctorId: null,
  });
  const [scheduleForm, setScheduleForm] = useState({
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    start_time: '',
    end_time: '',
    notes_tamil: '',
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctors();
      setDoctors(data || []);
    } catch (error) {
      onSnackbar('Failed to load doctors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!form.name_tamil || !form.name_english || !form.specialisation) {
      onSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      await api.addDoctor(form);
      onSnackbar('Doctor added successfully', 'success');
      setForm({
        hospital_id: '1',
        name_tamil: '',
        name_english: '',
        specialisation: '',
      });
      loadDoctors();
    } catch (error) {
      onSnackbar('Failed to add doctor', 'error');
    }
  };

  const handleAddSchedule = async () => {
    if (!scheduleForm.start_time || !scheduleForm.end_time) {
      onSnackbar('Please fill in all time fields', 'warning');
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
      setScheduleDialog({ open: false, doctorId: null });
      setScheduleForm({
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        start_time: '',
        end_time: '',
        notes_tamil: '',
      });
      loadDoctors();
    } catch (error) {
      onSnackbar('Failed to add schedule', 'error');
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

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        🏥 Doctors Management
      </Typography>

      {/* Add Form */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add New Doctor
        </Typography>
        <Box component="form" onSubmit={handleAddDoctor}>
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
                <option value="1">PTV Hospital</option>
                <option value="2">SP Clinic</option>
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
                label="Specialisation"
                value={form.specialisation}
                onChange={(e) =>
                  setForm({ ...form, specialisation: e.target.value })
                }
                placeholder="e.g., General, Cardiology"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: '#1B5E20' }}
              >
                Add Doctor
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
          ) : doctors.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No doctors recorded
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Hospital</TableCell>
                  <TableCell>Name (Tamil)</TableCell>
                  <TableCell>Name (English)</TableCell>
                  <TableCell>Specialisation</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      {doctor.hospital_id === 1 ? 'PTV Hospital' : 'SP Clinic'}
                    </TableCell>
                    <TableCell>{doctor.name_tamil}</TableCell>
                    <TableCell>{doctor.name_english}</TableCell>
                    <TableCell>
                      <Chip
                        label={doctor.specialisation}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          setScheduleDialog({
                            open: true,
                            doctorId: doctor.id,
                          })
                        }
                        title="Add Schedule"
                      >
                        <AddIcon />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>

      {/* Add Schedule Dialog */}
      <Dialog
        open={scheduleDialog.open}
        onClose={() => setScheduleDialog({ open: false, doctorId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Doctor Schedule</DialogTitle>
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
                placeholder="குறிப்புகள்..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setScheduleDialog({ open: false, doctorId: null })
            }
            color="inherit"
          >
            Cancel
          </Button>
          <Button onClick={handleAddSchedule} variant="contained">
            Add Schedule
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default Doctors;
