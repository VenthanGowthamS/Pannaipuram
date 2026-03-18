import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  BottomNavigation,
  BottomNavigationAction,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Container,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  ElectricBolt as PowerIcon,
  DirectionsBus as BusIcon,
  LocalHospital as HospitalIcon,
  Phone as EmergencyIcon,
  DirectionsCar as AutoIcon,
  Water as WaterIcon,
  LocationOn as StreetsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, currentTab, onTabChange, snackbar, setSnackbar }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const tabs = [
    { id: 'power', label: 'Power Cuts', icon: '⚡', component: PowerIcon },
    { id: 'bus', label: 'Bus Timings', icon: '🚌', component: BusIcon },
    { id: 'doctors', label: 'Doctors', icon: '🏥', component: HospitalIcon },
    { id: 'emergency', label: 'Emergency', icon: '📞', component: EmergencyIcon },
    { id: 'auto', label: 'Auto/Van', icon: '🚗', component: AutoIcon },
    { id: 'water', label: 'Water', icon: '💧', component: WaterIcon },
    { id: 'streets', label: 'Streets', icon: '🏘', component: StreetsIcon },
    { id: 'services', label: 'Services', icon: '🛍', component: StreetsIcon },
    { id: 'users', label: 'Users', icon: '👥', component: StreetsIcon, role: 'super_admin' },
  ];

  const visibleTabs = tabs.filter(t => !t.role || user?.role === t.role);

  const handleLogout = () => {
    logout();
  };

  const drawerContent = (
    <List>
      {visibleTabs.map((tab) => (
        <ListItem
          button
          key={tab.id}
          onClick={() => {
            onTabChange(tab.id);
            setDrawerOpen(false);
          }}
          selected={currentTab === tab.id}
        >
          <ListItemIcon>{tab.icon}</ListItemIcon>
          <ListItemText primary={tab.label} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top AppBar */}
      <AppBar position="sticky" sx={{ bgcolor: '#1B5E20' }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Noto Sans Tamil", sans-serif',
              fontWeight: 700,
              flex: 1,
            }}
          >
            பண்ணைப்புரம் 🏡
          </Typography>
          {user?.role && (
            <Chip
              label={user.role.replace('_', ' ').toUpperCase()}
              size="small"
              sx={{ mr: 2, bgcolor: '#2E7D32', color: 'white' }}
            />
          )}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Desktop Drawer */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: 240,
              '& .MuiDrawer-paper': {
                width: 240,
                boxSizing: 'border-box',
                mt: 0,
                pt: 2,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            pb: isMobile ? 7 : 0,
          }}
        >
          <Container maxWidth="lg" sx={{ py: 3 }}>
            {children}
          </Container>
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation
          value={currentTab}
          onChange={(e, newValue) => onTabChange(newValue)}
          showLabels
          sx={{
            position: 'sticky',
            bottom: 0,
            width: '100%',
            bgcolor: 'background.paper',
            borderTop: '1px solid #e0e0e0',
            '& .MuiBottomNavigationAction-root': {
              minWidth: '50px',
              fontSize: '10px',
            },
          }}
        >
          {visibleTabs.map((tab) => (
            <BottomNavigationAction
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={tab.icon}
            />
          ))}
        </BottomNavigation>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '', severity: 'info' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ open: false, message: '', severity: 'info' })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;
