import { Box, Typography } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const StatusIndicator = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success.main'; // Green
      case 'pending':
        return 'warning.main'; // Orange
      case 'error':
        return 'error.main'; // Red
      default:
        return 'text.secondary'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <SuccessIcon sx={{ color: 'success.main' }} />;
      case 'pending':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {getStatusIcon(status)}
      <Typography 
        sx={{ 
          color: getStatusColor(status),
          fontWeight: 'medium'
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Typography>
    </Box>
  );
};

export default StatusIndicator;