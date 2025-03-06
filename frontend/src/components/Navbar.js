import React, { useState, useMemo } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Factory as ProductionIcon,
  ShowChart as ConsumptionIcon,
  AssessmentOutlined as ReportsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  AccountCircle as ProfileIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg'; // Ensure this path is correct

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLogouting, setIsLogouting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = useMemo(() => [
    { 
      icon: <DashboardIcon />, 
      label: 'Dashboard', 
      path: '/',
      color: '#1976D2' // Blue
    },
    { 
      icon: <ProductionIcon />, 
      label: 'Production', 
      path: '/production',
      color: '#2E7D32' // Green
    },
    { 
      icon: <ConsumptionIcon />, 
      label: 'Consumption', 
      path: '/consumption',
      color: '#ED6C02' // Orange
    },
    { 
      icon: <ReportsIcon />, 
      label: 'Reports', 
      path: '/reports',
      color: '#9C27B0' // Purple
    }
  ], []);

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    setIsLogouting(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLogouting(false);
    }
  };

  const MobileDrawer = () => (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleMobileMenuToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': { 
          boxSizing: 'border-box', 
          width: 240 
        },
      }}
    >
      <Box
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          p: 1 
        }}
      >
        <IconButton onClick={handleMobileMenuToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.path}
            button 
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        backgroundColor: '#1976D2', // Blue background
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          px: 3,
          py: 1,
          height: 64
        }}
      >
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <IconButton 
            color="inherit" 
            aria-label="open drawer"
            edge="start"
            onClick={handleMobileMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo and Company Name */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2
          }}
        >
          <img 
            src={logo} 
            alt="STRIO Logo" 
            style={{ 
              height: 40, 
              width: 'auto' 
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            STRIO
          </Typography>
        </Box>

        {/* Navigation Icons */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            gap: 15  
          }}
        >
          {navItems.map((item) => (
            <Tooltip key={item.path} title={item.label}>
              <IconButton
                aria-label={`Go to ${item.label}`}
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.7)',
                  backgroundColor: location.pathname === item.path 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  },
                  p: 2,  
                  fontSize: '1.5rem'  
                }}
              >
                {React.cloneElement(item.icon, { fontSize: 'inherit' })}
              </IconButton>
            </Tooltip>
          ))}
        </Box>

        {/* User Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 3
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2 
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'white', 
                fontWeight: 'medium',
                display: { xs: 'none', md: 'block' }
              }}
            >
              {user?.name || 'User'}
            </Typography>
            
            <Tooltip title="Profile">
              <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: '#8B4513', // Brown color
                    color: 'white'
                  }}
                >
                  {user?.name?.[0].toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleUserMenuClose}>
            <ProfileIcon sx={{ mr: 1 }} /> Profile
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={handleLogout} 
            disabled={isLogouting}
            sx={{ color: 'error.main' }}
          >
            {isLogouting ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : (
              <LogoutIcon sx={{ mr: 1 }} />
            )}
            Logout
          </MenuItem>
        </Menu>

        {/* Mobile Drawer */}
        {isMobile && <MobileDrawer />}
      </Box>
    </Box>
  );
};

export default Navbar;