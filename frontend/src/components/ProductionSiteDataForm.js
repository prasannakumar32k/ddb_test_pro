import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { startOfMonth, isValid } from 'date-fns';
import DateFormatter from '../utils/DateFormatter';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { productionApi } from '../services/productionapi';

const steps = ['Select Date', 'Unit Matrix', 'Charge Matrix', 'Review'];

const ProductionSiteDataForm = ({ initialData, onSubmit, onCancel, startWithReview = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    selectedDate: new Date(),
    c1: '',
    c2: '',
    c3: '',
    c4: '',
    c5: '',
    c001: '',
    c002: '',
    c003: '',
    c004: '',
    c005: '',
    c006: '',
    c007: '',
    c008: '',
    c009: '',
    c010: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (initialData) {
      try {
        const date = initialData.sk ?
          DateFormatter.fromApiFormat(initialData.sk) :
          new Date();

        setFormData(prev => ({
          ...prev,
          selectedDate: date,
          ...initialData
        }));

        // Add this condition to set review mode
        if (startWithReview || initialData.isExistingData) {
          setActiveStep(steps.length - 1);
        }
      } catch (err) {
        console.error('Error processing initial data:', err);
        enqueueSnackbar('Failed to load initial data', { variant: 'error' });
      }
    }
  }, [initialData, enqueueSnackbar, startWithReview]);

  const handleDateChange = async (newDate) => {
    try {
      if (!newDate || !isValid(newDate)) {
        enqueueSnackbar('Please select a valid date', { variant: 'error' });
        return;
      }

      setLoading(true);
      const sk = DateFormatter.formatToSK(newDate);

      if (!sk) {
        throw new Error('Invalid date format');
      }

      const existingRecord = await productionApi.checkExisting(
        initialData.companyId,
        initialData.productionSiteId,
        sk
      );

      setFormData(prev => ({
        ...prev,
        selectedDate: newDate,
        sk
      }));

      if (existingRecord) {
        setExistingData(existingRecord);
        setShowConfirmDialog(true);
      }
    } catch (error) {
      console.error('Error checking date:', error);
      enqueueSnackbar(error.message || 'Failed to check date', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 2) {
      try {
        setLoading(true);
        const sk = DateFormatter.formatToSK(formData.selectedDate);

        if (!sk) {
          throw new Error('Invalid date format');
        }

        const existingRecord = await productionApi.checkExisting(
          initialData.companyId,
          initialData.productionSiteId,
          sk
        );

        if (existingRecord) {
          setExistingData(existingRecord);
          setShowConfirmDialog(true);
        } else {
          setActiveStep(prevStep => prevStep + 1);
        }
      } catch (error) {
        console.error('Error checking existing data:', error);
        enqueueSnackbar(error.message || 'Failed to check existing data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? '' : Number(value)
    }));
  };

  const handleConfirmUpdate = async () => {
    try {
      setShowConfirmDialog(false);

      // Set form data with existing data
      setFormData(prev => ({
        ...prev,
        ...existingData,
        selectedDate: DateFormatter.fromApiFormat(existingData.sk),
        isExistingData: true
      }));

      // Move to review step
      setActiveStep(steps.length - 1);

      enqueueSnackbar('Ready to update existing data', { variant: 'info' });
    } catch (error) {
      console.error('Update preparation error:', error);
      enqueueSnackbar(error.message || 'Failed to prepare update', { variant: 'error' });
    }
  };

  const renderDatePicker = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label="Select Month"
        views={['year', 'month']}
        value={formData.selectedDate}
        onChange={handleDateChange}
        // Add these props to fix focus management
        disableAutoFocus
        PopperProps={{
          disablePortal: true
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            variant: 'outlined',
            error: Boolean(error),
            helperText: error
          },
          popper: {
            modifiers: [{
              name: 'preventOverflow',
              enabled: true,
              options: {
                altAxis: true,
                altBoundary: true,
                tether: false,
                rootBoundary: 'document',
                padding: 8
              }
            }]
          }
        }}
      />
    </LocalizationProvider>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Month"
                value={formData.selectedDate}
                onChange={handleDateChange}
                views={['year', 'month']}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined'
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        );

      case 1:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {['c1', 'c2', 'c3', 'c4', 'c5'].map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                <TextField
                  fullWidth
                  label={`Unit ${field.toUpperCase()}`}
                  type="number"
                  value={formData[field] || ''}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                />
              </Grid>
            ))}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {['c001', 'c002', 'c003', 'c004', 'c005','c006','c007','coo8','c009','c010'].map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                <TextField
                  fullWidth
                  label={`Charge ${field.toUpperCase()}`}
                  type="number"
                  value={formData[field] || ''}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                />
              </Grid>
            ))}
          </Grid>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Data
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(formData)
                .filter(([key]) => key !== 'selectedDate' && key !== 'sk')
                .map(([key, value]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <TextField
                      fullWidth
                      label={key.toUpperCase()}
                      value={value || ''}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                ))}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderConfirmationDialog = () => (
    <Dialog
      open={showConfirmDialog}
      onClose={() => setShowConfirmDialog(false)}
      maxWidth="md"
      fullWidth
      // Add these props to fix the focus trap issue
      keepMounted
      disableEnforceFocus
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle>
        Existing Data Found
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Data already exists for {DateFormatter.formatMonthYear(existingData?.sk)}
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Existing Data
              </Typography>
              <Grid container spacing={1}>
                {existingData && Object.entries(existingData)
                  .filter(([key]) => !['sk', 'companyId', 'productionSiteId'].includes(key))
                  .map(([key, value]) => (
                    <Grid item xs={6} key={`existing-${key}`}>
                      <Typography variant="caption" color="text.secondary">
                        {key}:
                      </Typography>
                      <Typography variant="body2">
                        {value || '0'}
                      </Typography>
                    </Grid>
                  ))}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'primary.light' }}>
              <Typography variant="subtitle2" gutterBottom color="white">
                New Data
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(formData)
                  .filter(([key]) => !['selectedDate', 'sk', 'companyId', 'productionSiteId'].includes(key))
                  .map(([key, value]) => (
                    <Grid item xs={6} key={`new-${key}`}>
                      <Typography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                        {key}:
                      </Typography>
                      <Typography variant="body2" color="white">
                        {value || '0'}
                      </Typography>
                    </Grid>
                  ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setShowConfirmDialog(false)}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmUpdate}
          variant="contained"
          color="primary"
          autoFocus
        >
          View & Update Existing Data
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box
      sx={{ width: '100%', mt: 2 }}
      // Add this to prevent focus trap issues
      tabIndex={-1}
    >
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4, mb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={onCancel}
              disabled={loading}
              variant="outlined"
            >
              Cancel
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  disabled={loading}
                  variant="outlined"
                >
                  Back
                </Button>
              )}
              <Button
                type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                onClick={activeStep === steps.length - 1 ? undefined : handleNext}
                variant="contained"
                disabled={loading}
              >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
      {renderConfirmationDialog()}
    </Box>
  );
};

ProductionSiteDataForm.propTypes = {
  initialData: PropTypes.shape({
    companyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productionSiteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sk: PropTypes.string,
    selectedDate: PropTypes.instanceOf(Date),
    // ... other field validations
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  startWithReview: PropTypes.bool
};

export default ProductionSiteDataForm;