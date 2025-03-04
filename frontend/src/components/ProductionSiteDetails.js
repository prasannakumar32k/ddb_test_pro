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
      p: 2.5,
      height: '110px',
      borderRadius: 2,
      bgcolor: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      '&:hover': {
        boxShadow: 3,
        transform: 'translateY(-2px)',
        transition: 'all 0.2s'
      }
    }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
      <Icon sx={{ fontSize: 20, mr: 1, color: color }} />
      {label}
    </Typography>
    <Typography variant="h6" fontWeight="600" color="text.primary">
      {value}
    </Typography>
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

// Update ProductionTable component
const ProductionTable = ({ data, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            {/* Unit Matrix */}
            <TableCell align="right">C1</TableCell>
            <TableCell align="right">C2</TableCell>
            <TableCell align="right">C3</TableCell>
            <TableCell align="right">C4</TableCell>
            <TableCell align="right">C5</TableCell>
            {/* Charge Matrix */}
            <TableCell align="right">C001</TableCell>
            <TableCell align="right">C002</TableCell>
            <TableCell align="right">C003</TableCell>
            <TableCell align="right">C004</TableCell>
            <TableCell align="right">C005</TableCell>
            <TableCell align="right">C006</TableCell>
            <TableCell align="right">C007</TableCell>
            <TableCell align="right">C008</TableCell>
            <TableCell align="right">C009</TableCell>
            <TableCell align="right">C010</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.sk}>
              <TableCell>{DateFormatter.formatMonthYear(row.sk)}</TableCell>
              {/* Unit Matrix */}
              <TableCell align="right">{row.c1.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c2.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c3.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c4.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c5.toFixed(2)}</TableCell>
              {/* Charge Matrix */}
              <TableCell align="right">{row.c001.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c002.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c003.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c004.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c005.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c006.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c007.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c008.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c009.toFixed(2)}</TableCell>
              <TableCell align="right">{row.c010.toFixed(2)}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(row)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(row.sk)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Add this new component for the chart toggle
const ChartTypeToggle = ({ chartType, onChartTypeChange }) => (
  <ToggleButtonGroup
    value={chartType}
    exclusive
    onChange={onChartTypeChange}
    size="small"
    sx={{ mb: 2 }}
  >
    <ToggleButton value="line">
      <TimelineIcon sx={{ mr: 1 }} /> Line
    </ToggleButton>
    <ToggleButton value="bar">
      <BarChartIcon sx={{ mr: 1 }} /> Bar
    </ToggleButton>
  </ToggleButtonGroup>
);

// Update the ProductionGraph component
const ProductionGraph = ({ data, chartType = 'line', matrixType = 'unit' }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: DateFormatter.formatMonthYear(item.sk),
      ...(matrixType === 'unit'
        ? {
          c1: item.c1,
          c2: item.c2,
          c3: item.c3,
          c4: item.c4,
          c5: item.c5,
        }
        : {
          c001: item.c001,
          c002: item.c002,
          c003: item.c003,
          c004: item.c004,
          c005: item.c005,
          c006: item.c006,
          c007: item.c007,
          c008: item.c008,
          c009: item.c009,
          c010: item.c010,
        })
    }));
  }, [data, matrixType]);

  const series = useMemo(() => {
    return matrixType === 'unit'
      ? Array.from({ length: 5 }, (_, i) => ({
        dataKey: `c${i + 1}`,
        label: `C${i + 1}`
      }))
      : Array.from({ length: 10 }, (_, i) => {
        const num = String(i + 1).padStart(3, '0');
        return {
          dataKey: `c${num}`,
          label: `C${num}`
        };
      });
  }, [matrixType]);

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      {chartType === 'line' ? (
        <LineChart
          xAxis={[{
            dataKey: 'date',
            scaleType: 'band',
            tickLabelStyle: { angle: 45, textAnchor: 'start' }
          }]}
          series={series}
          dataset={chartData}
          height={400}
          margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
        />
      ) : (
        <BarChart
          xAxis={[{
            dataKey: 'date',
            scaleType: 'band',
            tickLabelStyle: { angle: 45, textAnchor: 'start' }
          }]}
          series={series}
          dataset={chartData}
          height={400}
          margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
        />
      )}
    </Box>
  );
};

// Add MatrixTypeToggle component (new)
const MatrixTypeToggle = ({ matrixType, onMatrixTypeChange }) => (
  <ToggleButtonGroup
    value={matrixType}
    exclusive
    onChange={onMatrixTypeChange}
    size="small"
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

// Update the main ProductionSiteDetails component
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
  const [matrixType, setMatrixType] = useState('unit');

  // Handler functions
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleMatrixTypeChange = (event, newType) => {
    if (newType !== null) {
      setMatrixType(newType);
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
      if (!formData.selectedDate) {
        throw new Error('Please select a date');
      }

      console.log('[ProductionSiteDetails] Submitting data:', formData);

      const result = await createProductionData(
        parseInt(companyId),
        parseInt(productionSiteId),
        formData
      );

      enqueueSnackbar('Production data added successfully', { variant: 'success' });
      setIsAddDialogOpen(false);
      await loadData();
      return true;
    } catch (error) {
      console.error('Failed to add production data:', error);
      enqueueSnackbar(error.message || 'Failed to add data', {
        variant: 'error',
        autoHideDuration: 5000
      });
      return false;
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

  // Remove SiteDetailsSection and update the return section
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/production-sites')}
          variant="outlined"
        >
          Back to Sites
        </Button>
        {site && (
          <Typography variant="h5" sx={{ flex: 1, textAlign: 'center', mx: 2 }}>
            {site.name}
          </Typography>
        )}
        <Button
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
          variant="contained"
          color="primary"
        >
          Add Production Data
        </Button>
      </Box>

      {/* Chart Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">Production Analysis</Typography>
          </Box>
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <MatrixTypeToggle
              matrixType={matrixType}
              onMatrixTypeChange={handleMatrixTypeChange}
            />
            <ChartTypeToggle
              chartType={chartType}
              onChartTypeChange={handleChartTypeChange}
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <ErrorDisplay error={error} />
        ) : (
          <ProductionGraph
            data={productionData}
            chartType={chartType}
            matrixType={matrixType}
          />
        )}
      </Paper>

      {/* Production Data Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Historical Production Data</Typography>
        </Box>
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
      >
        <DialogTitle>New Production Data</DialogTitle>
        <DialogContent>
          <ProductionSiteDataForm
            onSubmit={async (formData) => {
              await handleFormSubmit(formData);
              setIsAddDialogOpen(false);
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
    </Box >
  );
};

export default ProductionSiteDetails;
