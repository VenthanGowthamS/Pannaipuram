import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Skeleton, IconButton, Tooltip, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
} from '@mui/material';
import { Refresh as RefreshIcon, Edit as EditIcon } from '@mui/icons-material';
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
const PwaStats = ({ onSnackbar, canEdit }) => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [excludeLabeled, setExcludeLabeled] = useState(false);
  const [labelDialog, setLabelDialog] = useState({ open: false, visitorId: null, label: '' });
  const [labelSaving, setLabelSaving] = useState(false);

  const load = async (exclude = excludeLabeled) => {
    setLoading(true);
    try {
      const data = await api.getPwaStats(exclude);
      setStats(data);
    } catch {
      onSnackbar('Failed to load PWA stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleExclude = (e) => {
    const val = e.target.checked;
    setExcludeLabeled(val);
    load(val);
  };

  const openLabelDialog = (r) => {
    setLabelDialog({ open: true, visitorId: r.visitor_id, label: r.label || '' });
  };

  const saveLabel = async () => {
    setLabelSaving(true);
    try {
      await api.setPwaVisitorLabel(labelDialog.visitorId, labelDialog.label.trim());
      onSnackbar(labelDialog.label.trim() ? 'Device labelled ✅' : 'Label removed', 'success');
      setLabelDialog({ open: false, visitorId: null, label: '' });
      load();
    } catch {
      onSnackbar('Failed to save label', 'error');
    } finally {
      setLabelSaving(false);
    }
  };

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
          <IconButton onClick={() => load()} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Explanation banner */}
      <Box sx={{ mb: 2, p: 1.5, bgcolor: '#E3F2FD', borderRadius: 2, border: '1px solid #BBDEFB' }}>
        <Typography sx={{ fontSize: 12, color: '#0D47A1' }}>
          ℹ️ <b>Unique Users</b> = distinct devices (deduplicated by visitor_id).
          Same person opening the app many times = <b>1 user</b>.
          Visits = total app opens. Label your own devices (✏️ below) and use the
          switch to see village-only numbers. Find a device's ID in the app: ☰ → About (bottom).
        </Typography>
      </Box>

      {/* Exclude-my-devices switch */}
      <FormControlLabel
        sx={{ mb: 1 }}
        control={<Switch checked={excludeLabeled} onChange={handleToggleExclude} color="success" />}
        label={
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
            Exclude labelled devices ({t.labeled_devices ?? 0} labelled — e.g. my own phones)
          </Typography>
        }
      />

      {/* Stat cards — focused on UNIQUE USERS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard label="🟢 Live Now" sub="Active in last 5 minutes" value={t.live_now} loading={loading} color="#2E7D32" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Unique Users (24 hrs)" sub="Today" value={t.active_24h} loading={loading} color="#E65100" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Unique Users (7 days)" sub="This week" value={t.active_7d} loading={loading} color="#1565C0" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Unique Users (All time)" sub="Distinct devices ever" value={t.total_visitors} loading={loading} color="#1B5E20" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Installed as App" sub="On home screen" value={t.installed} loading={loading} color="#6A1B9A" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Installs Today" sub="New home-screen installs" value={t.installs_today} loading={loading} color="#AD1457" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Unique Users (1 hr)" sub="Active this hour" value={t.active_1h} loading={loading} color="#00695C" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total Visits" sub="All app opens combined" value={t.total_visits} loading={loading} color="#37474F" />
        </Grid>
      </Grid>

      {/* Daily breakdown */}
      {daily.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 0.5, fontSize: 15 }}>
              📅 Daily Unique Users — Last 30 days
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#888', mb: 2 }}>
              True per-day uniques (counted the day they visit, not just their last visit).
              History starts from the day this upgrade went live.
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, background: '#F5F5F5' } }}>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Unique Users</TableCell>
                    <TableCell align="center">Total Opens</TableCell>
                    <TableCell align="center">New Installs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {daily.map((row) => (
                    <TableRow key={row.day} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{String(row.day).slice(0, 10)}</TableCell>
                      <TableCell align="center">
                        <Chip label={row.visitors} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#666', fontSize: 13 }}>{row.visits}</TableCell>
                      <TableCell align="center">
                        {row.installs > 0
                          ? <Chip label={`+${row.installs}`} size="small" color="secondary" />
                          : <Typography sx={{ fontSize: 12, color: '#bbb' }}>—</Typography>}
                      </TableCell>
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
            🕐 Recent Unique Users (last 30)
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
                    <TableCell>Label</TableCell>
                    <TableCell>Device ID</TableCell>
                    <TableCell>First Seen</TableCell>
                    <TableCell>Last Seen</TableCell>
                    <TableCell align="center">Visits</TableCell>
                    <TableCell align="center">Installed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recent.map((r) => (
                    <TableRow key={r.visitor_id} hover sx={{ bgcolor: r.label ? '#FFFDE7' : 'inherit' }}>
                      <TableCell sx={{ fontSize: 13 }}>{parseUA(r.user_agent)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {r.label
                            ? <Chip label={`🏷 ${r.label}`} size="small" color="warning" />
                            : <Typography sx={{ fontSize: 12, color: '#bbb' }}>—</Typography>}
                          {canEdit && (
                            <Tooltip title="Label this device (e.g. My iPhone)">
                              <IconButton size="small" onClick={() => openLabelDialog(r)}>
                                <EditIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>
                        {r.visitor_id}
                      </TableCell>
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

      {/* Label device dialog */}
      <Dialog open={labelDialog.open} onClose={() => setLabelDialog({ open: false, visitorId: null, label: '' })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>🏷 Label this device</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 12, color: '#888', mb: 1.5, fontFamily: 'monospace' }}>
            {labelDialog.visitorId}
          </Typography>
          <TextField
            autoFocus fullWidth size="small"
            label="Label (leave empty to remove)"
            placeholder="e.g. Venthan iPhone"
            value={labelDialog.label}
            onChange={(e) => setLabelDialog({ ...labelDialog, label: e.target.value })}
            inputProps={{ maxLength: 60 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLabelDialog({ open: false, visitorId: null, label: '' })} color="inherit">Cancel</Button>
          <Button onClick={saveLabel} variant="contained" disabled={labelSaving}>
            {labelSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PwaStats;
