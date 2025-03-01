import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Tooltip,
  Snackbar,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  WbSunny as WbSunnyIcon,
  WindPower as WindPowerIcon,
  AccountBalance as AccountBalanceIcon,
  LocationOn as LocationOnIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Power as PowerIcon,
  Speed as CapacityIcon,
  Bolt as VoltageIcon,
  CalendarToday as DateIcon,
  WbSunny as SolarIcon,
  Air as WindIcon,
  AccountBalance as BankingIcon,
  PlayArrow as StatusIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductionSiteForm from './ProductionSiteForm';
import {
  fetchProductionSites,
  createProductionUnit,
  updateProductionUnit,
  deleteProductionUnit
} from '../services/productionSiteapi';

import {
  createProductionData
} from '../services/productionapi';

// Update the DetailItem component
const DetailItem = ({ icon: Icon, label, value, color = 'text.secondary' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Icon sx={{ color }} />
    <Typography variant="body2" color="text.secondary">
      {label}:{' '}
      <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
        {value}
      </Box>
    </Typography>
  </Box>
);

const getTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'wind':
      return <WindIcon sx={{ fontSize: 24, color: '#1976D2' }} />;
    case 'solar':
      return <SolarIcon sx={{ fontSize: 24, color: '#FFC107' }} />;
    default:
      return <PowerIcon sx={{ fontSize: 24, color: 'text.secondary' }} />;
  }
};

const ProductionSiteCard = ({ site, onEdit, onDelete }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            {getTypeIcon(site.type)}
            {site.name}
          </Typography>
          <Box>
            {site.banking && (
              <BankingIcon
                sx={{
                  color: 'success.main',
                  mr: 1
                }}
                titleAccess="Banking Enabled"
              />
            )}
            <StatusIcon
              sx={{
                color: site.status === 'Active' ? 'success.main' : 'error.main'
              }}
              titleAccess={site.status}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {site.location || 'Location not specified'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CapacityIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Capacity: {site.capacity_MW || 0} MW
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VoltageIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Injection: {site.injectionVoltage_KV || 0} KV
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DateIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Annual Production: {site.annualProduction_L?.toLocaleString() || 0} L
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
        <Button
          size="small"
          onClick={() => onEdit(site)}
          startIcon={<EditIcon />}
        >
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => onDelete(site)}
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

// Update the SiteCard component
const SiteCard = ({ site, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (site?.companyId && site?.productionSiteId) {
      navigate(`/production/${site.companyId}/${site.productionSiteId}`);
    }
  };

  const getCardColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'wind':
        return 'rgba(25, 118, 210, 0.08)'; // Light blue for wind
      case 'solar':
        return 'rgba(255, 193, 7, 0.08)'; // Light yellow for solar
      default:
        return 'transparent';
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        cursor: 'pointer',
        backgroundColor: getCardColor(site.type),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          backgroundColor: (theme) =>
            site.type?.toLowerCase() === 'wind'
              ? 'rgba(25, 118, 210, 0.15)'
              : site.type?.toLowerCase() === 'solar'
                ? 'rgba(255, 193, 7, 0.15)'
                : 'rgba(0, 0, 0, 0.05)'
        },
        transition: 'all 0.2s'
      }}
      onClick={handleClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getTypeIcon(site.type)}
          <Typography variant="h6">{site.name || 'Unnamed Site'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {Boolean(site.banking) && (
            <Tooltip title="Banking Enabled">
              <BankingIcon
                sx={{
                  color: '#2E7D32', // Dark green
                  fontSize: 22
                }}
              />
            </Tooltip>
          )}
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: site.status === 'Active' ? '#4CAF50' : '#F44336',
              boxShadow: 1
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <DetailItem
          icon={LocationIcon}
          label="Location"
          value={site.location || 'Location not specified'}
          color="#FF9800" // Orange
        />
        <DetailItem
          icon={VoltageIcon}
          label="Injection Voltage"
          value={`${parseFloat(site.injectionVoltage_KV || 0).toFixed(1)} kV`}
          color="#2196F3" // Blue
        />
        <DetailItem
          icon={PowerIcon}
          label="Capacity"
          value={`${parseFloat(site.capacity_MW || 0).toFixed(1)} MW`}
          color="#4CAF50" // Green
        />
        <DetailItem
          icon={AssignmentIcon}
          label="HTSC No"
          value={site.htscNo || 'Not specified'}
          color="#9C27B0" // Purple
        />
      </Box>
    </Paper>
  );
};

