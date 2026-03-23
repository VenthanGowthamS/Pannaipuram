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
  Divider,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalHospital as HospitalIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatSchedule = (schedules) => {
  if (!schedules || schedules.length === 0) return null;
  const slots = {};
  schedules.forEach(s => {
    const start = s.start_time ? s.start_time.slice(0, 5) : '??';
    const end = s.end_time ? s.end_time.slice(0, 5) : '??';
    const key = `${start}-${end}`;
    if (!slots[key]) slots[key] = [];
    const dayNum = typeof s.day_of_week === 'number' ? s.day_of_week : parseInt(s.day_of_week);
    slots[key].push(DAY_NAMES[dayNum] || `D${dayNum}`);
  });
  return Object.entries(slots).map(([time, days]) => `${days.join(', ')}: ${time}`);
};

const Doctors = ({ onSnackbar, canEdit }) => {
  // ── State ────────────────────────────────────────────────
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hospital form
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState(null);
  const [hospitalForm, setHospitalForm] = useState({
    name_tamil: '', name_english: '', address_tamil: '',
    phone_casualty: '', phone_ambulance: '', phone_general: '', pharmacy_hours: '',
  });

  // Doctor form
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    hospital_id: '', name_tamil: '', name_english: '', specialisation: '',
  });

  // Schedule dialog
  const [scheduleDialog, setScheduleDialog] = useState({
    open: false, doctorId: null, doctorName: '', existingSchedules: [],
  });
  const [scheduleForm, setScheduleForm] = useState({
    days: [1, 2, 3, 4, 5, 6], // Mon-Sat as integers
    start_time: '09:00',
    end_time: '17:00',
    notes_tamil: '',
  });

  // Confirm dialogs
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, type: '' });

  // ── Data Loading ─────────────────────────────────────────
  const loadHospitals = async () => {
    try {
      const data = await api.getHospitals();
      setHospitals(data || []);
      if (data && data.length > 0 && !doctorForm.hospital_id) {
        setDoctorForm(prev => ({ ...prev, hospital_id: String(data[0].id) }));
      }
    } catch (error) {
      console.error('Failed to load hospitals:', error);
      setHospitals([]);
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

  // ── Hospital Handlers ────────────────────────────────────
  const resetHospitalForm = () => {
    setHospitalForm({
      name_tamil: '', name_english: '', address_tamil: '',
      phone_casualty: '', phone_ambulance: '', phone_general: '', pharmacy_hours: '',
    });
    setEditingHospitalId(null);
  };

  const handleEditHospital = (h) => {
    setEditingHospitalId(h.id);
    setHospitalForm({
      name_tamil: h.name_tamil || '',
      name_english: h.name_english || '',
      address_tamil: h.address_tamil || '',
      phone_casualty: h.phone_casualty || '',
      phone_ambulance: h.phone_ambulance || '',
      phone_general: h.phone_general || '',
      pharmacy_hours: h.pharmacy_hours || '',
    });
    setShowHospitalForm(true);
  };

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    if (!hospitalForm.name_tamil || !hospitalForm.name_english) {
      onSnackbar('Hospital name (Tamil + English) required', 'warning');
      return;
    }
    try {
      if (editingHospitalId) {
        await api.updateHospital(editingHospitalId, hospitalForm);
        onSnackbar('Hospital updated', 'success');
      } else {
        await api.addHospital(hospitalForm);
        onSnackbar('Hospital added', 'success');
      }
      resetHospitalForm();
      loadHospitals();
      loadDoctors(); // refresh doctor list to show updated hospital names
    } catch (error) {
      onSnackbar(error.message || 'Failed to save hospital', 'error');
    }
  };

  const handleDeleteHospital = async () => {
    try {
      await api.deleteHospital(confirmDelete.id);
      onSnackbar('Hospital deleted', 'success');
      setConfirmDelete({ open: false, id: null, type: '' });
      loadHospitals();
      loadDoctors();
    } catch (error) {
      onSnackbar(error.message || 'Failed to delete hospital', 'error');
      setConfirmDelete({ open: false, id: null, type: '' });
    }
  };

  // ── Doctor Handlers ──────────────────────────────────────
  const resetDoctorForm = () => {
    setDoctorForm({
      hospital_id: hospitals.length > 0 ? String(hospitals[0].id) : '',
      name_tamil: '', name_english: '', specialisation: '',
    });
    setEditingDoctorId(null);
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctorId(doctor.id);
    setDoctorForm({
      hospital_id: String(doctor.hospital_id || ''),
      name_tamil: doctor.name_tamil || '',
      name_english: doctor.name_english || '',
      specialisation: doctor.specialisation || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!doctorForm.name_tamil || !doctorForm.name_english) {
      onSnackbar('Doctor name (Tamil + English) required', 'warning');
      return;
    }
    if (!doctorForm.hospital_id) {
      onSnackbar('Please select a hospital', 'warning');
      return;
    }
    try {
      const payload = {
        hospital_id: parseInt(doctorForm.hospital_id),
        name_tamil: doctorForm.name_tamil,
        name_english: doctorForm.name_english,
        specialisation: doctorForm.specialisation,
      };
      if (editingDoctorId) {
        await api.updateDoctor(editingDoctorId, payload);
        onSnackbar('Doctor updated', 'success');
      } else {
        await api.addDoctor(payload);
        onSnackbar('Doctor added', 'success');
      }
      resetDoctorForm();
      loadDoctors();
    } catch (error) {
      onSnackbar(error.message || 'Failed to save doctor', 'error');
    }
  };

  const handleDeleteDoctor = async () => {
    try {
      await api.deleteDoctor(confirmDelete.id);
      onSnackbar('Doctor deleted', 'success');
      setConfirmDelete({ open: false, id: null, type: '' });
      loadDoctors();
    } catch (error) {
      onSnackbar(error.message || 'Failed to delete doctor', 'error');
      setConfirmDelete({ open: false, id: null, type: '' });
    }
  };

  // ── Schedule Handlers ────────────────────────────────────
  const openScheduleDialog = (doctor) => {
    // Pre-fill from existing schedules if any
    const existing = doctor.schedules || [];
    if (existing.length > 0) {
      const days = existing.map(s => typeof s.day_of_week === 'number' ? s.day_of_week : parseInt(s.day_of_week));
      const uniqueDays = [...new Set(days)];
      const firstSchedule = existing[0];
      setScheduleForm({
        days: uniqueDays,
        start_time: firstSchedule.start_time ? firstSchedule.start_time.slice(0, 5) : '09:00',
        end_time: firstSchedule.end_time ? firstSchedule.end_time.slice(0, 5) : '17:00',
        notes_tamil: firstSchedule.notes_tamil || '',
      });
    } else {
      setScheduleForm({
        days: [1, 2, 3, 4, 5, 6],
        start_time: '09:00',
        end_time: '17:00',
        notes_tamil: '',
      });
    }
    setScheduleDialog({
      open: true,
      doctorId: doctor.id,
      doctorName: doctor.name_english || doctor.name_tamil,
      existingSchedules: existing,
    });
  };

  const handleReplaceSchedule = async () => {
    if (scheduleForm.days.length === 0) {
      onSnackbar('Select at least one day', 'warning');
      return;
    }
    if (!scheduleForm.start_time || !scheduleForm.end_time) {
      onSnackbar('Start and end times required', 'warning');
      return;
    }
    if (scheduleForm.start_time >= scheduleForm.end_time) {
      onSnackbar('End time must be after start time', 'warning');
      return;
    }
    try {
      const schedules = scheduleForm.days.map(dayNum => ({
        day_of_week: dayNum,
        start_time: scheduleForm.start_time,
        end_time: scheduleForm.end_time,
        notes_tamil: scheduleForm.notes_tamil || null,
      }));
      await api.replaceDoctorSchedule(scheduleDialog.doctorId, schedules);
      onSnackbar('Schedule saved', 'success');
      setScheduleDialog({ open: false, doctorId: null, doctorName: '', existingSchedules: [] });
      loadDoctors();
    } catch (error) {
      onSnackbar(error.message || 'Failed to save schedule', 'error');
    }
  };

  const handleClearSchedule = async (doctorId) => {
    try {
      await api.clearDoctorSchedule(doctorId);
      onSnackbar('Schedule cleared', 'success');
      setScheduleDialog({ open: false, doctorId: null, doctorName: '', existingSchedules: [] });
      loadDoctors();
    } catch (error) {
      onSnackbar(error.message || 'Failed to clear schedule', 'error');
    }
  };

  const getHospitalName = (hospitalId) => {
    const h = hospitals.find(h => h.id === hospitalId);
    return h ? h.name_english : `Hospital #${hospitalId}`;
  };

  const toggleDay = (dayNum) => {
    setScheduleForm(prev => ({
      ...prev,
      days: prev.days.includes(dayNum)
        ? prev.days.filter(d => d !== dayNum)
        : [...prev.days, dayNum].sort(),
    }));
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          🏥 Doctors & Hospitals
        </Typography>
        <Button size="small" startIcon={<RefreshIcon />} onClick={() => { loadHospitals(); loadDoctors(); }}>
          Refresh
        </Button>
      </Box>

      {/* ═══ HOSPITAL SECTION ═══ */}
      {canEdit && (
        <Card sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              <HospitalIcon sx={{ fontSize: 20, mr: 0.5, verticalAlign: 'text-bottom' }} />
              Hospitals ({hospitals.length})
            </Typography>
            <Button
              size="small"
              onClick={() => { setShowHospitalForm(!showHospitalForm); if (showHospitalForm) resetHospitalForm(); }}
              startIcon={showHospitalForm ? <ExpandLessIcon /> : <AddIcon />}
            >
              {showHospitalForm ? 'Close' : 'Add Hospital'}
            </Button>
          </Box>

          {/* Hospital list chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
            {hospitals.map(h => (
              <Chip
                key={h.id}
                label={`${h.name_english}${h.address_tamil ? ' — ' + h.address_tamil : ''}`}
                size="small"
                variant="outlined"
                onDelete={canEdit ? () => setConfirmDelete({ open: true, id: h.id, type: 'hospital' }) : undefined}
                onClick={() => handleEditHospital(h)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#E8F5E9' } }}
              />
            ))}
            {hospitals.length === 0 && (
              <Typography variant="body2" color="textSecondary">No hospitals — add one first</Typography>
            )}
          </Box>

          {/* Hospital add/edit form */}
          <Collapse in={showHospitalForm}>
            <Divider sx={{ my: 2 }} />
            <Box component="form" onSubmit={handleHospitalSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Name (Tamil) *" value={hospitalForm.name_tamil}
                    onChange={e => setHospitalForm({ ...hospitalForm, name_tamil: e.target.value })}
                    placeholder="மருத்துவமனை பெயர்" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Name (English) *" value={hospitalForm.name_english}
                    onChange={e => setHospitalForm({ ...hospitalForm, name_english: e.target.value })}
                    placeholder="Hospital Name" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Address (Tamil)" value={hospitalForm.address_tamil}
                    onChange={e => setHospitalForm({ ...hospitalForm, address_tamil: e.target.value })}
                    placeholder="முகவரி" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label="Casualty Phone" value={hospitalForm.phone_casualty}
                    onChange={e => setHospitalForm({ ...hospitalForm, phone_casualty: e.target.value })} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label="Ambulance Phone" value={hospitalForm.phone_ambulance}
                    onChange={e => setHospitalForm({ ...hospitalForm, phone_ambulance: e.target.value })} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label="General Phone" value={hospitalForm.phone_general}
                    onChange={e => setHospitalForm({ ...hospitalForm, phone_general: e.target.value })} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" label="Pharmacy Hours" value={hospitalForm.pharmacy_hours}
                    onChange={e => setHospitalForm({ ...hospitalForm, pharmacy_hours: e.target.value })}
                    placeholder="8am-8pm" />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" size="small" sx={{ bgcolor: '#1B5E20', mr: 1 }}>
                    {editingHospitalId ? 'Update Hospital' : 'Add Hospital'}
                  </Button>
                  {editingHospitalId && (
                    <Button size="small" color="inherit" onClick={resetHospitalForm}>Cancel</Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Card>
      )}

      {/* ═══ ADD/EDIT DOCTOR FORM ═══ */}
      {canEdit && (
        <Card sx={{ p: 3, mb: 3, border: editingDoctorId ? '2px solid #1B5E20' : 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {editingDoctorId ? '✏️ Edit Doctor' : '➕ Add New Doctor'}
            </Typography>
            {editingDoctorId && (
              <Button size="small" color="inherit" onClick={resetDoctorForm}>Cancel Edit</Button>
            )}
          </Box>
          {hospitals.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No hospitals found. Add a hospital first before adding doctors.
            </Alert>
          )}
          <Box component="form" onSubmit={handleDoctorSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Hospital *" value={doctorForm.hospital_id}
                  onChange={e => setDoctorForm({ ...doctorForm, hospital_id: e.target.value })}
                  SelectProps={{ native: true }} disabled={hospitals.length === 0}>
                  <option value="">-- Select Hospital --</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name_english}</option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Name (Tamil) *" value={doctorForm.name_tamil}
                  onChange={e => setDoctorForm({ ...doctorForm, name_tamil: e.target.value })}
                  placeholder="டாக்டர் பெயர்..." />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Name (English) *" value={doctorForm.name_english}
                  onChange={e => setDoctorForm({ ...doctorForm, name_english: e.target.value })}
                  placeholder="Dr. Name" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Specialisation" value={doctorForm.specialisation}
                  onChange={e => setDoctorForm({ ...doctorForm, specialisation: e.target.value })}
                  placeholder="e.g., பொது மருத்துவம் (General Medicine)" />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" sx={{ bgcolor: '#1B5E20', mr: 1 }}
                  disabled={hospitals.length === 0}>
                  {editingDoctorId ? 'Update Doctor' : 'Add Doctor'}
                </Button>
                {editingDoctorId && (
                  <Button variant="outlined" color="inherit" onClick={resetDoctorForm}>Cancel</Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </Card>
      )}

      {/* ═══ DOCTORS TABLE ═══ */}
      <Card>
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} height={60} />)}
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
                  <TableCell sx={{ fontWeight: 600 }}>Schedule</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctors.map(doctor => (
                  <TableRow key={doctor.id}
                    sx={editingDoctorId === doctor.id ? { bgcolor: '#E8F5E9' } : {}}>
                    <TableCell>
                      <Chip label={getHospitalName(doctor.hospital_id)} size="small"
                        sx={{ bgcolor: '#FFEBEE', color: '#B71C1C', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"Noto Sans Tamil", sans-serif' }}>
                      {doctor.name_tamil}
                    </TableCell>
                    <TableCell>{doctor.name_english}</TableCell>
                    <TableCell>
                      {doctor.specialisation ? (
                        <Chip label={doctor.specialisation} size="small" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="textSecondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const lines = formatSchedule(doctor.schedules);
                        if (!lines) return (
                          <Typography variant="caption" color="textSecondary">
                            No schedule
                          </Typography>
                        );
                        return lines.map((line, idx) => (
                          <Typography key={idx} variant="caption" sx={{ display: 'block', fontSize: '11px' }}>
                            {line}
                          </Typography>
                        ));
                      })()}
                    </TableCell>
                    <TableCell align="center">
                      {canEdit && (
                        <>
                          <IconButton size="small" color="primary"
                            onClick={() => openScheduleDialog(doctor)} title="Set Schedule">
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#1B5E20' }}
                            onClick={() => handleEditDoctor(doctor)} title="Edit Doctor">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error"
                            onClick={() => setConfirmDelete({ open: true, id: doctor.id, type: 'doctor' })}
                            title="Delete Doctor">
                            <DeleteIcon fontSize="small" />
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

      {/* ═══ SCHEDULE DIALOG ═══ */}
      {canEdit && (
        <Dialog open={scheduleDialog.open}
          onClose={() => setScheduleDialog({ open: false, doctorId: null, doctorName: '', existingSchedules: [] })}
          maxWidth="sm" fullWidth>
          <DialogTitle>
            {scheduleDialog.existingSchedules.length > 0 ? 'Replace' : 'Set'} Schedule
            {scheduleDialog.doctorName ? ` — ${scheduleDialog.doctorName}` : ''}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {scheduleDialog.existingSchedules.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This doctor already has a schedule. Saving will replace all existing entries.
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Days</Typography>
                <FormGroup row>
                  {DAY_FULL_NAMES.map((dayName, idx) => (
                    <FormControlLabel key={idx}
                      control={
                        <Checkbox checked={scheduleForm.days.includes(idx)}
                          onChange={() => toggleDay(idx)} size="small" />
                      }
                      label={dayName.substring(0, 3)} />
                  ))}
                </FormGroup>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Start Time" type="time"
                  InputLabelProps={{ shrink: true }}
                  value={scheduleForm.start_time}
                  onChange={e => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="End Time" type="time"
                  InputLabelProps={{ shrink: true }}
                  value={scheduleForm.end_time}
                  onChange={e => setScheduleForm({ ...scheduleForm, end_time: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Notes (Tamil)" multiline rows={2}
                  value={scheduleForm.notes_tamil}
                  onChange={e => setScheduleForm({ ...scheduleForm, notes_tamil: e.target.value })}
                  placeholder="e.g., காலை 9 – மாலை 5" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            {scheduleDialog.existingSchedules.length > 0 && (
              <Button onClick={() => handleClearSchedule(scheduleDialog.doctorId)}
                color="error" startIcon={<ClearIcon />} sx={{ mr: 'auto' }}>
                Clear All
              </Button>
            )}
            <Button onClick={() => setScheduleDialog({ open: false, doctorId: null, doctorName: '', existingSchedules: [] })}
              color="inherit">
              Cancel
            </Button>
            <Button onClick={handleReplaceSchedule} variant="contained" sx={{ bgcolor: '#1B5E20' }}>
              {scheduleDialog.existingSchedules.length > 0 ? 'Replace Schedule' : 'Save Schedule'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ═══ CONFIRM DELETE DIALOG ═══ */}
      <ConfirmDialog
        open={confirmDelete.open}
        title={confirmDelete.type === 'hospital' ? 'Delete Hospital' : 'Delete Doctor'}
        message={confirmDelete.type === 'hospital'
          ? 'Are you sure? You can only delete a hospital if no doctors are linked to it.'
          : 'Are you sure you want to delete this doctor? This will also delete all their schedules.'}
        onConfirm={confirmDelete.type === 'hospital' ? handleDeleteHospital : handleDeleteDoctor}
        onCancel={() => setConfirmDelete({ open: false, id: null, type: '' })}
      />
    </Box>
  );
};

export default Doctors;
