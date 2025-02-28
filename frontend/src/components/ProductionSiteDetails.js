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
  Tooltip // Add this import
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
  PlayArrow as StatusIcon
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAuth } from '../context/AuthContext';
import ProductionSiteForm from './ProductionSiteForm';
import ProductionSiteDataForm from './ProductionSiteDataForm';
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

// Component to display label-value pairs
const DetailItem = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
    <Typography variant="body2" color="text.secondary" component="div">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} component="div">
      {value}
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
        {new Date(data.sk).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        })}
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
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleMenuOpen = (event, row) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = () => {
    if (selectedRow) {
      onEdit(selectedRow);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRow) {
      onDelete(selectedRow);
    }
    handleMenuClose();
  };

  const getColumns = () => {
    if (matrixType === 'charge') {
      return Array.from({ length: 8 }, (_, i) => ({
        id: `c00${i + 1}`,
        label: `C00${i + 1}`
      }));
    }
    return Array.from({ length: 5 }, (_, i) => ({
      id: `c${i + 1}`,
      label: `C${i + 1}`
    }));
  };

  const columns = getColumns();

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => DateFormatter.sortDatesDesc(a, b));
  }, [data]);

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              {columns.map(column => (
                <TableCell key={column.id} align="right">
                  {column.label}
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow key={row.sk} hover>
                <TableCell>{DateFormatter.formatForTable(row.sk)}</TableCell>
                {columns.map(column => (
                  <TableCell key={column.id} align="right">
                    {row[column.id] || 0}
                  </TableCell>
                ))}
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, row)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </>
  );
};