// Update the main Production component
export const Production = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productionUnits, setProductionUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedForMenu, setSelectedForMenu] = useState(null);

  // Add state for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchProductionSites();

        if (!data || !Array.isArray(data)) {
          setProductionUnits([]);
          return;
        }

        const transformedData = data.map(unit => ({
          companyId: parseInt(unit.companyId),
          productionSiteId: parseInt(unit.productionSiteId),
          name: unit.name || unit.Name || 'Unnamed Site',
          location: unit.location || unit.Location || 'Location not specified',
          type: unit.type || unit.Type || 'Unknown',
          banking: parseInt(unit.banking || unit.Banking || 0),
          capacity_MW: parseFloat(unit.capacity_MW || unit.Capacity_MW || 0),
          annualProduction_L: parseFloat(unit.annualProduction_L || unit.AnnualProduction || 0),
          htscNo: unit.htscNo || unit.HtscNo || 'Not specified',
          injectionVoltage_KV: parseFloat(unit.injectionVoltage_KV || unit.InjectionValue || 0),
          status: unit.status || unit.Status || 'Inactive'
        }));

        setProductionUnits(transformedData);
      } catch (error) {
        console.error('Failed to load production units:', error);
        setError(error.message || 'Failed to load data from database');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update the handleSubmit function
  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Calculate next productionSiteId
      const nextSiteId = productionUnits.length > 0
        ? Math.max(...productionUnits.map(unit => parseInt(unit.productionSiteId || 0))) + 1
        : 1;

      // Format data consistently
      const formData = {
        companyId: 1,
        productionSiteId: nextSiteId,
        name: data.Name,                  // Changed from Name to name
        location: data.Location,          // Changed from Location to location
        type: data.Type,                  // Changed from Type to type
        banking: data.Banking ? 1 : 0,    // Convert boolean to number
        capacity_MW: parseFloat(data.Capacity_MW || 0),
        annualProduction_L: parseFloat(data.AnnualProduction || 0),
        htscNo: data.HtscNo,
        injectionVoltage_KV: parseFloat(data.InjectionValue || 0),
        status: data.Status || 'Active'
      };

      // Validate data before sending
      if (!formData.name || !formData.location || !formData.type) {
        throw new Error('Name, Location and Type are required fields');
      }

      console.log('[Production] Submitting data:', formData);
      const result = await createProductionUnit(formData);

      if (!result) {
        throw new Error('Failed to create production unit');
      }

      // Transform result to match frontend format
      const newUnit = {
        companyId: result.companyId,
        productionSiteId: result.productionSiteId,
        Name: result.name,
        Location: result.location,
        Type: result.type,
        Banking: result.banking === 1,
        Capacity_MW: parseFloat(result.capacity_MW),
        AnnualProduction: parseFloat(result.annualProduction_L),
        HtscNo: result.htscNo,
        InjectionValue: parseFloat(result.injectionVoltage_KV),
        Status: result.status
      };

      setProductionUnits(prev => [...prev, newUnit]);
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Production site created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.message);
      setSnackbar({
        open: true,
        message: `Failed to create production site: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (site) => {
    try {
      if (!site.companyId || !site.productionSiteId) {
        throw new Error('Invalid site data for deletion');
      }

      const isConfirmed = window.confirm('Are you sure you want to delete this site?');
      if (!isConfirmed) return;

      await deleteProductionUnit(
        parseInt(site.companyId),
        parseInt(site.productionSiteId)
      );

      setProductionUnits(prev =>
        prev.filter(unit =>
          !(unit.productionSiteId === site.productionSiteId &&
            unit.companyId === site.companyId)
        )
      );

      setSnackbar({
        open: true,
        message: 'Site deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Delete failed:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete site',
        severity: 'error'
      });
    }
  };

  const handleMenuOpen = (event, site) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedForMenu(site);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedForMenu(null);
  };

  const handleSiteSelection = (site) => {
    if (!site || !site.companyId || !site.productionSiteId) {
      console.warn('Invalid site selection:', site);
      return;
    }

    // Navigate to the site details page
    navigate(`/production/${site.companyId}/${site.productionSiteId}`);
  };

  // Add handlers for edit and delete
  const handleEdit = (site) => {
    setEditingSite(site);
    setOpenDialog(true);
  };

  // Remove the old Add New Site card from renderProductionUnits
  const renderProductionUnits = () => {
    if (!productionUnits.length) {
      return (
        <Grid item xs={12}>
          <Alert severity="info">
            No production units found. Add a new site to get started.
          </Alert>
        </Grid>
      );
    }

    return productionUnits.map((unit, index) => {
      const unitKey = `${unit.companyId || 'default'}-${unit.productionSiteId || index}`;
      return (
        <Grid item xs={12} sm={6} md={4} key={unitKey}>
          <SiteCard
            site={unit}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Grid>
      );
    });
  };

  // Update the return statement in the Production component
  return (
    <Box sx={{ p: 4, maxWidth: 1600, margin: '0 auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} component="div">
          Production Sites
        </Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              bgcolor: '#D32F2F',
              '&:hover': {
                bgcolor: '#B71C1C'
              }
            }}
          >
            Add New Site
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Grid>
        ) : (
          renderProductionUnits()
        )}
      </Grid>

      <Dialog
        open={openDialog || !!editingSite}
        onClose={() => {
          if (!loading) { // Only allow closing if not loading
            setOpenDialog(false);
            setEditingSite(null);
            setError(null);
          }
        }}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={loading}
        // Remove disableBackdropClick and replace with proper click handling
        onClick={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: '#D32F2F',
          color: 'white',
          fontWeight: 600
        }}>
          {editingSite ? 'Edit Production Site' : 'Create New Production Site'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <ProductionSiteForm
            initialData={editingSite}
            onSubmit={handleSubmit}
            onCancel={() => {
              if (!loading) { // Only allow canceling if not loading
                setOpenDialog(false);
                setEditingSite(null);
                setError(null);
              }
            }}
            loading={loading} // Pass loading state to form
          />
        </DialogContent>
      </Dialog>

      {/* Menu for production card actions */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          key="edit"
          onClick={() => {
            setEditingSite(selectedForMenu);
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1.5 }} /> Edit
        </MenuItem>
        <MenuItem
          key="delete"
          onClick={() => handleDelete(selectedForMenu)}
        >
          <DeleteIcon sx={{ mr: 1.5, color: 'error.main' }} /> Delete
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Production;