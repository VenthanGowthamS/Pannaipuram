import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Container,
  Snackbar,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ElectricBolt as PowerIcon,
  DirectionsBus as BusIcon,
  LocalHospital as HospitalIcon,
  Phone as EmergencyIcon,
  DirectionsCar as AutoIcon,
  Water as WaterIcon,
  LocationOn as StreetsIcon,
  ShoppingBag as ServicesIcon,
  Campaign as AnnounceIcon,
  Feedback as FeedbackIcon,
  Group as UsersIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 220;

const Layout = ({ children, currentTab, onTabChange, snackbar, setSnackbar }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const tabs = [
    { id: 'power',         label: 'Power Cuts',  icon: '⚡', MuiIcon: PowerIcon },
    { id: 'bus',           label: 'Bus Timings',  icon: '🚌', MuiIcon: BusIcon },
    { id: 'doctors',       label: 'Doctors',      icon: '🏥', MuiIcon: HospitalIcon },
    { id: 'emergency',     label: 'Emergency',    icon: '📞', MuiIcon: EmergencyIcon },
    { id: 'auto',          label: 'Auto/Van',     icon: '🚗', MuiIcon: AutoIcon },
    { id: 'water',         label: 'Water',        icon: '💧', MuiIcon: WaterIcon },
    { id: 'streets',       label: 'Streets',      icon: '🏘', MuiIcon: StreetsIcon },
    { id: 'services',      label: 'Services',     icon: '🛍', MuiIcon: ServicesIcon },
    { id: 'announcements', label: 'Announce',     icon: '📢', MuiIcon: AnnounceIcon },
    { id: 'feedback',      label: 'Feedback',     icon: '💬', MuiIcon: FeedbackIcon },
    { id: 'users',         label: 'Users',        icon: '👥', MuiIcon: UsersIcon, role: 'super_admin' },
    { id: 'pwa',           label: 'PWA Stats',    icon: '📊', MuiIcon: UsersIcon },
  ];

  const visibleTabs = tabs.filter(t => !t.role || user?.role === t.role);
  const currentTabLabel = visibleTabs.find(t => t.id === currentTab)?.label || '';

  const handleTabChange = (id) => {
    onTabChange(id);
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Drawer header */}
      <Box sx={{ px: 2, py: 2, bgcolor: '#1B5E20' }}>
        <Typography sx={{ fontFamily: '"Noto Sans Tamil", sans-serif', fontWeight: 700, color: 'white', fontSize: 16 }}>
          பண்ணைப்புரம் 🏡
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, mt: 0.3 }}>
          Admin Panel · v2.1
        </Typography>
        {user?.role && (
          <Chip
            label={user.role.replace('_', ' ').toUpperCase()}
            size="small"
            sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 10 }}
          />
        )}
      </Box>
      <Divider />

      {/* Tab list */}
      <List sx={{ flex: 1, pt: 1 }}>
        {visibleTabs.map((tab) => (
          <ListItem key={tab.id} disablePadding>
            <ListItemButton
              selected={currentTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              sx={{
                mx: 1, borderRadius: 2, mb: 0.3,
                '&.Mui-selected': {
                  bgcolor: '#E8F5E9',
                  '& .tab-label': { color: '#1B5E20', fontWeight: 700 },
                },
                '&:hover': { bgcolor: '#F1F8E9' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, fontSize: 18 }}>{tab.icon}</ListItemIcon>
              <ListItemText
                primary={tab.label}
                primaryTypographyProps={{ className: 'tab-label', fontSize: 14 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      {/* Logout at bottom of drawer */}
      <Box sx={{ p: 1.5 }}>
        <ListItemButton onClick={logout} sx={{ borderRadius: 2, color: '#c62828' }}>
          <ListItemIcon sx={{ minWidth: 36 }}><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, color: '#c62828' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* ── Top AppBar ── */}
      <AppBar position="sticky" sx={{ bgcolor: '#1B5E20', zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: { xs: 52, sm: 64 } }}>
          {/* Hamburger — mobile only */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Title — show current tab on mobile, app name on desktop */}
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Noto Sans Tamil", sans-serif',
              fontWeight: 700,
              flex: 1,
              fontSize: { xs: 15, sm: 18 },
            }}
          >
            {isMobile && currentTabLabel ? `${visibleTabs.find(t => t.id === currentTab)?.icon} ${currentTabLabel}` : 'பண்ணைப்புரம் Admin'}
          </Typography>

          {/* Role chip — desktop only */}
          {!isMobile && user?.role && (
            <Chip
              label={user.role.replace('_', ' ').toUpperCase()}
              size="small"
              sx={{ mr: 2, bgcolor: '#2E7D32', color: 'white', fontSize: 11 }}
            />
          )}

          {/* Logout — desktop only (drawer has it on mobile) */}
          {!isMobile && (
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{ textTransform: 'none', fontSize: 13 }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Desktop sidebar (permanent) ── */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                top: 64,           // below AppBar
                height: 'calc(100% - 64px)',
                borderRight: '1px solid #e0e0e0',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* ── Mobile drawer (temporary, slides in) ── */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* ── Main content ── */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            minWidth: 0,   // prevent flex overflow
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 2, sm: 3 },
              px: { xs: 1.5, sm: 3 },
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '', severity: 'info' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ open: false, message: '', severity: 'info' })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;
