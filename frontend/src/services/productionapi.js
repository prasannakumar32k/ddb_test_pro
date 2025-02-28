import axios from 'axios';
import DateFormatter from '../utils/DateFormatter';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 10000
});

// Add request logging
api.interceptors.request.use(
  config => {
    console.log(`[ProductionAPI] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  error => {
    console.error('[ProductionAPI] Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response logging
api.interceptors.response.use(
  response => {
    console.log(`[ProductionAPI] Response from ${response.config.url}:`, response.data);
    return response;
  },
  error => {
    console.error(`[ProductionAPI] Error from ${error.config?.url}:`, error);
    return Promise.reject(error);
  }
);


// Production history data functions
export const fetchProductionSiteHistory = async (companyId, productionSiteId, type = 'unit') => {
  try {
    console.log('[ProductionAPI] Fetching history:', { companyId, productionSiteId, type });
    
    if (!companyId || !productionSiteId) {
      throw new Error('Missing required parameters');
    }

    // Update the endpoint to match backend route
    const endpoint = type === 'unit' ? 'production-unit' : 'production-charges';
    const response = await api.get(`/api/${endpoint}/${companyId}/${productionSiteId}`);
    
    if (!response.data) {
      console.warn('[ProductionAPI] No data received');
      return {
        data: [],
        message: 'No production history available'
      };
    }

    // Transform and validate the data
    const transformedData = Array.isArray(response.data) 
      ? response.data.map(item => ({
          ...item,
          c1: parseInt(item.c1 || 0),
          c2: parseInt(item.c2 || 0),
          c3: parseInt(item.c3 || 0),
          c4: parseInt(item.c4 || 0),
          c5: parseInt(item.c5 || 0),
          month: item.month || item.sk,
          formattedMonth: DateFormatter.fromApiFormat(item.month || item.sk)
        }))
      : [];

    console.log('[ProductionAPI] Transformed data:', transformedData);
    return {
      data: transformedData,
      message: transformedData.length ? '' : 'No production history available'
    };
  } catch (error) {
    console.error('[ProductionAPI] Failed to fetch production history:', error);
    return {
      data: [],
      message: 'Failed to load production history. Please try again later.',
      error: error.message
    };
  }
};

export const createProductionData = async (companyId, productionSiteId, data) => {
  try {
    if (!companyId || !productionSiteId || !data) {
      console.error('[ProductionAPI] Missing required fields:', { companyId, productionSiteId, data });
      throw new Error('Missing required fields');
    }

    // Ensure proper date formatting
    const selectedDate = data.selectedDate instanceof Date
      ? data.selectedDate
      : new Date(data.selectedDate);

    const formattedMonth = DateFormatter.toApiFormat(selectedDate);

    // Format the payload
    const payload = {
      pk: `${companyId}_${productionSiteId}`,
      sk: formattedMonth,
      companyId: parseInt(companyId),
      productionSiteId: parseInt(productionSiteId),
      c1: parseInt(data.c1) || 0,
      c2: parseInt(data.c2) || 0,
      c3: parseInt(data.c3) || 0,
      c4: parseInt(data.c4) || 0,
      c5: parseInt(data.c5) || 0,
      month: formattedMonth,
      createdAt: new Date().toISOString()
    };

    console.log('[ProductionAPI] Creating production with payload:', payload);
    const response = await api.post('/api/production-unit', payload);

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error('[ProductionAPI] Error creating production data:', error);
    throw new Error('Failed to create production data: ' + (error.response?.data?.message || error.message));
  }
};

export const updateProductionData = async (companyId, productionSiteId, data) => {
  try {
    console.log('[ProductionAPI] Updating production:', { companyId, productionSiteId, data });

    if (!data.selectedDate) {
      throw new Error('Missing date selection');
    }

    // Format date to MMYY format using DateFormatter
    const formattedMonth = DateFormatter.toApiFormat(data.selectedDate);
    if (!formattedMonth) {
      throw new Error('Invalid date format');
    }

    const payload = {
      c1: parseInt(data.c1) || 0,
      c2: parseInt(data.c2) || 0,
      c3: parseInt(data.c3) || 0,
      c4: parseInt(data.c4) || 0,
      c5: parseInt(data.c5) || 0,
      updatedAt: new Date().toISOString()
    };

    const response = await api.put(
      `/api/production-unit/${companyId}/${productionSiteId}/${formattedMonth}`,
      payload
    );

    console.log('[ProductionAPI] Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[ProductionAPI] Update error:', error);
    throw new Error('Failed to update production data');
  }
};

export const deleteProductionData = async (companyId, productionSiteId, month, type = 'unit') => {
  try {
    const endpoint = type === 'unit' ? 'productions' : 'charges';
    const mmyyyy = month || '112024';
    await api.delete(`/api/${endpoint}/${companyId}/${productionSiteId}/${mmyyyy}`);
  } catch (error) {
    console.error('[ProductionAPI] Failed to delete production data:', error);
    throw error;
  }
};

export const fetchProductionData = async () => {
  try {
    const response = await api.get('/api/production-unit');
    return response.data || [];
  } catch (error) {
    console.error('[ProductionAPI] Error fetching production data:', error);
    return [];
  }
};

export const fetchProductionUnits = async () => {
  try {
    const response = await api.get('/api/production-unit');
    return response.data || [];
  } catch (error) {
    console.error('[ProductionAPI] Error fetching production units:', error);
    return [];
  }
};