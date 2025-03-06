import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Skeleton 
} from '@mui/material';

const DashboardCard = ({ title, items, bgColor, loading = false }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: bgColor || 'background.paper'
      }}
      elevation={0}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            mb: 2, 
            fontWeight: 'bold',
            color: 'text.secondary'
          }}
        >
          {title}
        </Typography>
        
        <Grid container spacing={1}>
          {loading 
            ? Array.from(new Array(5)).map((_, index) => (
                <Grid item xs={12} key={index}>
                  <Skeleton 
                    variant="rectangular" 
                    width="100%" 
                    height={30} 
                    sx={{ borderRadius: 1 }} 
                  />
                </Grid>
              ))
            : items.map((item, index) => (
                <Grid 
                  item 
                  xs={12} 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 0.5
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mr: 1, 
                      fontSize: '1.2rem',
                      color: 'text.secondary'
                    }}
                  >
                    {item.icon}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      flexGrow: 1,
                      color: 'text.primary'
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: 'text.primary'
                    }}
                  >
                    {item.value}
                  </Typography>
                </Grid>
              ))
          }
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
