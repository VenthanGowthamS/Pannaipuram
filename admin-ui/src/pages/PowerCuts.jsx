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
import { Delete as DeleteIcon, CheckCircle as ResolveIcon } from '@mui/icons-material';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const PowerCuts = ({ onSnackbar, canEdit }) => {
  const [cuts, setCuts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    area_description: '',
    cut_type: 'planned',
    start_time: '',
    end_time: '',
    reason_tamil: '',
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const loadCuts = async () => {
    setLoading(true);
    try {
      const data = await api.getPowerCuts();
      setCuts(data || []);
    } catch (error) {
      onSnackbar('Failed to load power cuts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCuts();
  }, []);

  const handleAddCut = async (e) => {
    e.preventDefault();
    if (!form.area_description.trim() || !form.start_time || !form.end_time) {
      onSnackbar('Please fill in all required fields', 'warning');
      return;
    }
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      onSnackbar('End time must be after start time', 'warning');
      return;
    }

    try {
      await api.addPowerCut(form);
      onSnackbar('Power cut added successfully', 'success');
      setForm({
        area_description: '',
        cut_type: 'planned',
        start_time: '',
        end_time: '',
        reason_tamil: '',
      });
      loadCuts();
    } catch (error) {
      onSnackbar('Failed to add power cut', 'error');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.resolvePowerCut(id);
      onSnackbar('Power cut resolved', 'success');
      loadCuts();
    } catch (error) {
      onSnackbar('Failed to resolve power cut', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deletePowerCut(confirmDelete.id);
      onSnackbar('Power cut deleted', 'success');
      setConfirmDelete({ open: false, id: null });
      loadCuts();
    } catch (error) {
      onSnackbar('Failed to delete power cut', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        ⚡ Power Cuts Management
      </Typography>

      {/* Add Form */}
      {canEdit && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Power Cut
          </Typography>
          <Box component="form" onSubmit={handleAddCut}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Area Description"
                value={form.area_description}
                onChange={(e) =>
                  setForm({ ...form, area_description: e.target.value })
                }
                placeholder="e.g., North Street, Market Area"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Cut Type"
                value={form.cut_type}
                onChange={(e) => setForm({ ...form, cut_type: e.target.value })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="planned">Planned</option>
                <option value="unplanned">Unplanned</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason (Tamil)"
                multiline
                rows={2}
                value={form.reason_tamil}
                onChange={(e) =>
                  setForm({ ...form, reason_tamil: e.target.value })
                }
                placeholder="விளக்கம்..."
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: '#1B5E20' }}
              >
                Add Power Cut
              </Button>
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
          ) : cuts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No power cuts recorded
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Area</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cuts.map((cut) => (
                  <TableRow key={cut.id}>
                    <TableCell>
                      <Chip
                        label={cut.cut_type === 'planned' ? 'Planned' : 'Unplanned'}
                        size="small"
                        color={
                          cut.cut_type === 'planned' ? 'info' : 'warning'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{cut.area_description}</TableCell>
                    <TableCell>{new Date(cut.start_time).toLocaleString()}</TableCell>
                    <TableCell>{new Date(cut.end_time).toLocaleString()}</TableCell>
                    <TableCell>{cut.reason_tamil}</TableCell>
                    <TableCell>
                      <Chip
                        label={cut.is_resolved ? 'Resolved' : 'Active'}
                        size="small"
                        color={cut.is_resolved ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      {canEdit && (
                        <>
                          {!cut.is_resolved && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleResolve(cut.id)}
                              title="Mark as Resolved"
                            >
                              <ResolveIcon />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setConfirmDelete({ open: true, id: cut.id })
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
        title="Delete Power Cut"
        message="Are you sure you want to delete this power cut record?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default PowerCuts;
