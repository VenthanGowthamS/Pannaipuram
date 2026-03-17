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

const Emergency = ({ onSnackbar }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: 'police',
    name_tamil: '',
    name_english: '',
    phone: '',
    display_order: 1,
  });
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const categories = [
    { id: 'police', label: '🚔 Police', emoji: '🚔' },
    { id: 'ambulance', label: '🚑 Ambulance', emoji: '🚑' },
    { id: 'fire', label: '🔥 Fire', emoji: '🔥' },
    { id: 'doctor', label: '👨‍⚕️ Doctor', emoji: '👨‍⚕️' },
    { id: 'other', label: '📞 Other', emoji: '📞' },
  ];

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await api.getEmergencyContacts();
      if (Array.isArray(data)) {
        setContacts(data);
      } else if (typeof data === 'object') {
        const flat = [];
        for (const cat in data) {
          if (Array.isArray(data[cat])) {
            flat.push(...data[cat]);
          }
        }
        setContacts(flat);
      }
    } catch (error) {
      onSnackbar('Failed to load emergency contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (
      !form.name_tamil ||
      !form.name_english ||
      !form.phone ||
      !form.category
    ) {
      onSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    try {
      if (editingId) {
        await api.updateEmergencyContact(editingId, form);
        onSnackbar('Contact updated successfully', 'success');
        setEditingId(null);
      } else {
        await api.addEmergencyContact(form);
        onSnackbar('Contact added successfully', 'success');
      }
      setForm({
        category: 'police',
        name_tamil: '',
        name_english: '',
        phone: '',
        display_order: 1,
      });
      loadContacts();
    } catch (error) {
      onSnackbar(
        editingId
          ? 'Failed to update contact'
          : 'Failed to add contact',
        'error'
      );
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setForm({
      category: contact.category,
      name_tamil: contact.name_tamil,
      name_english: contact.name_english,
      phone: contact.phone,
      display_order: contact.display_order || 1,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      category: 'police',
      name_tamil: '',
      name_english: '',
      phone: '',
      display_order: 1,
    });
  };

  const handleDelete = async () => {
    try {
      await api.deleteEmergencyContact(confirmDelete.id);
      onSnackbar('Contact deleted', 'success');
      setConfirmDelete({ open: false, id: null });
      loadContacts();
    } catch (error) {
      onSnackbar('Failed to delete contact', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        📞 Emergency Contacts Management
      </Typography>

      {/* Add Form */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {editingId ? 'Edit Contact' : 'Add New Emergency Contact'}
        </Typography>
        <Box component="form" onSubmit={handleAddContact}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                SelectProps={{
                  native: true,
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                placeholder="e.g., 100, 101, 1234567890"
              />
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
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ bgcolor: '#1B5E20' }}
                >
                  {editingId ? 'Update Contact' : 'Add Contact'}
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
          ) : contacts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No emergency contacts recorded
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Name (Tamil)</TableCell>
                  <TableCell>Name (English)</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => {
                  const catInfo = categories.find(
                    (c) => c.id === contact.category
                  );
                  return (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <Chip
                          label={catInfo?.label || contact.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{contact.name_tamil}</TableCell>
                      <TableCell>{contact.name_english}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(contact)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setConfirmDelete({ open: true, id: contact.id })
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
        title="Delete Contact"
        message="Are you sure you want to delete this emergency contact?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </Box>
  );
};

export default Emergency;
