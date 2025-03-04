import React, { Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CircularProgress,
  Box
} from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { setNavigate } from './utils/navigation';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Layout from "./Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import theme from './theme';

// Lazy load components
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const Production = lazy(() => import("./components/Production"));
const ProductionSiteDetails = lazy(() => import("./components/ProductionSiteDetails"));
const Consumption = lazy(() => import("./components/Consumption"));
const Reports = lazy(() => import("./components/Reports"));

function App() {
  const navigate = useNavigate();

  // Set the navigation function when the component mounts
  React.useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <AuthProvider>
          <ErrorBoundary>
            <Suspense
              fallback={
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100vh"
                >
                  <CircularProgress />
                </Box>
              }
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/production"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Production />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/production/:companyId/:productionSiteId"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <ProductionSiteDetails />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/consumption"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Consumption />
                      </Layout>
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;