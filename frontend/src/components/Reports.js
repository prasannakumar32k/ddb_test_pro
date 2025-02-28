import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const Reports = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Production Reports</Typography>
            {/* Add your production reports component here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Consumption Reports</Typography>
            {/* Add your consumption reports component here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
