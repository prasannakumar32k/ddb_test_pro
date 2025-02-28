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
  PlayArrow as StatusIcon
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

// Component to display label-value pairs
const DetailItem = ({ label, value, color = 'text.secondary' }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" color={color} fontWeight="medium">
      {value || 'Not specified'}
    </Typography>
  </Box>
);

const getTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'wind':
      return <WindIcon sx={{ color: '#1976D2' }} />;
    case 'solar':
      return <SolarIcon sx={{ color: '#FFC107' }} />;
    default:
      return <PowerIcon />;
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

  const handleClick = useCallback(() => {
    if (site?.companyId && site?.productionSiteId) {
      navigate(`/production/${site.companyId}/${site.productionSiteId}`);
    }
  }, [site, navigate]);

  const handleCardClick = (e) => {
    e.stopPropagation();
    handleClick();
  };

  if (!site) return null;

  // Get the color scheme based on site type
  const getTypeStyles = (type) => {
    switch (type?.toLowerCase()) {
      case 'wind':
        return {
          color: '#1976D2',
          bgColor: 'rgba(25, 118, 210, 0.08)',
          icon: <WindIcon sx={{ fontSize: 24, color: '#1976D2' }} />
        };
      case 'solar':
        return {
          color: '#FFC107',
          bgColor: 'rgba(255, 193, 7, 0.08)',
          icon: <SolarIcon sx={{ fontSize: 24, color: '#FFC107' }} />
        };
      default:
        return {
          color: 'text.primary',
          bgColor: 'grey.100',
          icon: <PowerIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
        };
    }
  };

  const typeStyles = getTypeStyles(site.Type);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2.5,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        borderLeft: 3,
        borderColor: typeStyles.color,
        backgroundColor: typeStyles.bgColor,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s'
        }
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {typeStyles.icon}
          <Typography variant="h6" component="h2">
            {site.Name || 'Unnamed Site'}
          </Typography>
        </Box>
        <Box>
          {site.Banking && (
            <Tooltip title="Banking Enabled">
              <BankingIcon sx={{ color: 'success.main', mr: 1 }} />
            </Tooltip>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(site);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(site);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LocationIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          {site.Location || 'No location specified'}
        </Typography>
      </Box>

      <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CapacityIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Capacity: {site.Capacity_MW ? `${site.Capacity_MW} MW` : 'Not specified'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VoltageIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Injection: {site.InjectionValue ? `${site.InjectionValue} KV` : 'Not specified'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DateIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Production: {site.AnnualProduction ? `${site.AnnualProduction.toLocaleString()} L` : 'Not specified'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StatusIcon 
            sx={{ 
              mr: 1, 
              color: site.Status === 'Active' ? 'success.main' : 'error.main',
              fontSize: 20 
            }} 
          />
          <Typography 
            variant="body2" 
            color={site.Status === 'Active' ? 'success.main' : 'error.main'}
          >
            {site.Status || 'Status not specified'}
          </Typography>
        </Box>
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

        // Transform data with proper number formatting
        const transformedData = data.map(unit => ({
          companyId: parseInt(unit.companyId),
          productionSiteId: parseInt(unit.productionSiteId),
          Name: unit.name,
          Location: unit.location,
          Type: unit.type,
          Banking: unit.banking,
          Capacity_MW: parseFloat(unit.capacity_MW) || 0,
          AnnualProduction_L: parseFloat(unit.annualProduction_L) || 0,
          HtscNo: unit.htscNo,
          InjectionVoltage_KV: parseFloat(unit.injectionVoltage_KV) || 0,
          Status: unit.status
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