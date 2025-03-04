import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchProductionSites,
  fetchProductionSiteDetails
} from "../../services/productionSiteapi";
import { fetchProductionData } from "../../services/productionapi";
import {
  Box,
  Grid,
  Typography,
  Alert,
  Container,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress
} from "@mui/material";
import {
  Factory as FactoryIcon,
  PowerSettingsNew as ConsumptionIcon,
  AssignmentTurnedIn as AllocationIcon,
  Assessment as ReportsIcon,
  TrendingUp as TrendIcon,
  Speed as MeterIcon,
  Assignment as UnitIcon,
  DateRange as DateIcon,
  PowerOutlined as PowerIcon,
  ListAlt as ListIcon,
  Assignment as AssignmentIcon,  // Add this import
  WbSunny as SolarIcon,
  Air as WindIcon,
  ElectricBolt as VoltageIcon
} from '@mui/icons-material';

// Update the DashboardCard component
const DashboardCard = ({
  icon,
  title,
  color,
  loading,
  items,
  onClick
}) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }
    }}
  >
    <CardActionArea
      onClick={onClick}  // Fixed: Removed incorrect parenthesis
      sx={{
        height: '100%',
        p: 3
      }}
    >
      {loading ? (
        <CircularProgress size={40} sx={{ color }} />
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              justifyContent: 'space-between',
              width: '100%',
              borderBottom: 1,
              borderColor: 'divider',
              pb: 2
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                fontSize: 40,
                color,
                opacity: 0.9
              }
            })}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                textTransform: 'uppercase',
                letterSpacing: 1
              }}
            >
              {title}
            </Typography>
          </Box>

          {items && items.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                py: 1.5,
                borderBottom: index < items.length - 1 ? 1 : 0,
                borderColor: 'divider'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary',
                  fontWeight: 'medium'
                }}
              >
                {React.cloneElement(item.icon, {
                  sx: {
                    fontSize: 20,
                    mr: 1,
                    color: item.color || color,
                    opacity: 0.8
                  }
                })}
                {item.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  color: item.color || color
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </>
      )}
    </CardActionArea>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  const [productionData, setProductionData] = useState([]);

  // Add default stats function
  const getDefaultStats = () => ({
    totalSites: 0,
    totalCapacity: 0,
    activeSites: 0,
    windSites: 0,
    solarSites: 0,
    totalProduction: 0,
    windCapacity: 0,
    solarCapacity: 0,
    bankedSites: 0,
    avgInjectionVoltage: 0
  });

  const [productionStats, setProductionStats] = useState(getDefaultStats());

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        console.log('[Dashboard] Fetching dashboard data...');
        const [siteData, prodData] = await Promise.all([
          fetchProductionSites(),
          fetchProductionData()
        ]);

        if (!siteData || !Array.isArray(siteData)) {
          throw new Error('Invalid site data received');
        }

        console.log('[Dashboard] Received site data:', siteData);
        console.log('[Dashboard] Received production data:', prodData);

        setSites(siteData);
        setProductionData(prodData || []);

        const stats = calculateProductionStats(siteData, prodData);
        console.log('[Dashboard] Calculated stats:', stats);
        setProductionStats(stats);
        setError(null);

      } catch (error) {
        console.error('[Dashboard] Data fetch error:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Add helper function to calculate stats
  const calculateProductionStats = (sites, productionData) => {
    if (!Array.isArray(sites)) {
      console.warn('Sites is not an array:', sites);
      return getDefaultStats();
    }

    const windSites = sites.filter(site => (site.Type || site.type) === 'Wind');
    const solarSites = sites.filter(site => (site.Type || site.type) === 'Solar');

    return {
      totalSites: sites.length,
      totalCapacity: sites.reduce((sum, site) =>
        sum + parseFloat(site.Capacity_MW || site.capacity_MW || 0), 0),
      activeSites: sites.filter(site =>
        (site.Status || site.status) === 'Active').length,
      windSites: windSites.length,
      solarSites: solarSites.length,
      totalProduction: Array.isArray(productionData)
        ? productionData.reduce((sum, data) => sum + (parseFloat(data.AnnualProduction || data.annualProduction_L || 0)), 0)
        : 0,
      windCapacity: windSites.reduce((sum, site) =>
        sum + parseFloat(site.Capacity_MW || site.capacity_MW || 0), 0),
      solarCapacity: solarSites.reduce((sum, site) =>
        sum + parseFloat(site.Capacity_MW || site.capacity_MW || 0), 0),
      bankedSites: sites.filter(site => site.Banking || site.banking).length,
      avgInjectionVoltage: sites.reduce((sum, site) =>
        sum + parseFloat(site.InjectionValue || site.injectionVoltage_KV || 0), 0) / sites.length || 0,
      totalAnnualProduction: sites.reduce((sum, site) =>
        sum + parseFloat(site.AnnualProduction || site.annualProduction_L || 0), 0)
    };
  };

  // Define cards with safe value access
  const cards = [
    {
      icon: <FactoryIcon />, // Changed from ProductionIcon to FactoryIcon
      title: "Production Sites",
      color: "#2E7D32",
      path: "/production",
      loading: loading,
      items: [
        {
          icon: <WindIcon />,
          label: "Wind Sites",
          value: `${productionStats.windSites} Sites`,
          color: "#1976D2" // Blue for wind
        },
        {
          icon: <SolarIcon />,
          label: "Solar Sites",
          value: `${productionStats.solarSites} Sites`,
          color: "#FFC107" // Yellow for solar
        },
        {
          icon: <VoltageIcon />,
          label: "Avg. Injection",
          value: `${productionStats.avgInjectionVoltage?.toFixed(1) || '0.0'} KV`
        }
      ]
    },
    {
      icon: <ConsumptionIcon />,
      icon: <ConsumptionIcon />,
      title: "Consumption",
      color: "#1976D2", // Blue
      path: "/consumption",
      items: [
        {
          icon: <MeterIcon />,
          label: "Total Units",
          value: "125,000 kWh"
        },
        {
          icon: <TrendIcon />,
          label: "Peak Demand",
          value: "850 kW"
        },
        {
          icon: <DateIcon />,
          label: "Last Updated",
          value: "Feb 2024"
        }
      ]
    },
    {
      icon: <AllocationIcon />,
      title: "Allocation",
      color: "#ED6C02", // Orange
      path: "/allocation",
      items: [
        {
          icon: <UnitIcon />,
          label: "Allocated Units",
          value: "75,000 kWh"
        },
        {
          icon: <TrendIcon />,
          label: "Utilization",
          value: "60%"
        },
        {
          icon: <DateIcon />,
          label: "Current Period",
          value: "Q1 2024"
        }
      ]
    },
    {
      icon: <ReportsIcon />,
      title: "Reports",
      color: "#9C27B0", // Purple
      path: "/reports",
      items: [
        {
          icon: <AssignmentIcon />,
          label: "Total Reports",
          value: "24"
        },
        {
          icon: <TrendIcon />,
          label: "Compliance",
          value: "98%"
        },
        {
          icon: <DateIcon />,
          label: "Next Due",
          value: "Mar 15, 2024"
        }
      ]
    }
  ];

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <DashboardCard {...card} onClick={() => navigate(card.path)} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;