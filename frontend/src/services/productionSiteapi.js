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

// Add utility function to generate productionSiteId
let lastGeneratedId = 0;
const generateProductionSiteId = () => {
  lastGeneratedId += 1;
  return lastGeneratedId;
};

// Update the normalizeSiteData function to handle IDs better
const normalizeSiteData = (site) => {
  if (!site) return null;

  return {
    companyId: site.companyId || 1, // Default to company 1
    productionSiteId: site.productionSiteId || generateProductionSiteId(), // Generate if missing
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

// Update the fetch function to handle IDs properly
export const fetchProductionSites = async () => {
  try {
    const response = await api.get('/api/production-site');

    if (!response.data) {
      return [];
    }

    // Transform data to ensure proper IDs
    return response.data.map((site, index) => ({
      ...site,
      companyId: site.companyId || 1,
      productionSiteId: site.productionSiteId || `site-${index + 1}`,
      pk: site.pk || `1_site-${index + 1}`
    }));
  } catch (error) {
    console.error('[ProductionSiteAPI] Fetch error:', error);
    throw error;
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

// Update create function to handle IDs consistently
export const createProductionUnit = async (data) => {
  try {
    // Get the next site ID
    const sites = await fetchProductionSites();
    const nextId = sites.length > 0
      ? Math.max(...sites.map(site => parseInt(site.productionSiteId) || 0)) + 1
      : 1;

    // Format the data
    const payload = {
      companyId: 1, // Fixed company ID
      productionSiteId: nextId,
      name: data.Name,
      location: data.Location,
      type: data.Type,
      status: data.Status || 'Active',
      capacity_MW: Number(data.Capacity_MW) || 0,
      banking: Boolean(data.Banking),
      htscNo: data.HtscNo || '',
      injectionVoltage_KV: Number(data.InjectionValue) || 0,
      annualProduction_L: Number(data.AnnualProduction) || 0
    };

    console.log('Creating production site with payload:', payload);
    const response = await api.post('/api/production-site', payload);
    return response.data;
  } catch (error) {
    console.error('[ProductionSiteAPI] Create error:', error);
    throw error;
  }
};

export const updateProductionUnit = async (data) => {
  try {
    // Ensure proper data formatting before sending to API
    const formattedData = {
      companyId: Number(data.companyId),
      productionSiteId: Number(data.productionSiteId),
      name: String(data.name || ''),
      location: String(data.location || ''),
      type: String(data.type || 'Wind'),
      status: String(data.status || 'Active'),
      capacity_MW: data.capacity_MW !== undefined && data.capacity_MW !== ''
        ? Number(data.capacity_MW)
        : 0,
      banking: Boolean(data.banking),
      htscNo: data.htscNo !== undefined ? String(data.htscNo) : '',
      injectionVoltage_KV: data.injectionVoltage_KV !== undefined && data.injectionVoltage_KV !== ''
        ? Number(data.injectionVoltage_KV)
        : 0,
      annualProduction_L: data.annualProduction_L !== undefined && data.annualProduction_L !== ''
        ? Number(data.annualProduction_L)
        : 0
    };

    const response = await api.put(
      `/production-site/${data.companyId}/${data.productionSiteId}`,
      formattedData
    );

    // Format response data
    return {
      ...response.data,
      capacity_MW: response.data.capacity_MW !== null ? Number(response.data.capacity_MW) : 0,
      injectionVoltage_KV: response.data.injectionVoltage_KV !== null ? Number(response.data.injectionVoltage_KV) : 0,
      annualProduction_L: response.data.annualProduction_L !== null ? Number(response.data.annualProduction_L) : 0,
      banking: Boolean(response.data.banking),
      htscNo: response.data.htscNo ? String(response.data.htscNo) : ''
    };
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update production site');
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

export const productionSiteApi = {
  fetchAll: async () => {
    try {
      const response = await api.get('/production-site');
      return response.data;
    } catch (error) {
      console.error('[ProductionSiteAPI] Error fetching all sites:', error);
      throw new Error('Failed to fetch production sites');
    }
  },

  fetchOne: async (companyId, siteId) => {
    try {
      const response = await api.get(`/production-site/${companyId}/${siteId}`);
      return response.data;
    } catch (error) {
      console.error('[ProductionSiteAPI] Error fetching site:', error);
      throw new Error('Failed to fetch production site');
    }
  }
};

export default productionSiteApi;
