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
import {
  fetchProductionUnits,
  createProductionUnit,
  updateProductionUnit,
  deleteProductionUnit,
  fetchProductionSiteDetails
} from '../services/productionSiteapi';
import {
  createProductionData,
  fetchProductionSiteHistory,
  updateProductionData,
  deleteProductionData,
} from '../services/productionapi';
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
const ProductionTable = ({ data = [], matrixType, onEdit, onDelete }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Month</TableCell>
            {matrixType === 'unit' ? (
              // Unit Matrix Headers
              Array.from({ length: 5 }, (_, i) => (
                <TableCell key={`c${i + 1}`} align="right">C{i + 1}</TableCell>
              ))
            ) : (
              // Charge Matrix Headers
              Array.from({ length: 10 }, (_, i) => (
                <TableCell key={`c00${i + 1}`} align="right">C00{i + 1}</TableCell>
              ))
            )}
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.sk} hover>
              <TableCell>{formatMonthYear(row.sk)}</TableCell>
              {matrixType === 'unit' ? (
                // Unit Matrix Values
                Array.from({ length: 5 }, (_, i) => (
                  <TableCell key={`c${i + 1}`} align="right">
                    {row[`c${i + 1}`].toFixed(2)}
                  </TableCell>
                ))
              ) : (
                // Charge Matrix Values
                Array.from({ length: 10 }, (_, i) => (
                  <TableCell key={`c00${i + 1}`} align="right">
                    {row[`c00${i + 1}`].toFixed(2)}
                  </TableCell>
                ))
              )}
              <TableCell align="right">
                {(matrixType === 'unit' ? row.totalUnit : row.totalCharge).toFixed(2)}
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => onEdit(row)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(row)}>
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

// Update the ChartLegend component (new)
const ChartLegend = ({ series }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 3,
      mt: 2,
      pt: 2,
      borderTop: '1px solid',
      borderColor: 'divider'
    }}
  >
    {series.map((item) => (
      <Box
        key={item.label}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: item.color
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {item.label}
        </Typography>
      </Box>
    ))}
  </Box>
);

// Update the ProductionGraph component
const ProductionGraph = ({ data, chartType = 'line', matrixType = 'unit' }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: DateFormatter.formatMonthYear(item.sk),
      ...(matrixType === 'unit'
        ? {
          c1: Number(parseFloat(item.c1 || 0).toFixed(2)),
          c2: Number(parseFloat(item.c2 || 0).toFixed(2)),
          c3: Number(parseFloat(item.c3 || 0).toFixed(2)),
          c4: Number(parseFloat(item.c4 || 0).toFixed(2)),
          c5: Number(parseFloat(item.c5 || 0).toFixed(2)),
        }
        : {
          c001: Number(parseFloat(item.c001 || 0).toFixed(2)),
          c002: Number(parseFloat(item.c002 || 0).toFixed(2)),
          c003: Number(parseFloat(item.c003 || 0).toFixed(2)),
          c004: Number(parseFloat(item.c004 || 0).toFixed(2)),
          c005: Number(parseFloat(item.c005 || 0).toFixed(2)),
          c006: Number(parseFloat(item.c006 || 0).toFixed(2)),
          c007: Number(parseFloat(item.c007 || 0).toFixed(2)),
          c008: Number(parseFloat(item.c008 || 0).toFixed(2)),
          c009: Number(parseFloat(item.c009 || 0).toFixed(2)),
          c010: Number(parseFloat(item.c010 || 0).toFixed(2)),
        }
      )
    }));
  }, [data, matrixType]);

  const series = useMemo(() => {
    return matrixType === 'unit'
      ? Array.from({ length: 5 }, (_, i) => ({
        dataKey: `c${i + 1}`,
        label: `C${i + 1}`,
        color: `hsl(${(i * 360) / 5}, 70%, 50%)`
      }))
      : Array.from({ length: 10 }, (_, i) => ({
        dataKey: `c00${i + 1}`,
        label: `C00${i + 1}`,
        color: `hsl(${(i * 360) / 10}, 70%, 50%)`
      }));
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
    if (!selectedData?.sk) {
      enqueueSnackbar('No data selected for deletion', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);

      // Ensure sk is in MMYYYY format - keep all 6 digits
      const sk = selectedData.sk;

      console.log('[ProductionSiteDetails] Deleting data:', {
        companyId,
        productionSiteId,
        sk
      });

      await deleteProductionData(
        parseInt(companyId),
        parseInt(productionSiteId),
        sk
      );

      enqueueSnackbar('Production data deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedData(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete production data:', error);
      enqueueSnackbar(error.message || 'Failed to delete data', { variant: 'error' });
    } finally {
      setLoading(false);
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
      setProductionData(productionHistory.data || []);
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
      const selectedDate = new Date(formData.selectedDate);
      const sk = DateFormatter.toApiFormat(selectedDate);

      if (!sk) {
        throw new Error('Invalid date format');
      }

      const payload = {
        ...formData,
        sk,
        companyId: parseInt(companyId),
        productionSiteId: parseInt(productionSiteId)
      };

      await createProductionData(
        parseInt(companyId),
        parseInt(productionSiteId),
        payload
      );

      enqueueSnackbar('Production data added successfully', { variant: 'success' });
      await loadData(); // Refresh data after successful addition
      return true;
    } catch (error) {
      console.error('Failed to add production data:', error);
      enqueueSnackbar(error.message || 'Failed to add data', { variant: 'error' });
      throw error;
    }
  };

  // Update the handleUpdateData function
  const handleUpdateData = async (formData) => {
    try {
      const selectedDate = new Date(formData.selectedDate);
      const sk = DateFormatter.toApiFormat(selectedDate);

      if (!sk) {
        throw new Error('Invalid date format');
      }

      // Rest of update logic...
    } catch (error) {
      console.error('Update error:', error);
      throw error;
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