const formatMonthYear = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
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
  const series = React.useMemo(() => {
    if (matrixType === 'charge') {
      return Array.from({ length: 8 }, (_, i) => ({
        label: `c00${i + 1}`
      }));
    }
    return Array.from({ length: 5 }, (_, i) => ({
      label: `c${i + 1}`
    }));
  }, [matrixType]);

  // Ensure data is properly formatted
  const formattedData = React.useMemo(() => {
    return data.map(d => ({
      ...d,
      date: new Date(d.sk).toLocaleDateString('en-US', { month: 'short' })
    })).sort((a, b) => new Date(a.sk) - new Date(b.sk));
  }, [data]);

  const chartProps = {
    series: series.map(s => ({
      data: formattedData.map(d => {
        const value = Number(d[s.label]);
        return isNaN(value) ? 0 : value;
      }),
      label: s.label.toUpperCase()
    })),
    xAxis: [{
      data: formattedData.map(d => d.date),
      scaleType: 'band'
    }],
    height: 400,
    margin: { top: 20, right: 40, bottom: 30, left: 40 }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {formattedData.length > 0 ? (
        <>
          {chartType === 'line' ? (
            <LineChart
              {...chartProps}
              sx={{
                '.MuiLineElement-root': {
                  strokeWidth: 2
                }
              }}
            />
          ) : (
            <BarChart
              {...chartProps}
              sx={{
                '.MuiBarElement-root': {
                  borderRadius: 1
                }
              }}
            />
          )}
          <ChartLegend series={chartProps.series} />
        </>
      ) : (
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No production data available</Typography>
        </Box>
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
      Unit Matrix
    </ToggleButton>
    <ToggleButton value="charge">
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
  const { companyId, productionSiteId } = useParams();
  const navigate = useNavigate();

  const [productionData, setProductionData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [siteDetails, setSiteDetails] = useState(null);
  const [chartType, setChartType] = useState('line');
  // Add matrixType state
  const [matrixType, setMatrixType] = useState('unit');
  const [site, setSite] = useState(null);

  // Add site details fetch
  const loadSiteDetails = async () => {
    try {
      const siteData = await fetchProductionSiteDetails(companyId, productionSiteId);
      setSite(siteData);
    } catch (error) {
      console.error('Error loading site details:', error);
    }
  };

  // Update the loadData function to use productionSiteId instead of siteId
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSiteDetails(),
        fetchProductionSiteHistory(companyId, productionSiteId)
      ]).then(([_, result]) => {
        if (result.error) {
          setError(result.message);
          setProductionData([]);
        } else {
          setProductionData(result.data);
          setError(null);
        }
      });
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load production history. Please try again later.');
      setProductionData([]);
    } finally {
      setLoading(false);
    }
  };

  // Make sure useEffect uses the same variable name
  useEffect(() => {
    if (companyId && productionSiteId) {
      loadData();
    }
  }, [companyId, productionSiteId, matrixType]);

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.selectedDate) {
        throw new Error('Please select a valid date');
      }

      // Ensure the date is the first of the month
      const selectedDate = new Date(formData.selectedDate.getFullYear(),
        formData.selectedDate.getMonth(),
        1);

      const payload = {
        selectedDate,
        companyId: parseInt(companyId),
        productionSiteId: parseInt(productionSiteId),
        c1: parseInt(formData.c1) || 0,
        c2: parseInt(formData.c2) || 0,
        c3: parseInt(formData.c3) || 0,
        c4: parseInt(formData.c4) || 0,
        c5: parseInt(formData.c5) || 0,
        matrixType: matrixType
      };

      if (editingData) {
        await updateProductionData(companyId, productionSiteId, payload);
      } else {
        await createProductionData(companyId, productionSiteId, payload);
      }

      setDialogOpen(false);
      setEditingData(null);
      await loadData();
    } catch (error) {
      console.error('Failed to save production data:', error);
      setError(error.message || 'Failed to save production data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (data) => {
    try {
      await deleteProductionData(companyId, productionSiteId, data.sk);
      await loadData();
    } catch (error) {
      console.error('Failed to delete production data:', error);
      setError('Failed to delete production data');
    }
  };

  // Update the getBankingStatus function
  const getBankingStatus = (hasBanking) => {
    // Convert to number and handle both banking and hasBanking properties
    const bankingValue = parseInt(hasBanking);
    return bankingValue === 1 ? 'Has Banking' : 'No Banking';
  };

  // Render function for the header
  const renderHeader = () => (
    <Paper sx={{ p: 3, mb: 3, borderLeft: 6, borderColor: site?.type?.toLowerCase() === 'wind' ? '#1976D2' : '#FFC107' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getTypeIcon(site?.type)}
          <Typography variant="h5" sx={{ ml: 2 }}>
            {site?.name || 'New Site'}
          </Typography>
        </Box>
        <Box>
          {site?.banking && (
            <Tooltip title="Banking Enabled">
              <BankingIcon sx={{ color: 'success.main', mr: 1 }} />
            </Tooltip>
          )}
          <StatusIcon 
            sx={{ 
              color: site?.status === 'Active' ? 'success.main' : 'error.main'
            }} 
          />
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DetailCard
            title="Location"
            value={site?.location}
            icon={<LocationIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DetailCard
            title="Capacity"
            value={site?.capacity_MW ? `${site.capacity_MW} MW` : 'Not set'}
            icon={<CapacityIcon />}
            color={site?.type?.toLowerCase() === 'wind' ? '#1976D2' : '#FFC107'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DetailCard
            title="Injection Voltage"
            value={site?.injectionVoltage_KV ? `${site.injectionVoltage_KV} KV` : 'Not set'}
            icon={<VoltageIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DetailCard
            title="Annual Production"
            value={site?.annualProduction_L ? `${site.annualProduction_L.toLocaleString()} L` : 'Not set'}
            icon={<DateIcon />}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  // Render function for no data state
  const renderNoData = () => (
    <Alert 
      severity="info" 
      sx={{ mb: 2 }}
      action={
        <Button 
          color="inherit" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Production Data
        </Button>
      }
    >
      No production data available for {site?.name || 'this site'} yet.
    </Alert>
  );

  const renderProductionData = (data) => (
    <Grid container spacing={3}>
      {/* Unit Matrix Card */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Unit Matrix
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5].map((num) => (
              <Grid item xs={6} sm={4} key={`unit-${num}`}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    C{num}:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {data[`c${num}`] || '0'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
  
      {/* Charge Matrix Card */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Charge Matrix
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <Grid item xs={6} sm={4} key={`charge-${num}`}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    C00{num}:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {data[`c00${num}`] || '0'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        mb: 4,
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        pb: 2
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/production')}
          sx={{ alignSelf: 'flex-start', mb: 1 }}
        >
          Back to Production Sites
        </Button>
        <Typography variant="h4" fontWeight="600">
          {siteDetails?.name || 'Production Site'}
        </Typography>
      </Box>

      {/* Graph Section with Controls */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ChartTypeToggle
              chartType={chartType}
              onChartTypeChange={(_, newValue) => newValue && setChartType(newValue)}
            />
          </Box>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setDialogOpen(true)}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            Add Production Data
          </Button>
        </Box>
        <ProductionGraph
          data={productionData}
          chartType={chartType}
          matrixType={matrixType}
        />
      </Paper>

      {/* Production History Table */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h6" fontWeight="600">
            Historical Production Data
          </Typography>
          <MatrixTypeToggle
            matrixType={matrixType}
            onMatrixTypeChange={(_, newValue) => newValue && setMatrixType(newValue)}
          />
        </Box>
        {productionData.length > 0 ? (
          <ProductionTable
            data={productionData}
            matrixType={matrixType}
            onEdit={(data) => {
              setEditingData(data);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
          />
        ) : (
          <Alert severity="info">
            No production data available
          </Alert>
        )}
      </Paper>

      {/* Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingData(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingData ? 'Edit Production Data' : 'Add Production Data'}
        </DialogTitle>
        <DialogContent>
          <ProductionSiteDataForm
            initialData={editingData}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setDialogOpen(false);
              setEditingData(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

/* eslint-disable */
export default ProductionSiteDetails;
