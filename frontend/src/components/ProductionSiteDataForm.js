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

const steps = ['Select Date', 'Unit Matrix', 'Charge Matrix', 'Review'];

const ProductionSiteDataForm = ({ onSubmit, onCancel, initialData = null, isEdit = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    selectedDate: new Date(),
    // Unit Matrix
    c1: '',
    c2: '',
    c3: '',
    c4: '',
    c5: '',
    // Charge Matrix
    c001: '',
    c002: '',
    c003: '',
    c004: '',
    c005: '',
    c006: '',
    c007: '',
    c008: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.selectedDate) {
        throw new Error('Please select a valid date');
      }

      // Validate numeric fields
      const allFields = [...Array(5)].map((_, i) => `c${i + 1}`).concat(
        [...Array(8)].map((_, i) => `c00${i + 1}`)
      );

      for (const field of allFields) {
        if (formData[field] && isNaN(formData[field])) {
          throw new Error(`Please enter a valid number for ${field.toUpperCase()}`);
        }
      }

      await onSubmit({
        ...formData,
        selectedDate: startOfMonth(formData.selectedDate)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [`c${num}`]: e.target.value
                  }))}
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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <Grid item xs={12} sm={6} md={4} key={`c00${num}`}>
                <TextField
                  fullWidth
                  label={`C00${num}`}
                  name={`c00${num}`}
                  value={formData[`c00${num}`]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [`c00${num}`]: e.target.value
                  }))}
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
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
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
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  Submit
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={loading}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ProductionSiteDataForm;