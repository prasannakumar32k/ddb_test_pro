import React from "react";
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container 
} from "@mui/material";
import Navbar from "./components/Navbar";
import logo from "./assets/logo.jpg";

function Layout({ children }) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh' 
      }}
    >
      <AppBar position="static">
        <Toolbar 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            p: 0 
          }}
        >
          <Box 
            sx={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              px: 2,
              py: 1 
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              <img 
                src={logo} 
                alt="STRIO APP" 
                style={{ 
                  height: "40px", 
                  marginRight: "16px" 
                }} 
              />
              <Typography 
                variant="h6" 
                component="div"
              >
                Dashboard
              </Typography>
            </Box>
          </Box>
          
          <Navbar />
        </Toolbar>
      </AppBar>
      
      <Container 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: 3,
          mb: 2 
        }}
      >
        {children}
      </Container>
    </Box>
  );
}

export default Layout;
