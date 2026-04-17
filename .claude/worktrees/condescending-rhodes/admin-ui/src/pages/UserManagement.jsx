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
} from '@mui/material';
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
      onSnackbar('Failed to toggle user status', 'error');
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
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.name || '—'}</TableCell>
                    <TableCell>{u.email}</TableCell>

                    <TableCell>
                      <FormControl size="small">
                        <Select
                          value={u.role || 'viewer'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <MenuItem value="viewer">Viewer</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="super_admin">Super Admin</MenuItem>
                        </Select>
                      </FormControl>
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
                      <Switch
                        checked={u.is_active}
                        onChange={() => handleToggleActive(u.id, u.is_active)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
    </Box>
  );
};

export default UserManagement;
