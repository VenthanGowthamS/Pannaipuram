import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { HashRouter as Router } from 'react-router-dom';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import PowerCuts from './pages/PowerCuts';
import BusTimings from './pages/BusTimings';
import Doctors from './pages/Doctors';
import Emergency from './pages/Emergency';
import AutoDrivers from './pages/AutoDrivers';
import Water from './pages/Water';
import Streets from './pages/Streets';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('power');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleShowSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return <Login />;
  }

  const renderTab = () => {
    const props = { onSnackbar: handleShowSnackbar };
    switch (currentTab) {
      case 'power':
        return <PowerCuts {...props} />;
      case 'bus':
        return <BusTimings {...props} />;
      case 'doctors':
        return <Doctors {...props} />;
      case 'emergency':
        return <Emergency {...props} />;
      case 'auto':
        return <AutoDrivers {...props} />;
      case 'water':
        return <Water {...props} />;
      case 'streets':
        return <Streets {...props} />;
      default:
        return <PowerCuts {...props} />;
    }
  };

  return (
    <Layout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      snackbar={snackbar}
      setSnackbar={setSnackbar}
    >
      {renderTab()}
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
