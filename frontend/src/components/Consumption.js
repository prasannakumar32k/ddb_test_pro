import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const Consumption = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Consumption Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Daily Consumption</Typography>
            {/* Add your consumption chart component here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Monthly Overview</Typography>
            {/* Add your monthly overview component here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Consumption;
