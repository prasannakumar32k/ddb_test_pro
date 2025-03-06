import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import { fetchProductionSites, fetchProductionSiteDetails } from '../services/productionSiteapi';

// Add these styles to your theme or use them inline
const styles = {
  form: {
    '& .MuiTextField-root': {
      marginBottom: 2
    }
  },
  errorList: {
    margin: 0,
    paddingLeft: 2,
    '& li': {
      marginBottom: 0.5
    }
  },
  confirmDialog: {
    '& .MuiDialogContent-root': {
      paddingTop: 2
    }
  }
};

const ProductionSiteForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  disabledFields = []
}) => {
  const [formData, setFormData] = useState({
    companyId: '',
    productionSiteId: '',
    Name: '',
    Location: '',
    Type: 'Wind', // Default value
    Status: 'Active', // Default value
    Capacity_MW: '',
    Banking: false,
    HtscNo: '',
    InjectionValue: '',
    AnnualProduction: ''
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(''); // Add this line
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Add field configuration
  const requiredFields = {
    Name: 'Site Name',
    Location: 'Location',
    Type: 'Site Type',
    Status: 'Status',
    Capacity_MW: 'Capacity (MW)',
    HtscNo: 'HTSC Number',
    InjectionValue: 'Injection Voltage (KV)',
    AnnualProduction: 'Annual Production (L)'
  };

  useEffect(() => {
    const loadSites = async () => {
      try {
        const sites = await fetchProductionSites();
        const maxId = sites.length > 0
          ? Math.max(...sites.map(site => {
            if (!site) return 0;
            if (typeof site.productionSiteId === 'number') {
              return site.productionSiteId;
            }
            const idString = (site.productionSiteId || '').toString();
            const matches = idString.match(/\d+/);
            return matches ? parseInt(matches[0]) : 0;
          }))
          : 0;

        setFormData(prev => ({
          ...prev,
          productionSiteId: `site-${maxId + 1}`
        }));
      } catch (error) {
        console.error('Error generating ID:', error);
        setError('Failed to generate site ID');
      }
    };

    if (!initialData) {
      loadSites();
    } else {
      // Format the initial data properly
      const formattedData = {
        companyId: initialData.companyId || '',
        productionSiteId: initialData.productionSiteId || '',
        Name: initialData.name || initialData.Name || '',
        Location: initialData.location || initialData.Location || '',
        Type: initialData.type || initialData.Type || 'Wind',
        Status: initialData.status || initialData.Status || 'Active',
        Capacity_MW: (initialData.capacity_MW || initialData.Capacity_MW || '0').toString(),
        Banking: Boolean(initialData.banking || initialData.Banking),
        HtscNo: initialData.htscNo || initialData.HtscNo || '',
        InjectionValue: (initialData.injectionVoltage_KV || initialData.InjectionValue || '0').toString(),
        AnnualProduction: (initialData.annualProduction_L || initialData.AnnualProduction || '0').toString()
      };

      console.log('Setting initial form data:', formattedData);
      setFormData(formattedData);
    }
  }, [initialData]);

  // Add this debug log in the render to verify the form data
  console.log('Current form data:', formData);

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Banking' ? checked : value
    }));
    // Clear error for the field being changed
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const form = event.target.form;
      const index = Array.prototype.indexOf.call(form, event.target);
      const nextElement = form.elements[index + 1];
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Check required fields
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field]) {
        newErrors[field] = `${label} is required`;
        isValid = false;
      }
    });

    // Validate numeric fields
    if (formData.Capacity_MW && Number(formData.Capacity_MW) <= 0) {
      newErrors.Capacity_MW = 'Capacity must be greater than 0';
      isValid = false;
    }
    if (formData.InjectionValue && Number(formData.InjectionValue) <= 0) {
      newErrors.InjectionValue = 'Injection voltage must be greater than 0';
      isValid = false;
    }
    if (formData.AnnualProduction && Number(formData.AnnualProduction) <= 0) {
      newErrors.AnnualProduction = 'Annual production must be greater than 0';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    onSubmit(formData);
  };

  return (
    <Box sx={{ p: 2 }}>
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Please fix the following errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Existing form fields with added validation and keyboard navigation */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              disabled={loading || disabledFields.includes('Name')}
              error={!!errors.Name}
              helperText={errors.Name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              name="Location"
              value={formData.Location}
              onChange={handleChange}
              required
              disabled={loading || disabledFields.includes('Location')}
              error={!!errors.Location}
              helperText={errors.Location}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                name="Type"
                value={formData.Type}
                onChange={handleChange}
                label="Type"
                disabled={loading}
              >
                <MenuItem value="Wind">Wind</MenuItem>
                <MenuItem value="Solar">Solar</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                name="Status"
                value={formData.Status}
                onChange={handleChange}
                label="Status"
                disabled={loading}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Capacity (MW)"
              name="Capacity_MW"
              type="number"
              value={formData.Capacity_MW || '0'}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.Capacity_MW}
              helperText={errors.Capacity_MW}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="HTSC No"
              name="HtscNo"
              value={formData.HtscNo}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Injection Voltage (KV)"
              name="InjectionValue"
              type="number"
              value={formData.InjectionValue || '0'}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.InjectionValue}
              helperText={errors.InjectionValue}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Annual Production (L)"
              name="AnnualProduction"
              type="number"
              value={formData.AnnualProduction || '0'}
              onChange={handleChange}
              disabled={loading}
              error={!!errors.AnnualProduction}
              helperText={errors.AnnualProduction}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.Banking}
                  onChange={handleChange}
                  name="Banking"
                  disabled={loading}
                />
              }
              label="Banking Enabled"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={onCancel}
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData ? 'Update' : 'Create'
            )}
          </Button>
        </Box>
      </form>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {initialData ? 'Confirm Update' : 'Confirm Creation'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {initialData ? 'update' : 'create'} this production site?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="primary">Site Details:</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {Object.entries(requiredFields).map(([field, label]) => (
                <Grid item xs={6} key={field}>
                  <Typography variant="body2">
                    <strong>{label}:</strong> {formData[field]}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionSiteForm;
