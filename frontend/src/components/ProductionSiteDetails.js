import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Tooltip,
  DialogContentText, // Added import
  DialogActions     // Added import
} from '@mui/material';

import {
  AddCircleOutline as AddIcon,
  EditOutlined as EditIcon,
  DeleteOutline as DeleteIcon,
  MoreVert as MoreVertIcon,
  WindPower as WindIcon, // Use this for wind power icon
  WbSunny as SolarIcon, // Changed from SunIcon to SolarIcon for consistency
  LocationOn as LocationIcon,
  CheckCircle as ActiveIcon,
  Dangerous as InactiveIcon,
  AccountBalance as BankingIcon,
  ArrowBack as ArrowBackIcon,
  Power as PowerIcon,
  ElectricBolt as VoltageIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Speed as CapacityIcon,
  CalendarToday as DateIcon,
  PlayArrow as StatusIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAuth } from '../context/AuthContext';
import ProductionSiteForm from './ProductionSiteForm';
import ProductionSiteDataForm from './ProductionSiteDataForm';
import ProductionDataTable from './ProductionDataTable';  // Keep this import
import ProductionChart from './ProductionChart';
import {
  productionApi,
  createProductionData,
  deleteProductionData,
  fetchProductionData,
  fetchProductionSiteHistory,
  fetchProductionUnits,
  updateProductionData
} from '../services/productionapi';
import {
  createProductionUnit,
  updateProductionUnit,
  deleteProductionUnit,
  fetchProductionSiteDetails
} from '../services/productionSiteapi';
import DateFormatter from '../utils/DateFormatter';
import { isValid } from 'date-fns';
import { useSnackbar } from 'notistack';

// Keep only one formatMonthYear function at the top of the file
const formatMonthYear = (sk) => {
  try {
    if (typeof sk === 'string' && sk.length === 6) {
      // Handle SK format (MMYYYY)
      const month = sk.substring(0, 2);
      const year = sk.substring(2);

      return new Date(parseInt(year), parseInt(month) - 1)
        .toLocaleString('en-US', {
          month: 'short',
          year: 'numeric'
        });
    }
    return 'Invalid Date';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Update the DetailItem component to handle undefined values
const DetailItem = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
    <Typography variant="body2" color="text.secondary" component="div">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} component="div">
      {value || 'N/A'}
    </Typography>
  </Box>
);

const ErrorDisplay = ({ error }) => (
  <Alert
    severity="error"
    sx={{
      mb: 2,
      '& .MuiAlert-message': {
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }
    }}
  >
    <Typography variant="subtitle1" fontWeight="bold">
      Error Loading Data
    </Typography>
    <Typography variant="body2">
      {error}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      Please ensure DynamoDB Local is running and contains data.
    </Typography>
  </Alert>
);

// Update the DetailCard component
const DetailCard = ({ icon: Icon, label, value, color = 'primary.main' }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      height: '100%',
      borderRadius: 2,
      backgroundColor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Icon sx={{ fontSize: 28, color }} />
      <Typography variant="body1" color="text.primary" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

// Update the production data cards layout
const ProductionDataCard = ({ data, onMenuOpen }) => (
  <Paper
    elevation={1}
    sx={{
      p: 2.5,
      borderRadius: 2,
      bgcolor: 'white',
      '&:hover': {
        boxShadow: 2
      }
    }}
  >
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 2
    }}>
      <Typography variant="subtitle1" fontWeight="500">
        {formatMonthYear(data.sk)}
      </Typography>
      <IconButton
        size="small"
        onClick={onMenuOpen}
        sx={{ color: 'text.secondary' }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Box>
    <Grid container spacing={2}>
      {Object.entries(data)
        .filter(([key]) => key.startsWith('c') && key !== 'companyId')
        .map(([key, value]) => (
          <Grid item xs={6} sm={4} md={2} key={key}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'grey.50',
                borderRadius: 1,
                minWidth: '100px'
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                {key.toUpperCase()}
              </Typography>
              <Typography variant="body1" fontWeight="500">
                {value}
              </Typography>
            </Box>
          </Grid>
        ))}
    </Grid>
  </Paper>
);

// Add the getTypeIcon function before the ProductionSiteDetails component
const getTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'wind':
      return <WindIcon sx={{ fontSize: 40, color: '#1976D2' }} />;
    case 'solar':
      return <SolarIcon sx={{ fontSize: 40, color: '#FFC107' }} />;
    default:
      return <PowerIcon sx={{ fontSize: 40, color: 'text.secondary' }} />;
  }
};

