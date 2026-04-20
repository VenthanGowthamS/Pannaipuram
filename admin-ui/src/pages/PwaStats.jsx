import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Skeleton, IconButton, Tooltip,
} from '@mui/material';
import { Refresh as RefreshIcon, Smartphone as PhoneIcon } from '@mui/icons-material';
import api from '../api';

// ── Stat card ──────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, loading }) => (
  <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
    <CardContent>
      {loading ? (
        <Skeleton variant="text" width="60%" height={48} />
      ) : (
        <Typography variant="h3" sx={{ fontWeight: 800, color: color || '#1B5E20', lineHeight: 1 }}>
          {value ?? '—'}
        </Typography>
      )}
      <Typography sx={{ fontWeight: 700, fontSize: 13, mt: 0.5, color: '#333' }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: 11, color: '#888', mt: 0.3 }}>{sub}</Typography>}
    </CardContent>
  </Card>
);

// ── Parse UA string to friendly label ─────────────────────
function parseUA(ua) {
  if (!ua) return '—';
  if (/iPhone|iPad/.test(ua)) return '🍎 iPhone/iPad';
  if (/Android/.test(ua))     return '🤖 Android';
  if (/Windows/.test(ua))     return '💻 Windows PC';
  if (/Mac/.test(ua))         return '💻 Mac';
  return '🌐 Browser';
}

// ── Format date ───────────────────────────────────────────
function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ── Main component ────────────────────────────────────────
const PwaStats = ({ onSnackbar }) => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getPwaStats();
      setStats(data);
    } catch {
      onSnackbar('Failed to load PWA stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const t = stats?.totals || {};
  const daily  = stats?.daily  || [];
  const recent = stats?.recent || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            📱 PWA பயனர் புள்ளிவிவரம்
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#666' }}>
            Who is using the village app? · எத்தன பேர் பயன்படுத்துகிறார்கள்?
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={load} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total Visitors" sub="All time" value={t.total_visitors} loading={loading} color="#1B5E20" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Active (7 days)" sub="Visited this week" value={t.active_7d} loading={loading} color="#1565C0" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Active (24 hrs)" sub="Today" value={t.active_24h} loading={loading} color="#E65100" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Installed" sub="Added to home screen" value={t.installed} loading={loading} color="#6A1B9A" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Active (1 hr)" sub="Right now" value={t.active_1h} loading={loading} color="#00695C" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total Visits" sub="All sessions combined" value={t.total_visits} loading={loading} color="#37474F" />
        </Grid>
      </Grid>

      {/* Daily breakdown */}
      {daily.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 2, fontSize: 15 }}>
              📅 Daily Visitors — Last 30 days
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, background: '#F5F5F5' } }}>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Unique Visitors</TableCell>
                    <TableCell align="center">Total Visits</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {daily.map((row) => (
                    <TableRow key={row.day} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{row.day}</TableCell>
                      <TableCell align="center">
                        <Chip label={row.visitors} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#666', fontSize: 13 }}>{row.visits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent visitors */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 2, fontSize: 15 }}>
            🕐 Recent Visitors (last 20)
          </Typography>
          {loading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />)
          ) : recent.length === 0 ? (
            <Typography sx={{ color: '#999', textAlign: 'center', py: 4 }}>
              No visits yet — will appear once users open the PWA
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, background: '#F5F5F5' } }}>
                    <TableCell>Device</TableCell>
                    <TableCell>First Seen</TableCell>
                    <TableCell>Last Seen</TableCell>
                    <TableCell align="center">Visits</TableCell>
                    <TableCell align="center">Installed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recent.map((r) => (
                    <TableRow key={r.visitor_id} hover>
                      <TableCell sx={{ fontSize: 13 }}>{parseUA(r.user_agent)}</TableCell>
                      <TableCell sx={{ fontSize: 12, color: '#666' }}>{fmtDate(r.first_seen_at)}</TableCell>
                      <TableCell sx={{ fontSize: 12, color: '#666' }}>{fmtDate(r.last_seen_at)}</TableCell>
                      <TableCell align="center">
                        <Chip label={r.visit_count} size="small"
                          color={r.visit_count >= 5 ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        {r.is_standalone
                          ? <Chip label="✅ Installed" size="small" color="secondary" />
                          : <Chip label="Browser" size="small" variant="outlined" sx={{ color: '#999' }} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PwaStats;
