import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack'; // Add this import
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
  CardActions,
  Chip,
  alpha
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
  Assignment as AssignmentIcon,
  ElectricBolt as VoltageIcon,
  FiberManualRecord as StatusIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductionSiteForm from './ProductionSiteForm';
import {
  fetchProductionSites,
  createProductionUnit,
  updateProductionUnit,
  deleteProductionUnit,
  fetchProductionSiteDetails // Changed from fetchProductionSite
} from '../services/productionSiteapi';

import {
  createProductionData
} from '../services/productionapi';

import ProductionSiteList from '../components/ProductionSiteList';
import ProductionSiteDialog from './ProductionSiteDialog';
import { productionApi } from '../services/productionapi';

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

const ProductionSiteCard = ({ site, onEdit, onDelete, userRole }) => {
  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8]
        },
        borderRadius: 2,
        overflow: 'visible'
      }}
    >
      {/* Status Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Tooltip title={`Status: ${site.status}`}>
          <StatusIcon
            sx={{
              color: site.status === 'Active' ? 'success.main' : 'error.main',
              fontSize: 12
            }}
          />
        </Tooltip>
      </Box>

      <CardContent sx={{ p: 3, pb: 2 }}>
        {/* Header with Type Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          {site.type === 'Solar' ? (
            <SolarIcon sx={{ color: '#FBC02D', fontSize: 32 }} />
          ) : (
            <WindIcon sx={{ color: '#2196F3', fontSize: 32 }} />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {site.name}
          </Typography>
        </Box>

        {/* Site Details */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {site.location}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/* Capacity */}
              <Chip
                icon={<CapacityIcon />}
                label={`${site.capacity_MW} MW`}
                size="small"
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main'
                }}
              />

              {/* Voltage */}
              <Chip
                icon={<VoltageIcon />}
                label={`${site.injectionVoltage_KV} KV`}
                size="small"
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                  color: 'secondary.main'
                }}
              />

              {/* Banking Status */}
              <Chip
                icon={<BankingIcon />}
                label={site.banking ? 'Banking: Yes' : 'Banking: No'}
                size="small"
                sx={{
                  bgcolor: (theme) => alpha(
                    site.banking ? theme.palette.success.main : theme.palette.error.main,
                    0.1
                  ),
                  color: site.banking ? 'success.main' : 'error.main'
                }}
              />
            </Box>
          </Grid>

          {/* Production Value */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <DateIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                Annual Production: {site.annualProduction_L?.toLocaleString()} L
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      {/* Actions */}
      {userRole === 'admin' && (
        <Box
          sx={{
            p: 2,
            pt: 0,
            mt: 'auto',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1
          }}
        >
          <Tooltip title="Edit Site">
            <IconButton
              size="small"
              onClick={() => onEdit(site)}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Site">
            <IconButton
              size="small"
              onClick={() => onDelete(site)}
              sx={{
                color: 'error.main',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Card>
  );
};

// Update the SiteCard component
const SiteCard = ({ site, onEdit, onDelete, userRole }) => {
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

      {/* Only show actions for admin role */}
      {userRole === 'admin' && (
        <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(site);
            }}
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(site);
            }}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </CardActions>
      )}
    </Paper>
  );
};

// Update the main Production component
const Production = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // Add this hook
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

  const [selectedSite, setSelectedSite] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Add loadData function
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await productionApi.fetchAll();
      setProductionUnits(data);
    } catch (error) {
      enqueueSnackbar('Failed to load production sites', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadSites = async () => {
      try {
        setLoading(true);
        const data = await fetchProductionSites();
        setProductionUnits(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSites();
  }, []);

  // Update the handleSubmit function
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      const result = editingData
        ? await updateProductionUnit(formData)
        : await createProductionUnit(formData);

      if (result) {
        enqueueSnackbar(
          `Production site ${editingData ? 'updated' : 'created'} successfully`,
          { variant: 'success' }
        );
        setOpenDialog(false);
        setEditingData(null);
        await loadData(); // Refresh the list
      }
    } catch (error) {
      console.error('Submit error:', error);
      enqueueSnackbar(error.message || 'Failed to process request', {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (site) => {
    if (user?.role !== 'admin') {
      setSnackbar({
        open: true,
        message: 'You do not have permission to delete sites',
        severity: 'warning'
      });
      return;
    }

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
    try {
      if (!site || !site.companyId || !site.productionSiteId) {
        throw new Error('Invalid site data');
      }

      const formattedData = {
        companyId: site.companyId,
        productionSiteId: site.productionSiteId,
        Name: site.name,
        Location: site.location,
        Type: site.type,
        Status: site.status,
        Capacity_MW: site.capacity_MW?.toString() || '0',
        Banking: Boolean(site.banking),
        HtscNo: site.htscNo || '',
        InjectionValue: site.injectionVoltage_KV?.toString() || '0',
        AnnualProduction: site.annualProduction_L?.toString() || '0'
      };

      setEditingData(formattedData);
      setEditDialogOpen(true);
    } catch (error) {
      console.error('Error preparing edit form:', error);
      enqueueSnackbar('Failed to prepare edit form', { variant: 'error' });
    }
  };

  const handleUpdate = async (formData) => {
    try {
      if (!editingData?.companyId || !editingData?.productionSiteId) {
        throw new Error('Missing site identification data');
      }

      const updateData = {
        ...formData,
        companyId: editingData.companyId,
        productionSiteId: editingData.productionSiteId
      };

      await updateProductionUnit(updateData);
      enqueueSnackbar('Site updated successfully', { variant: 'success' });
      setEditDialogOpen(false);
      setEditingData(null);
      await loadData();
    } catch (error) {
      console.error('Error updating site:', error);
      enqueueSnackbar(error.message || 'Failed to update site', { variant: 'error' });
    }
  };


  const handleUpdateSuccess = () => {
    enqueueSnackbar('Production data updated successfully', {
      variant: 'success'
    });
    loadData(); // Refresh the data after update
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

    return (
      <ProductionSiteList
        sites={productionUnits}
        onEdit={handleEdit}
        onDelete={handleDelete}
        userRole={user?.role}
      />
    );
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

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 2 }}>
          <ProductionSiteForm
            initialData={selectedSite}
            onSubmit={handleUpdate}
            onCancel={() => setEditDialogOpen(false)}
            loading={loading}
          />
        </Box>
      </Dialog>

      <ProductionSiteDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingData(null);
        }}
        onSubmit={handleSubmit}
        editingData={editingData}
        companyId={editingData?.companyId}
        productionSiteId={editingData?.productionSiteId}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </Box>
  );
}

export default Production;
