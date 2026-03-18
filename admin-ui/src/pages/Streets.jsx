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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import api from '../api';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => (
  <Dialog open={open}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{message}</DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

const Streets = ({ onSnackbar }) => {
  const [streets, setStreets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name_tamil: '',
    name_english: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name_tamil: '',
    name_english: '',
    ward_id: '',
  });
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    streetId: null,
  });

  const loadStreets = async () => {
    setLoading(true);
    try {
      const data = await api.getStreets();
      setStreets(data || []);
    } catch (error) {
      onSnackbar('Failed to load streets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreets();
  }, []);

  const handleAddStreet = async (e) => {
    e.preventDefault();
    if (!form.name_tamil || !form.name_english) {
      onSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      await api.addStreet(form);
      onSnackbar('Street added successfully', 'success');
      setForm({
        name_tamil: '',
        name_english: '',
      });
      loadStreets();
    } catch (error) {
      onSnackbar('Failed to add street', 'error');
    }
  };

  const handleEditStart = (street) => {
    setEditingId(street.id);
    setEditForm({
      name_tamil: street.name_tamil,
      name_english: street.name_english,
      ward_id: street.ward_id || '',
    });
  };

  const handleEditSave = async (streetId) => {
    if (!editForm.name_tamil || !editForm.name_english) {
      onSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      await api.updateStreet(streetId, editForm);
      onSnackbar('Street updated successfully', 'success');
      setEditingId(null);
      loadStreets();
    } catch (error) {
      onSnackbar('Failed to update street', 'error');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({
      name_tamil: '',
      name_english: '',
      ward_id: '',
    });
  };

  const handleDeleteStart = (streetId) => {
    setConfirmDelete({ open: true, streetId });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.deleteStreet(confirmDelete.streetId);
      onSnackbar('Street deleted successfully', 'success');
      setConfirmDelete({ open: false, streetId: null });
      loadStreets();
    } catch (error) {
      onSnackbar('Failed to delete street', 'error');
      setConfirmDelete({ open: false, streetId: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, streetId: null });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        🏘 Streets Management
      </Typography>

      {/* Add Form */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add New Street
        </Typography>
        <Box component="form" onSubmit={handleAddStreet}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street Name (Tamil)"
                value={form.name_tamil}
                onChange={(e) =>
                  setForm({ ...form, name_tamil: e.target.value })
                }
                placeholder="தெரு பெயர்..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street Name (English)"
                value={form.name_english}
                onChange={(e) =>
                  setForm({ ...form, name_english: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: '#1B5E20' }}
              >
                Add Street
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
          ) : streets.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No streets recorded
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name (Tamil)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name (English)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ward</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {streets.map((street, index) => (
                  <TableRow key={street.id}>
                    <TableCell>{index + 1}</TableCell>
                    {editingId === street.id ? (
                      <>
                        <TableCell>
                          <TextField
                            size="small"
                            value={editForm.name_tamil}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                name_tamil: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={editForm.name_english}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                name_english: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={editForm.ward_id}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                ward_id: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleEditSave(street.id)}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={handleEditCancel}
                          >
                            <CloseIcon />
                          </IconButton>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{street.name_tamil}</TableCell>
                        <TableCell>{street.name_english}</TableCell>
                        <TableCell>{street.ward_id || '-'}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditStart(street)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteStart(street.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Street"
        message="Are you sure you want to delete this street? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

export default Streets;
