import React, { createContext, useState, useContext, useCallback } from 'react';
import { navigate } from '../utils/navigation';

// Define user roles and credentials
const USERS = {
  'testcase1': {
    username: 'testcase1',
    password: 'test123',
    name: 'TestCase 1',
    role: 'user',
    token: 'mock-token-1'
  },
  'strio_admin': {
    username: 'strio_admin',
    password: 'admin123',
    name: 'STRIO Admin',
    role: 'admin',
    token: 'mock-token-admin'
  },
  'strio_user': {
    username: 'strio_user',
    password: 'user123',
    name: 'STRIO User',
    role: 'user',
    token: 'mock-token-2'
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = useCallback(async (credentials) => {
    const { username, password } = credentials;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = Object.values(USERS).find(
          u => u.username === username && u.password === password
        );

        if (foundUser) {
          const userInfo = {
            ...foundUser,
            password: undefined
          };
          
          setUser(userInfo);
          localStorage.setItem('user', JSON.stringify(userInfo));
          navigate('/'); // Use navigation utility
          resolve(userInfo);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login'); // Use navigation utility
  }, []);

  // Check for existing authentication on initial load
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    USERS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const hasPermission = (user, requiredRole) => {
  return user && user.role === requiredRole;
};