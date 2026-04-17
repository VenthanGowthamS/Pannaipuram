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
  Switch,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

const UserManagement = ({ onSnackbar }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, userId: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, userName: '' });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (error) {
      onSnackbar('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadUsers();
    }
  }, [user]);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      onSnackbar('Please fill in all fields', 'error');
      return;
    }

    setSignupLoading(true);
    try {
      await api.signup({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        role: signupForm.role,
      });
      onSnackbar('User created. Pending admin approval.', 'success');
      setSignupForm({ name: '', email: '', password: '', role: 'viewer' });
      loadUsers();
    } catch (error) {
      onSnackbar(error.message || 'Failed to create user', 'error');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      onSnackbar('Role updated', 'success');
      loadUsers();
    } catch (error) {
      onSnackbar('Failed to update role', 'error');
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await api.toggleUserActive(userId, !currentActive);
      onSnackbar(currentActive ? 'User deactivated' : 'User activated', 'success');
      loadUsers();
    } catch (error) {
      onSnackbar(error.message || 'Failed to toggle user status', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.deleteUser(deleteDialog.userId);
      onSnackbar(`User "${deleteDialog.userName}" deleted`, 'success');
      setDeleteDialog({ open: false, userId: null, userName: '' });
      loadUsers();
    } catch (error) {
      onSnackbar(error.message || 'Failed to delete user', 'error');
      setDeleteDialog({ open: false, userId: null, userName: '' });
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <Alert severity="error">
        You do not have permission to access this page. Only super_admin users can manage users.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Invite New User Card */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Invite New User
        </Typography>

        <Box component="form" onSubmit={handleSignup}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                disabled={signupLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                disabled={signupLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                disabled={signupLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={signupForm.role}
                  label="Role"
                  onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
                  disabled={signupLoading}
                >
                  <MenuItem value="viewer">Viewer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{ background: '#1B5E20', '&:hover': { background: '#2E7D32' } }}
                disabled={signupLoading}
              >
                {signupLoading ? <CircularProgress size={24} color="inherit" /> : 'Add User'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Users Table */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Admin Users ({users.length})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.map((u) => {
                  const isSelf = u.id === user?.id;
                  return (
                  <TableRow key={u.id} hover sx={isSelf ? { bgcolor: '#f9fbe7' } : {}}>
                    <TableCell>
                      {u.name || '—'}
                      {isSelf && <Chip label="You" size="small" sx={{ ml: 1, fontSize: 10 }} color="primary" variant="outlined" />}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>

                    <TableCell>
                      <Tooltip title={isSelf ? 'Cannot change your own role' : ''}>
                        <span>
                          <FormControl size="small" disabled={isSelf}>
                            <Select
                              value={u.role || 'viewer'}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            >
                              <MenuItem value="viewer">Viewer</MenuItem>
                              <MenuItem value="admin">Admin</MenuItem>
                              <MenuItem value="super_admin">Super Admin</MenuItem>
                            </Select>
                          </FormControl>
                        </span>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={u.is_active ? 'Active' : 'Inactive'}
                        color={u.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title={isSelf ? 'Cannot deactivate yourself' : u.is_active ? 'Deactivate' : 'Activate'}>
                          <span>
                            <Switch
                              checked={u.is_active}
                              onChange={() => handleToggleActive(u.id, u.is_active)}
                              size="small"
                              disabled={isSelf}
                            />
                          </span>
                        </Tooltip>
                        <Tooltip title={isSelf ? 'Cannot delete yourself' : 'Delete user'}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={isSelf}
                              onClick={() => setDeleteDialog({ open: true, userId: u.id, userName: u.name || u.email })}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {users.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center', color: '#999' }}>
                No users found
              </Box>
            )}
          </TableContainer>
        )}
      </Card>

      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={() => setConfirmDialog({ open: false, type: null, userId: null })}
        onCancel={() => setConfirmDialog({ open: false, type: null, userId: null })}
      />

      {/* Delete User Confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: null, userName: '' })}>
        <DialogTitle sx={{ color: 'error.main' }}>🗑️ Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently delete <strong>{deleteDialog.userName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This cannot be undone. The user will lose all access immediately.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, userId: null, userName: '' })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
