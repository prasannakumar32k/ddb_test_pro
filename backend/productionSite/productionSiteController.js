const productionSiteDAL = require('./productionSiteDAL');
const productionDAL = require('../productions/productionDAL');
const logger = require('../utils/logger');

// Create new production site
exports.createProductionSite = async (req, res) => {
    try {
        const {
            companyId,
            productionSiteId,
            name,
            location,
            type,
            status,
            capacity_MW,
            banking,
            htscNo,
            injectionVoltage_KV,
            annualProduction_L
        } = req.body;

        // Validate required fields
        if (!name || !location || !type) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, location, and type are required'
            });
        }

        // Format data for creation
        const siteData = {
            companyId: companyId || 1,
            productionSiteId: productionSiteId || `site-${Date.now()}`,
            name,
            location,
            type,
            status: status || 'Active',
            capacity_MW: Number(capacity_MW) || 0,
            banking: Boolean(banking),
            htscNo: htscNo || '',
            injectionVoltage_KV: Number(injectionVoltage_KV) || 0,
            annualProduction_L: Number(annualProduction_L) || 0,
            sk: `${companyId || 1}_${productionSiteId || `site-${Date.now()}`}`
        };

        logger.info(`Creating production site with data:`, siteData);

        const result = await productionSiteDAL.createItem(siteData);

        logger.info(`Production site created successfully:`, result);

        return res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error(`Error creating production site:`, error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create production site',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get all production sites
exports.getAllProductionSites = async (req, res) => {
    try {
        const sites = await productionSiteDAL.getAllItems();
        res.json(sites);
    } catch (error) {
        logger.error('[ProductionSiteController] GetAll Error:', error);
        res.status(500).json({
            error: 'Failed to fetch production sites',
            details: error.message
        });
    }
};

// Get specific production site
exports.getProductionSite = async (req, res) => {
    try {
        const { companyId, productionSiteId } = req.params;

        // First get site details
        const site = await productionSiteDAL.getItem(
            parseInt(companyId),
            parseInt(productionSiteId)
        );

        if (!site) {
            return res.status(404).json({
                error: 'Production site not found',
                message: 'The requested resource does not exist'
            });
        }

        // Then get production data
        let productionData = [];
        try {
            const data = await productionDAL.getProductionData(
                parseInt(companyId),
                parseInt(productionSiteId)
            );

            if (data && data.length > 0) {
                productionData = data.map(item => ({
                    date: item.sk,
                    matrices: {
                        unit: {  // Unit Matrix data (c1-c5)
                            c1: parseFloat(item.c1 || 0),
                            c2: parseFloat(item.c2 || 0),
                            c3: parseFloat(item.c3 || 0),
                            c4: parseFloat(item.c4 || 0),
                            c5: parseFloat(item.c5 || 0)
                        },
                        charge: {  // Charge Matrix data (c001-c010)
                            c001: parseFloat(item.c001 || 0),
                            c002: parseFloat(item.c002 || 0),
                            c003: parseFloat(item.c003 || 0),
                            c004: parseFloat(item.c004 || 0),
                            c005: parseFloat(item.c005 || 0),
                            c006: parseFloat(item.c006 || 0),
                            c007: parseFloat(item.c007 || 0),
                            c008: parseFloat(item.c008 || 0),
                            c009: parseFloat(item.c009 || 0),
                            c010: parseFloat(item.c010 || 0)
                        }
                    },
                    totalUnit: parseFloat(item.c1 || 0) + parseFloat(item.c2 || 0) +
                        parseFloat(item.c3 || 0) + parseFloat(item.c4 || 0) +
                        parseFloat(item.c5 || 0),
                    totalCharge: parseFloat(item.c001 || 0) + parseFloat(item.c002 || 0) +
                        parseFloat(item.c003 || 0) + parseFloat(item.c004 || 0) +
                        parseFloat(item.c005 || 0) + parseFloat(item.c006 || 0) +
                        parseFloat(item.c007 || 0) + parseFloat(item.c008 || 0) +
                        parseFloat(item.c009 || 0) + parseFloat(item.c010 || 0),
                    month: new Date(item.sk.slice(0, 2) + '/01/' + item.sk.slice(2)).toLocaleString('default', { month: 'long' }),
                    year: '20' + item.sk.slice(2)
                }));
            }

            // Sort data by date
            productionData.sort((a, b) => new Date(b.date) - new Date(a.date));

        } catch (prodError) {
            logger.warn('[ProductionSiteController] Production data fetch warning:', prodError);
        }

        // Enhanced metadata
        const metadata = {
            hasProductionData: productionData.length > 0,
            lastUpdated: site.updatedAt,
            dataPoints: productionData.length,
            summary: productionData.length > 0 ? {
                totalUnits: productionData.reduce((sum, item) => sum + item.totalUnit, 0),
                totalCharges: productionData.reduce((sum, item) => sum + item.totalCharge, 0),
                averageUnits: productionData.reduce((sum, item) => sum + item.totalUnit, 0) / productionData.length,
                averageCharges: productionData.reduce((sum, item) => sum + item.totalCharge, 0) / productionData.length
            } : null
        };

        // Combine site and production data with enhanced structure
        const response = {
            ...site,
            productionData,
            metadata
        };

        res.json(response);
    } catch (error) {
        logger.error('[ProductionSiteController] getProductionSite Error:', error);
        res.status(500).json({
            error: 'Failed to fetch production site',
            details: error.message
        });
    }
};

// Update production site
exports.updateProductionSite = async (req, res) => {
    try {
        const { companyId, productionSiteId } = req.params;
        const updatedSite = await productionSiteDAL.updateItem(companyId, productionSiteId, req.body);
        res.json(updatedSite);
    } catch (error) {
        logger.error('[ProductionSiteController] Update Error:', error);
        res.status(500).json({
            error: 'Failed to update production site',
            details: error.message
        });
    }
};

// Delete production site
exports.deleteProductionSite = async (req, res) => {
    try {
        const { companyId, productionSiteId } = req.params;
        await productionSiteDAL.deleteItem(companyId, productionSiteId);
        res.status(204).send();
    } catch (error) {
        logger.error('[ProductionSiteController] Delete Error:', error);
        res.status(500).json({
            error: 'Failed to delete production site',
            details: error.message
        });
    }
};