import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('venthan89@gmail.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
      setPassword('');
    }

    setLoading(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await api.signup({
        name,
        email,
        password,
        role: 'viewer',
      });
      setSuccess('Account created! Please wait for admin approval.');
      setName('');
      setEmail('');
      setPassword('');
      setTimeout(() => setMode('login'), 3000);
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1B5E20 0%, #388E3C 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Noto Sans Tamil", sans-serif',
                fontWeight: 700,
                color: '#1B5E20',
                mb: 0.5,
              }}
            >
              பண்ணைப்புரம் 🏡
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontWeight: 500,
              }}
            >
              Admin Panel
            </Typography>
          </Box>

          {/* Mode Toggle Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Button
              variant={mode === 'login' ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              sx={{
                background: mode === 'login' ? '#1B5E20' : 'transparent',
              }}
            >
              Login
            </Button>
            <Button
              variant={mode === 'signup' ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccess('');
              }}
              sx={{
                background: mode === 'signup' ? '#1B5E20' : 'transparent',
              }}
            >
              Sign Up
            </Button>
          </Box>

          {/* Login Form */}
          {mode === 'login' && (
            <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                disabled={loading}
                InputProps={{
                  style: { fontFamily: 'Roboto' },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  style: { fontFamily: 'Roboto' },
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  mb: 2,
                  background: '#1B5E20',
                  '&:hover': {
                    background: '#2E7D32',
                  },
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <Box component="form" onSubmit={handleSignupSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  mb: 2,
                  background: '#1B5E20',
                  '&:hover': {
                    background: '#2E7D32',
                  },
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>
            </Box>
          )}

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: '#999',
              mt: 2,
            }}
          >
            Authorized administrators only
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
