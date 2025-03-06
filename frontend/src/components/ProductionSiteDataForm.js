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
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { startOfMonth } from 'date-fns';
import DateFormatter from '../utils/DateFormatter';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { productionApi } from '../services/productionapi';

const steps = ['Select Date', 'Unit Matrix', 'Charge Matrix', 'Review'];

const ProductionSiteDataForm = ({ initialData = null, onSubmit, onCancel, startWithReview = false }) => {
  const [formData, setFormData] = useState({
    selectedDate: new Date(),
    sk: '',
    c1: 0,
    c2: 0,
    c3: 0,
    c4: 0,
    c5: 0,
    c001: 0,
    c002: 0,
    c003: 0,
    c004: 0,
    c005: 0,
    c006: 0,
    c007: 0,
    c008: 0,
    c009: 0,
    c010: 0
  });
  const [activeStep, setActiveStep] = useState(startWithReview ? steps.length - 1 : 0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (initialData) {
      try {
        const date = DateFormatter.fromApiFormat(initialData.sk);
        if (!date) throw new Error('Invalid initial date');
        setFormData(prev => ({
          ...prev,
          selectedDate: date,
          ...initialData
        }));
      } catch (err) {
        console.error('Error processing initial data:', err);
        setError('Failed to load initial data');
      }
    }
  }, [initialData]);

  const handleNext = async () => {
    if (activeStep === steps.length - 2) {
      try {
        setLoading(true);
        setError(null);

        const sk = DateFormatter.toApiFormat(formData.selectedDate);

        // Get companyId and productionSiteId from parent component or route params
        const { companyId, productionSiteId } = initialData || {};

        if (!companyId || !productionSiteId) {
          throw new Error('Missing required site information');
        }

        const existingData = await productionApi.checkExisting(
          companyId,
          productionSiteId,
          sk
        );

        if (existingData) {
          setExistingData(existingData);
          setShowConfirmDialog(true);
        } else {
          setActiveStep(prevStep => prevStep + 1);
        }
      } catch (error) {
        console.error('Error checking existing data:', error);
        setError(error.message);
        enqueueSnackbar(error.message || 'Failed to check existing data', {
          variant: 'error'
        });
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

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Month"
                views={['year', 'month']}
                value={formData.selectedDate}
                onChange={(newDate) => {
                  if (newDate) {
                    setFormData(prev => ({ ...prev, selectedDate: newDate }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    error: Boolean(error),
                    helperText: error
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        );

      case 1:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Unit Matrix Data
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            {[1, 2, 3, 4, 5].map((num) => (
              <Grid item xs={12} sm={6} md={4} key={`c${num}`}>
                <TextField
                  fullWidth
                  label={`C${num}`}
                  name={`c${num}`}
                  value={formData[`c${num}`]}
                  onChange={handleChange}
                  type="number"
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Charge Matrix Data
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <Grid item xs={12} sm={6} md={4} key={`c00${num}`}>
                <TextField
                  fullWidth
                  label={`C00${num}`}
                  name={`c00${num}`}
                  value={formData[`c00${num}`]}
                  onChange={handleChange}
                  type="number"
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Review Data
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.selectedDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Unit Matrix Values
                  </Typography>
                  <Grid container spacing={1}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Grid item xs={6} key={`review-c${num}`}>
                        <Typography variant="caption" color="text.secondary">
                          C{num}:
                        </Typography>
                        <Typography variant="body2">
                          {formData[`c${num}`] || '0'}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Charge Matrix Values
                  </Typography>
                  <Grid container spacing={1}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <Grid item xs={6} key={`review-c00${num}`}>
                        <Typography variant="caption" color="text.secondary">
                          C00{num}:
                        </Typography>
                        <Typography variant="body2">
                          {formData[`c00${num}`] || '0'}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
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