// Update ProductionSiteDetails styles
const ProductionSiteDetails = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { companyId, productionSiteId } = useParams();

  // State management
  const [site, setSite] = useState(null);
  const [productionData, setProductionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [existingDataDialogOpen, setExistingDataDialogOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [matrixType, setMatrixType] = useState('unit');

  // Handler functions
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleEditData = (data) => {
    setSelectedData(data);
    setEditDialogOpen(true);
  };

  const handleDeleteData = (data) => {
    setSelectedData(data);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedData) {
      enqueueSnackbar('No data selected for deletion', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      console.log('[ProductionSiteDetails] Deleting data:', {
        companyId,
        productionSiteId,
        sk: selectedData.sk
      });

      await deleteProductionData(
        companyId,
        productionSiteId,
        selectedData.sk
      );

      enqueueSnackbar('Production data deleted successfully', { variant: 'success' });
      await loadData(); // Refresh data
    } catch (error) {
      console.error('[ProductionSiteDetails] Delete error:', error);
      enqueueSnackbar(error.message || 'Failed to delete data', { variant: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Add loadData function
  const loadData = async () => {
    try {
      setLoading(true);
      const [siteDetails, productionHistory] = await Promise.all([
        fetchProductionSiteDetails(companyId, productionSiteId),
        fetchProductionSiteHistory(companyId, productionSiteId)
      ]);

      setSite(siteDetails);
      // productionHistory is now directly an array of transformed data
      setProductionData(productionHistory || []);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
      enqueueSnackbar(err.message || 'Failed to load data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Update the handleFormSubmit function
  const handleFormSubmit = async (formData) => {
    try {
      const apiDate = DateFormatter.toApiFormat(formData.selectedDate);
      if (!formData.selectedDate || !(formData.selectedDate instanceof Date)) {
        throw new Error('Please select a valid date');
      }

      const sk = DateFormatter.formatToSK(formData.selectedDate);
      const dataToSubmit = {
        ...formData,
        sk
      };

      // Check for existing data first
      const existingData = await productionApi.checkExisting(
        companyId,
        productionSiteId,
        sk
      );

      if (existingData) {
        setPendingFormData(dataToSubmit);
        setExistingDataDialogOpen(true);
        return false;
      }

      // Create new data if no existing data found
      await productionApi.create(companyId, productionSiteId, dataToSubmit);
      enqueueSnackbar('Production data created successfully', {
        variant: 'success'
      });
      await loadData();
      return true;

    } catch (error) {
      console.error('[ProductionSiteDetails] Submit error:', error);
      enqueueSnackbar(error.message || 'Failed to process data', {
        variant: 'error'
      });
      return false;
    }
  };

  // Add this function to handle the update confirmation
  const handleUpdateConfirm = async () => {
    try {
      if (!pendingFormData) return;

      await productionApi.update(companyId, productionSiteId, pendingFormData);
      enqueueSnackbar('Production data updated successfully', {
        variant: 'success'
      });
      await loadData();
      setExistingDataDialogOpen(false);
      setIsAddDialogOpen(false);
      setPendingFormData(null);
    } catch (error) {
      console.error('[ProductionSiteDetails] Update error:', error);
      enqueueSnackbar(error.message || 'Failed to update data', {
        variant: 'error'
      });
    }
  };

  // Update the handleUpdateData function
  const handleUpdateData = async (formData) => {
    try {
      setLoading(true);

      if (!companyId || !productionSiteId || !formData.sk) {
        throw new Error('Missing required parameters');
      }

      console.log('[ProductionSiteDetails] Updating data:', formData);

      const result = await updateProductionData(
        companyId,
        productionSiteId,
        formData
      );

      console.log('[ProductionSiteDetails] Update successful:', result);

      // Refresh data after update
      await loadData();

      enqueueSnackbar('Production data updated successfully', {
        variant: 'success'
      });

      setEditDialogOpen(false);

    } catch (error) {
      console.error('[ProductionSiteDetails] Update error:', error);
      enqueueSnackbar(error.message || 'Failed to update data', {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect for initial data loading
  useEffect(() => {
    loadData();
  }, [companyId, productionSiteId]);

  // Update the prepareChartData function for sorting
  const prepareChartData = (data, matrixType) => {
    return data
      .sort((a, b) => {
        const dateA = new Date(a.sk.slice(2), parseInt(a.sk.slice(0, 2)) - 1);
        const dateB = new Date(b.sk.slice(2), parseInt(b.sk.slice(0, 2)) - 1);
        return dateA - dateB;
      })
      .map(item => ({
        month: formatMonthYear(item.sk),
        ...(matrixType === 'unit' ? {
          c1: parseFloat(item.c1) || 0,
          c2: parseFloat(item.c2) || 0,
          c3: parseFloat(item.c3) || 0,
          c4: parseFloat(item.c4) || 0,
          c5: parseFloat(item.c5) || 0,
        } : {
          c001: parseFloat(item.c001) || 0,
          c002: parseFloat(item.c002) || 0,
          c003: parseFloat(item.c003) || 0,
          c004: parseFloat(item.c004) || 0,
          c005: parseFloat(item.c005) || 0,
        })
      }));
  };

  // Add the handleCreate function inside the component
  const handleCreate = async (formData) => {
    try {
      setLoading(true);

      // Check for existing data
      const existingData = await productionApi.checkExisting(
        companyId,
        productionSiteId,
        formData.sk
      );

      if (existingData) {
        const confirmed = window.confirm(
          'Data already exists for this month. Do you want to update it?'
        );

        if (confirmed) {
          await productionApi.update(companyId, productionSiteId, formData);
          enqueueSnackbar('Production data updated successfully', {
            variant: 'success'
          });
        } else {
          enqueueSnackbar('Operation cancelled', { variant: 'info' });
          return;
        }
      } else {
        await productionApi.create(companyId, productionSiteId, formData);
        enqueueSnackbar('Production data created successfully', {
          variant: 'success'
        });
      }

      await loadData(); // Refresh data
      setCreateDialogOpen(false);

    } catch (error) {
      console.error('[ProductionSiteDetails] Create/Update error:', error);
      enqueueSnackbar(error.message || 'Failed to process data', {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMatrixTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setMatrixType(newValue);
    }
  };

  // Remove SiteDetailsSection and update the return section
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Back Button - Moved outside */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/production')}
          variant="contained"
          sx={{
            backgroundColor: 'white',
            color: 'primary.main',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            },
            transition: 'all 0.3s ease',
            fontWeight: 500,
            px: 3,
            py: 1
          }}
        >
          Back to Sites
        </Button>
      </Box>

      {/* Header Section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          {site && (
            <Typography variant="h5" sx={{
              flex: 1,
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: '0.25px'
            }}>
              {site.name}
            </Typography>
          )}
          <Button
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            Add Production Data
          </Button>
        </Box>
      </Paper>

      {/* Remove Grid container with DetailCards */}

      {/* Rest of the components remain the same */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <ToggleButtonGroup
          value={matrixType}
          exclusive
          onChange={handleMatrixTypeChange}
          size="small"
          sx={{
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '& .MuiToggleButton-root': {
              px: 3,
              py: 1,
              borderColor: 'divider',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }
            }
          }}
        >
          <ToggleButton value="unit">
            <PowerIcon sx={{ mr: 1 }} />
            Unit Matrix
          </ToggleButton>
          <ToggleButton value="charge">
            <VoltageIcon sx={{ mr: 1 }} />
            Charge Matrix
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          backgroundColor: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}
      >
        <ProductionChart
          data={productionData}
          chartType={chartType}
          matrixType={matrixType}
        />
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Historical Production Data
        </Typography>
        <ProductionDataTable
          data={productionData}
          matrixType={matrixType}
          onRefresh={loadData}
          onEdit={handleEditData}
          onDelete={handleDeleteData}
        />
      </Paper>

      {/* Add Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: 1,
          borderColor: 'divider',
          px: 3,
          py: 2
        }}>
          New Production Data
        </DialogTitle>
        <DialogContent>
          <ProductionSiteDataForm
            onSubmit={async (formData) => {
              const success = await handleFormSubmit(formData);
              if (success) {
                setIsAddDialogOpen(false);
              }
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Production Data</DialogTitle>
        <DialogContent>
          <ProductionSiteDataForm
            initialData={selectedData}
            onSubmit={async (formData) => {
              try {
                await handleUpdateData(formData);
                setEditDialogOpen(false);
                await loadData();
              } catch (error) {
                console.error('Edit submission error:', error);
                enqueueSnackbar(error.message || 'Failed to update data', {
                  variant: 'error'
                });
              }
            }}
            onCancel={() => setEditDialogOpen(false)}
            startWithReview={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the production data for{' '}
            {selectedData ? DateFormatter.formatMonthYear(selectedData.sk) : ''}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Existing Data Dialog */}
      <ExistingDataDialog
        open={existingDataDialogOpen}
        onClose={() => {
          setExistingDataDialogOpen(false);
          setPendingFormData(null);
        }}
        onConfirm={handleUpdateConfirm}
        month={pendingFormData ? DateFormatter.formatMonthYear(pendingFormData.sk) : ''}
      />
    </Box >
  );
};

// Add ExistingDataDialog component
const ExistingDataDialog = ({ open, onClose, onConfirm, month }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Existing Data Found</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Production data already exists for {month}.
        Do you want to update the existing data?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="primary" variant="contained">
        Update Existing
      </Button>
    </DialogActions>
  </Dialog>
);

export default ProductionSiteDetails;
