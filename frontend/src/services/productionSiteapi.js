import axios from 'axios';
import api from './api';
import { useState } from 'react';
import { handleError } from '../utils/errorHandler';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333';

const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 10000
});

// Add request logging
apiInstance.interceptors.request.use(
  config => {
    console.log(`[ProductionSiteAPI] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  error => {
    console.error('[ProductionSiteAPI] Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response logging
apiInstance.interceptors.response.use(
  response => {
    console.log(`[ProductionSiteAPI] Response from ${response.config.url}:`, response.data);
    return response;
  },
  error => {
    console.error(`[ProductionSiteAPI] Error from ${error.config?.url}:`, error);
    return Promise.reject(error);
  }
);

// Normalize site data to ensure consistent property names
const normalizeSiteData = (site) => {
    if (!site) return null;
    
    return {
        companyId: Number(site.companyId),
        productionSiteId: Number(site.productionSiteId),
        name: site.name || '',
        location: site.location || '',
        type: site.type || '',
        capacity_MW: Number(site.capacity_MW || 0),
        banking: Boolean(site.banking),
        status: site.status || 'Active',
        htscNo: site.htscNo || '',
        injectionVoltage_KV: Number(site.injectionVoltage_KV || 0),
        annualProduction_L: Number(site.annualProduction_L || 0)
    };
};

export const fetchProductionSites = async () => {
    try {
        console.log('[ProductionSiteAPI] Fetching sites');
        const response = await api.get('/api/production-site');
        
        if (!response.data) {
            console.warn('[ProductionSiteAPI] No data received');
            return [];
        }

        const normalizedSites = Array.isArray(response.data) 
            ? response.data.map(normalizeSiteData).filter(Boolean)
            : [];

        console.log('[ProductionSiteAPI] Normalized sites:', normalizedSites);
        return normalizedSites;

    } catch (error) {
        console.error('[ProductionSiteAPI] Error:', error);
        throw new Error('Failed to fetch production sites');
    }
};

export const fetchProductionSiteDetails = async (companyId, productionSiteId) => {
  try {
    const response = await api.get(`/api/production-site/${companyId}/${productionSiteId}`);
    return normalizeSiteData(response.data);
  } catch (error) {
    console.error('[ProductionSiteAPI] Error fetching site details:', error);
    throw new Error('Failed to fetch production site details');
  }
};

export const createProductionUnit = async (data) => {
  try {
    console.log('[ProductionSiteAPI] Creating production unit:', data);

    // Ensure all required fields are present
    const requestData = {
      companyId: parseInt(data.companyId),
      productionSiteId: parseInt(data.productionSiteId),
      name: data.name,
      location: data.location,
      type: data.type,
      banking: parseInt(data.banking),
      capacity_MW: parseFloat(data.capacity_MW),
      annualProduction_L: parseFloat(data.annualProduction_L),
      htscNo: data.htscNo,
      injectionVoltage_KV: parseFloat(data.injectionVoltage_KV),
      status: data.status
    };

    // Validate data
    if (!requestData.name || !requestData.location || !requestData.type) {
      throw new Error('Missing required fields');
    }

    console.log('[ProductionSiteAPI] Sending request data:', requestData);
    const response = await api.post('/api/production-site', requestData);

    if (!response.data) {
      throw new Error('No data received from server');
    }

    console.log('[ProductionSiteAPI] Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('[ProductionSiteAPI] Error creating production unit:', error);
    if (error.response) {
      // Server returned an error
      throw new Error(error.response.data.message || 'Server error occurred');
    }
    throw error;
  }
};

export const updateProductionUnit = async (data) => {
  try {
    if (!data.CompanyId || !data.productionSiteId) {
      throw new Error('Missing required IDs for update');
    }
    const response = await apiInstance.put(
      `/api/production-site/${data.CompanyId}/${data.productionSiteId}`,
      data
    );
    if (!response.data || !response.data.CompanyId || !response.data.productionSiteId) {
      throw new Error('Invalid response: Missing CompanyId or productionSiteId');
    }
    return response.data;
  } catch (error) {
    console.error('[ProductionSiteAPI] Update production unit error:', error);
    throw error;
  }
};

export const deleteProductionUnit = async (companyId, productionSiteId) => {
  try {
    if (!companyId || !productionSiteId) {
      throw new Error('Missing required IDs for deletion');
    }

    console.log('[ProductionSiteAPI] Deleting unit:', { companyId, productionSiteId });
    const response = await api.delete(`/api/production-site/${companyId}/${productionSiteId}`);
    return response.data;
  } catch (error) {
    console.error('[ProductionSiteAPI] Delete production unit error:', error);
    throw error;
  }
};
