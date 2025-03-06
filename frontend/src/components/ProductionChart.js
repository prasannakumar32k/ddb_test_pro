import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Box,
  Paper,
  Typography,
  Grid,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Power as PowerIcon,
  ElectricBolt as VoltageIcon
} from '@mui/icons-material';
import DateFormatter from '../utils/DateFormatter';

const ProductionChart = ({ data, matrixType = 'unit' }) => {
  const [chartType, setChartType] = useState('line');

  const chartColors = matrixType === 'unit'
    ? {
      c1: "#1976d2",    // Blue
      c2: "#2e7d32",    // Green
      c3: "#ed6c02",    // Orange
      c4: "#9c27b0",    // Purple
      c5: "#d32f2f"     // Red
    }
    : {
      c001: "#1976d2",  // Blue
      c002: "#2e7d32",  // Green
      c003: "#ed6c02",  // Orange
      c004: "#9c27b0",  // Purple
      c005: "#d32f2f",  // Red
      c006: "#0288d1",  // Light Blue
      c007: "#388e3c",  // Light Green
      c008: "#f57c00",  // Light Orange
      c009: "#7b1fa2",  // Light Purple
      c010: "#c62828"   // Light Red
    };

  const handleChartTypeChange = (event, newValue) => {
    if (newValue !== null) setChartType(newValue);
  };

  const transformedData = data.map(item => ({
    month: DateFormatter.formatMonthYear(item.sk),
    ...Object.keys(chartColors).reduce((acc, key) => ({
      ...acc,
      [key]: Number(item[key]) || 0
    }), {})
  }));

  const Chart = chartType === 'line' ? LineChart : BarChart;
  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <Paper elevation={3} sx={{ p: 2, my: 2 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6">
          Production Analysis
        </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="line">
            <TimelineIcon sx={{ mr: 1 }} />
            Line
          </ToggleButton>
          <ToggleButton value="bar">
            <BarChartIcon sx={{ mr: 1 }} />
            Bar
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: 400, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Chart
            data={transformedData}
            margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            {Object.entries(chartColors).map(([key, color]) => (
              <ChartComponent
                key={key}
                type="monotone"
                dataKey={key}
                fill={color}
                stroke={color}
                strokeWidth={2}
              />
            ))}
          </Chart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
        <Grid container spacing={2} justifyContent="center">
          {Object.entries(chartColors).map(([key, color]) => (
            <Grid item key={key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: color,
                    borderRadius: '50%',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                />
                <Typography variant="body2">
                  {matrixType === 'unit'
                    ? `c${key.substring(1)}`
                    : `c${key.substring(1)}`}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProductionChart;