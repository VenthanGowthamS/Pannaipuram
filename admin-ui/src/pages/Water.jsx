import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Typography,
  Skeleton,
  Button,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import api from '../api';

const Water = ({ onSnackbar, canEdit }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    frequency_days: '',
    supply_time: '',
    notes_tamil: '',
  });

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = await api.getWaterSchedules();
      setSchedules(data || []);
    } catch (error) {
      onSnackbar('Failed to load water schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setEditForm({
      frequency_days: schedule.frequency_days || '',
      supply_time: schedule.supply_time || '',
      notes_tamil: schedule.notes_tamil || '',
    });
  };

  const handleSave = async () => {
    if (!editForm.frequency_days || !editForm.supply_time) {
      onSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      await api.updateWaterSchedule(editingId, editForm);
      onSnackbar('Water schedule updated successfully', 'success');
      setEditingId(null);
      loadSchedules();
    } catch (error) {
      onSnackbar('Failed to update water schedule', 'error');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      frequency_days: '',
      supply_time: '',
      notes_tamil: '',
    });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        💧 Water Supply Management
      </Typography>

      {/* Data Table */}
      <Card>
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={60} />
              ))}
            </Box>
          ) : schedules.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No water schedules recorded
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Street Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Frequency (Days)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Supply Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) =>
                  editingId === schedule.id ? (
                    <TableRow key={schedule.id}>
                      <TableCell>{schedule.name_tamil || 'N/A'}</TableCell>
                      <TableCell>
                        <TextField
                          disabled={!canEdit}
                          size="small"
                          type="number"
                          value={editForm.frequency_days}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              frequency_days: e.target.value,
                            })
                          }
                          inputProps={{ min: '1', max: '30' }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          disabled={!canEdit}
                          size="small"
                          type="time"
                          value={editForm.supply_time}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              supply_time: e.target.value,
                            })
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          disabled={!canEdit}
                          size="small"
                          value={editForm.notes_tamil}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              notes_tamil: e.target.value,
                            })
                          }
                          placeholder="குறிப்பு..."
                        />
                      </TableCell>
                      <TableCell>
                        {canEdit && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={handleSave}
                              title="Save"
                            >
                              <SaveIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="inherit"
                              onClick={handleCancel}
                              title="Cancel"
                            >
                              <CloseIcon />
                            </IconButton>
                          </>
                        )}
                        {!canEdit && (
                          <IconButton
                            size="small"
                            color="inherit"
                            onClick={handleCancel}
                            title="Cancel"
                          >
                            <CloseIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={schedule.id}>
                      <TableCell>{schedule.name_tamil || 'N/A'}</TableCell>
                      <TableCell>{schedule.frequency_days || 'N/A'}</TableCell>
                      <TableCell>{schedule.supply_time || 'N/A'}</TableCell>
                      <TableCell>{schedule.notes_tamil || ''}</TableCell>
                      <TableCell>
                        {canEdit && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(schedule)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Water;
