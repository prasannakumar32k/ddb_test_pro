import React from 'react';
import {
  Grid,
  Card,
  CardActions,
  Button,
  Typography,
  Box,
  IconButton,
  CardContent,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Power as PowerIcon,
  Speed as CapacityIcon,
  ElectricBolt as VoltageIcon,
  Assignment as AssignmentIcon,
  AccountBalance as BankingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Define SiteCard component first
const SiteCard = ({ site, onEdit, onDelete, userRole }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (site?.companyId && site?.productionSiteId) {
      navigate(`/production/${site.companyId}/${site.productionSiteId}`);
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'wind':
        return <PowerIcon sx={{ color: '#1976D2' }} />;
      case 'solar':
        return <PowerIcon sx={{ color: '#FFC107' }} />;
      default:
        return <PowerIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        cursor: 'pointer',
        height: '100%',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
      onClick={handleClick}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getTypeIcon(site.type)}
          {site.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {site.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CapacityIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {site.capacity_MW} MW
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VoltageIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {site.injectionVoltage_KV} kV
          </Typography>
        </Box>

        {site.banking && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BankingIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="body2" color="success.main">
              Banking Enabled
            </Typography>
          </Box>
        )}
      </Box>

      {userRole === 'admin' && (
        <Box sx={{
          mt: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(site);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(site);
            }}
          >
            Delete
          </Button>
        </Box>
      )}
    </Paper>
  );
};

// Then define the ProductionSiteList component
const ProductionSiteList = ({ sites, onEdit, onDelete, userRole }) => {
  return (
    <Grid container spacing={3}>
      {sites.map((site, index) => {
        const companyId = site.companyId || 1; // Default companyId to 1
        const productionSiteId = site.productionSiteId || `site-${index + 1}`; // Generate productionSiteId if null
        const uniqueKey = `${companyId}_${productionSiteId}`;

        return (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={uniqueKey}
          >
            <SiteCard
              site={{
                ...site,
                companyId,
                productionSiteId,
                pk: uniqueKey
              }}
              onEdit={onEdit}
              onDelete={onDelete}
              userRole={userRole}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ProductionSiteList;