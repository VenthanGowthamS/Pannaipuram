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
} from '@mui/material';
import api from '../api';

const Streets = ({ onSnackbar }) => {
  const [streets, setStreets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name_tamil: '',
    name_english: '',
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
                </TableRow>
              </TableHead>
              <TableBody>
                {streets.map((street, index) => (
                  <TableRow key={street.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{street.name_tamil}</TableCell>
                    <TableCell>{street.name_english}</TableCell>
                    <TableCell>{street.ward || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Streets;
