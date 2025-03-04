import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { Box, Paper, Typography } from '@mui/material';

const ProductionChart = ({ data }) => {
  const chartColors = {
    c1: "#1976d2",    // Blue
    c2: "#2e7d32",    // Green
    c3: "#ed6c02",    // Orange
    c4: "#9c27b0",    // Purple
    c5: "#d32f2f"     // Red
  };

  return (
    <Paper elevation={3} sx={{ p: 2, my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Production Data Visualization
      </Typography>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 55  // Increased bottom margin for legend
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            height={36}
            layout="horizontal"
            wrapperStyle={{
              paddingTop: '20px',
              bottom: 0,
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="c1" 
            stroke={chartColors.c1} 
            name="Unit 1" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="c2" 
            stroke={chartColors.c2} 
            name="Unit 2" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="c3" 
            stroke={chartColors.c3} 
            name="Unit 3" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="c4" 
            stroke={chartColors.c4} 
            name="Unit 4" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="c5" 
            stroke={chartColors.c5} 
            name="Unit 5" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Custom Legend Below Chart */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: 2,
          mt: 2,
          p: 1,
          borderTop: '1px solid #eee'
        }}
      >
        {Object.entries(chartColors).map(([key, color]) => (
          <Box 
            key={key}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            }}
          >
            <Box 
              sx={{ 
                width: 16, 
                height: 16, 
                backgroundColor: color,
                borderRadius: '50%'
              }} 
            />
            <Typography variant="body2">
              {`Unit ${key.substring(1)}`}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default ProductionChart;