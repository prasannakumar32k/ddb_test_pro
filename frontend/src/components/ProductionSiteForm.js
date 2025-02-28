import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import { fetchProductionSites } from '../services/productionSiteapi';

const ProductionSiteForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    Name: '',
    Type: 'Wind',
    Location: '',
    Capacity_MW: '',
    HtscNo: '',
    Status: 'Active',
    Banking: false,
    CompanyId: 1,
    productionSiteId: null,
    InjectionValue: '',    // Added field
    AnnualProduction: ''   // Added field
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const loadSites = async () => {
      try {
        const sites = await fetchProductionSites();
        const maxId = sites.length > 0
          ? Math.max(...sites.reduce((acc, site) => {
            const id = site.ProductionSiteId || site.productionSiteId;
            const numericId = typeof id === 'number' ? id : parseInt(id, 10);
            return !isNaN(numericId) ? [...acc, numericId] : acc;
          }, [0]))
          : 0;

        setFormData(prev => ({
          ...prev,
          productionSiteId: (maxId + 1).toString()
        }));
      } catch (error) {
        console.error('Error generating ID:', error);
      }
    };

    if (!initialData) {
      loadSites();
    } else {
      setFormData({
        ...initialData,
        Capacity_MW: initialData.Capacity_MW || '',
        InjectionValue: initialData.InjectionValue || '',
        AnnualProduction: initialData.AnnualProduction || '',
        Banking: initialData.Banking === 1 || initialData.Banking === true,
        CompanyId: parseInt(initialData.CompanyId || 1, 10),
        productionSiteId: initialData.productionSiteId?.toString() || null
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    const requiredFields = {
      Name: 'Site Name',
      Location: 'Location',
      Capacity_MW: 'Capacity',
      HtscNo: 'HTSC Number',
      Type: 'Site Type',
      Status: 'Status',
      InjectionValue: 'Injection Value',
      AnnualProduction: 'Annual Production'
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([_, label]) => label);

    if (emptyFields.length > 0) {
      setError(`Please fill in the following required fields: ${emptyFields.join(', ')}`);
      return;
    }

    // Validate numeric fields
    const numericValidations = {
      Capacity_MW: 'Capacity must be greater than 0 MW',
      InjectionValue: 'Injection value must be greater than 0',
      AnnualProduction: 'Annual production must be greater than 0'
    };

    for (const [field, errorMessage] of Object.entries(numericValidations)) {
      if (parseFloat(formData[field]) <= 0) {
        setError(errorMessage);
        return;
      }
    }

    // Format data for submission
    const submissionData = {
      ...formData,
      Name: formData.Name.trim(),
      Location: formData.Location.trim(),
      Capacity_MW: parseFloat(formData.Capacity_MW),
      InjectionValue: parseFloat(formData.InjectionValue),
      AnnualProduction: parseFloat(formData.AnnualProduction),
      HtscNo: formData.HtscNo.trim(),
      Banking: formData.Banking ? 1 : 0,
      CompanyId: parseInt(formData.CompanyId),
      pk: `${formData.CompanyId}_${formData.productionSiteId}`
    };

    onSubmit(submissionData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Site Name"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            select
            label="Site Type"
            name="Type"
            value={formData.Type}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem value="Wind">Wind</MenuItem>
            <MenuItem value="Solar">Solar</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Location"
            name="Location"
            value={formData.Location}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Capacity (MW)"
            name="Capacity_MW"
            type="number"
            value={formData.Capacity_MW}
            onChange={handleChange}
            variant="outlined"
            inputProps={{
              step: 0.1,
              min: 0.1
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="HTSC Number"
            name="HtscNo"
            value={formData.HtscNo}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            select
            label="Status"
            name="Status"
            value={formData.Status}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Injection Value (MW)"
            name="InjectionValue"
            type="number"
            value={formData.InjectionValue}
            onChange={handleChange}
            variant="outlined"
            inputProps={{
              step: 0.1,
              min: 0.1
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Annual Production (MWh)"
            name="AnnualProduction"
            type="number"
            value={formData.AnnualProduction}
            onChange={handleChange}
            variant="outlined"
            inputProps={{
              step: 0.1,
              min: 0.1
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Production Site ID"
            value={formData.productionSiteId || 'Auto-generated'}
            disabled
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.Banking}
                onChange={handleChange}
                name="Banking"
                color="primary"
              />
            }
            label="Banking Enabled"
          />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button onClick={onCancel} variant="outlined" disabled={loading}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              bgcolor: '#D32F2F',
              '&:hover': {
                bgcolor: '#B71C1C'
              }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData ? 'Update Site' : 'Add Site'
            )}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductionSiteForm;
