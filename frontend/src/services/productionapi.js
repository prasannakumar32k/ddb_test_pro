import axios from 'axios';
import DateFormatter from '../utils/DateFormatter';

const API_BASE_URL = 'http://localhost:3333/api';

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
export const fetchProductionSiteHistory = async (companyId, productionSiteId) => {
  try {
    // Remove the /api prefix since it's already in API_BASE_URL
    const response = await api.get(`/production-unit/${companyId}/${productionSiteId}`);

    console.log('[ProductionAPI] Raw response:', response.data);

    if (!response.data || !Array.isArray(response.data.data)) {
      return { data: [], message: 'No production data available' };
    }

    const transformedData = response.data.data.map(item => {
      // Extract companyId and productionSiteId from pk
      const [itemCompanyId, itemProductionSiteId] = (item.pk || '').split('_');

      // Parse month and year from sk (mmyyyy format)
      const month = item.sk.substring(0, 2);
      const year = '20' + item.sk.substring(2);

      return {
        pk: item.pk,
        sk: item.sk,
        companyId: parseInt(itemCompanyId),
        productionSiteId: parseInt(itemProductionSiteId),
        // Unit Matrix (c1-c5)
        c1: parseFloat(item.c1 || 0),
        c2: parseFloat(item.c2 || 0),
        c3: parseFloat(item.c3 || 0),
        c4: parseFloat(item.c4 || 0),
        c5: parseFloat(item.c5 || 0),
        // Charge Matrix (c001-c010)
        c001: parseFloat(item.c001 || 0),
        c002: parseFloat(item.c002 || 0),
        c003: parseFloat(item.c003 || 0),
        c004: parseFloat(item.c004 || 0),
        c005: parseFloat(item.c005 || 0),
        c006: parseFloat(item.c006 || 0),
        c007: parseFloat(item.c007 || 0),
        c008: parseFloat(item.c008 || 0),
        c009: parseFloat(item.c009 || 0),
        c010: parseFloat(item.c010 || 0),
        // Calculate totals
        totalUnit: ['c1', 'c2', 'c3', 'c4', 'c5'].reduce((sum, key) =>
          sum + parseFloat(item[key] || 0), 0),
        totalCharge: ['c001', 'c002', 'c003', 'c004', 'c005',
          'c006', 'c007', 'c008', 'c009', 'c010'].reduce((sum, key) =>
            sum + parseFloat(item[key] || 0), 0),
        // Format date for display
        monthDisplay: new Date(`${year}-${month}-01`).toLocaleString('default', {
          month: 'long',
          year: 'numeric'
        })
      };
    });

    // Sort by sk in descending order (newest first)
    transformedData.sort((a, b) => b.sk.localeCompare(a.sk));

    console.log('[ProductionAPI] Transformed data:', transformedData);

    return {
      data: transformedData,
      message: transformedData.length ? '' : 'No production data available'
    };
  } catch (error) {
    console.error('[ProductionAPI] Error fetching history:', error);
    throw new Error('Failed to fetch production history');
  }
};

export const createProductionData = async (companyId, productionSiteId, data) => {
  try {
    const payload = {
      ...data,
      companyId: parseInt(companyId),
      productionSiteId: parseInt(productionSiteId),
      // Unit Matrix
      c1: parseFloat(data.c1 || 0),
      c2: parseFloat(data.c2 || 0),
      c3: parseFloat(data.c3 || 0),
      c4: parseFloat(data.c4 || 0),
      c5: parseFloat(data.c5 || 0),
      // Charge Matrix
      c001: parseFloat(data.c001 || 0),
      c002: parseFloat(data.c002 || 0),
      c003: parseFloat(data.c003 || 0),
      c004: parseFloat(data.c004 || 0),
      c005: parseFloat(data.c005 || 0),
      c006: parseFloat(data.c006 || 0),
      c007: parseFloat(data.c007 || 0),
      c008: parseFloat(data.c008 || 0),
      c009: parseFloat(data.c009 || 0),
      c010: parseFloat(data.c010 || 0)
    };

    const response = await api.post(
      `/production-unit/${companyId}/${productionSiteId}`,
      payload
    );

    return response.data;
  } catch (error) {
    console.error('[ProductionAPI] Create error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create production data');
  }
};

export const updateProductionData = async (companyId, productionSiteId, data) => {
  try {
    const payload = {
      ...data,
      companyId: parseInt(companyId),
      productionSiteId: parseInt(productionSiteId),
      // Unit Matrix
      c1: parseFloat(data.c1 || 0),
      c2: parseFloat(data.c2 || 0),
      c3: parseFloat(data.c3 || 0),
      c4: parseFloat(data.c4 || 0),
      c5: parseFloat(data.c5 || 0),
      // Charge Matrix
      c001: parseFloat(data.c001 || 0),
      c002: parseFloat(data.c002 || 0),
      c003: parseFloat(data.c003 || 0),
      c004: parseFloat(data.c004 || 0),
      c005: parseFloat(data.c005 || 0),
      c006: parseFloat(data.c006 || 0),
      c007: parseFloat(data.c007 || 0),
      c008: parseFloat(data.c008 || 0),
      c009: parseFloat(data.c009 || 0),
      c010: parseFloat(data.c010 || 0)
    };

    const response = await api.put(
      `/production-unit/${companyId}/${productionSiteId}/${data.sk}`,
      payload
    );

    return response.data;
  } catch (error) {
    console.error('[ProductionAPI] Update error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update production data');
  }
};

// Update the deleteProductionData function
export const deleteProductionData = async (companyId, productionSiteId, sk) => {
  try {
    // Validate parameters
    if (!companyId || !productionSiteId || !sk) {
      throw new Error('Missing required parameters');
    }

    // Convert parameters to proper format
    const params = {
      companyId: parseInt(companyId),
      productionSiteId: parseInt(productionSiteId),
      sk: sk  // Keep the full MMYYYY format
    };

    console.log('[ProductionAPI] Deleting production:', params);

    const response = await api.delete(
      `/production-unit/${params.companyId}/${params.productionSiteId}/${params.sk}`
    );

    if (!response.data) {
      throw new Error('No response from server');
    }

    return response.data;
  } catch (error) {
    console.error('[ProductionAPI] Delete error:', error);
    if (error.response?.status === 400) {
      throw new Error(`Invalid request: ${error.response.data?.message || 'Bad request format'}`);
    }
    throw new Error(error.response?.data?.message || 'Failed to delete production data');
  }
};

export const fetchProductionData = async () => {
  try {
    const response = await api.get('/production-unit');
    return response.data || [];
  } catch (error) {
    console.error('[ProductionAPI] Error fetching production data:', error);
    return [];
  }
};

export const fetchProductionUnits = async () => {
  try {
    const response = await api.get('/production-unit');
    return response.data || [];
  } catch (error) {
    console.error('[ProductionAPI] Error fetching production units:', error);
    return [];
  }
};