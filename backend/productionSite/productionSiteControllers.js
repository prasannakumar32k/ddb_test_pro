<<<<<<< HEAD
const productionSiteDAL = require("./productionSiteDAL");

// Create (POST) a new item
exports.createProductionSite = async (req, res) => {
    try {
        const newItem = {
            ...req.body,
            companyId: parseInt(req.body.CompanyId || 1),
            productionSiteId: Date.now(), // Use timestamp as unique ID
            name: req.body.Name,
            location: req.body.Location,
            type: req.body.Type,
            banking: req.body.Banking ? 1 : 0,
            capacity_MW: parseFloat(req.body.Capacity_MW || 0),
            htscNo: req.body.HtscNo,
            status: req.body.Status
        };

        const result = await productionSiteDAL.putItem(newItem);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating production site:', error);
        res.status(500).json({ error: 'Failed to create production site' });
    }
};

// Read (GET) all items
exports.getAllProductionSites = async (req, res) => {
    try {
        console.log('Fetching all production sites from DynamoDB');
        const items = await productionSiteDAL.getAllItems();

        if (!items || items.length === 0) {
            console.log('No items found in DynamoDB');
            return res.json([]);
        }

        console.log(`Found ${items.length} items in DynamoDB`);
        res.json(items);
    } catch (error) {
        console.error('Error getting production sites:', error);
        res.status(500).json({ error: 'Failed to get production sites' });
    }
};

// Read (GET) a specific item by companyId and productionSiteId
exports.getProductionSite = async (req, res) => {
    try {
        const companyId = parseInt(req.params.companyId);
        const productionSiteId = parseInt(req.params.productionSiteId);

        if (isNaN(companyId) || isNaN(productionSiteId)) {
            return res.status(400).json({ 
                error: 'Invalid parameters: companyId and productionSiteId must be numbers' 
            });
        }

        const item = await productionSiteDAL.getItem(companyId, productionSiteId);
        
        if (!item) {
            return res.status(404).json({ error: 'Production site not found' });
        }

        console.log('Retrieved item:', item);
        res.json(item);
    } catch (error) {
        console.error('Error getting production site:', error);
        res.status(500).json({ error: 'Failed to get production site' });
    }
};

// Update (PUT) an item by companyId and productionSiteId
exports.updateProductionSite = async (req, res) => {
    try {
        const companyId = parseInt(req.params.companyId);
        const productionSiteId = parseInt(req.params.productionSiteId);
        const updateItems = req.body;

        const item = await productionSiteDAL.updateItem(companyId, productionSiteId, updateItems);
        console.log('Updated item:', item);
        res.json(item);
    } catch (error) {
        console.error('Error updating production site:', error);
        res.status(500).json({ error: 'Failed to update production site' });
    }
};

// Delete (DELETE) an item by companyId and productionSiteId
exports.deleteProductionSite = async (req, res) => {
    try {
        const companyId = parseInt(req.params.companyId);
        const productionSiteId = parseInt(req.params.productionSiteId);

        const item = await productionSiteDAL.deleteItem(companyId, productionSiteId);
        console.log('Deleted item:', item);
        res.json(item);
    } catch (error) {
        console.error('Error deleting production site:', error);
        res.status(500).json({ error: 'Failed to delete production site' });
    }
=======
const logger = require('../utils/logger');
const ProductionSiteDAL = require('./productionSiteDAL');

const getAllProductionSites = async (req, res) => {
    try {
        logger.info('[ProductionSiteController] Fetching all production sites');
        
        const items = await ProductionSiteDAL.getAllItems();
        
        if (!items) {
            logger.warn('[ProductionSiteController] No items found');
            return res.json([]);
        }

        logger.info(`[ProductionSiteController] Successfully retrieved ${items.length} sites`);
        return res.json(items);

    } catch (error) {
        logger.error('[ProductionSiteController] Error:', error);
        return res.status(500).json({
            error: 'Failed to get production sites',
            message: error.message
        });
    }
};

const getProductionSiteById = async (req, res) => {
    try {
        const { companyId, productionSiteId } = req.params;
        logger.info('[ProductionSiteController] Getting site:', { companyId, productionSiteId });
        
        const site = await ProductionSiteDAL.getSiteById(companyId, productionSiteId);
        if (!site) {
            return res.status(404).json({
                error: 'Site not found',
                details: `No site found with ID ${productionSiteId} for company ${companyId}`
            });
        }

        res.json(site);
    } catch (error) {
        logger.error('[ProductionSiteController] Error getting site:', error);
        res.status(500).json({
            error: 'Failed to fetch production site',
            details: error.message
        });
    }
};

const createProductionSite = async (req, res) => {
    try {
        const siteData = req.body;
        logger.info('[ProductionSiteController] Creating site:', siteData);

        // Add timestamps
        siteData.createdAt = new Date().toISOString();
        siteData.updatedAt = new Date().toISOString();

        const site = await ProductionSiteDAL.createSite(siteData);
        res.status(201).json(site);
    } catch (error) {
        logger.error('[ProductionSiteController] Error creating site:', error);
        res.status(500).json({
            error: 'Failed to create production site',
            details: error.message
        });
    }
};

const updateProductionSite = async (req, res) => {
    try {
        const { companyId, productionSiteId } = req.params;
        const updates = req.body;
        logger.info('[ProductionSiteController] Updating site:', { companyId, productionSiteId, updates });

        // Add update timestamp
        updates.updatedAt = new Date().toISOString();

        const site = await ProductionSiteDAL.getSiteById(companyId, productionSiteId);
        if (!site) {
            return res.status(404).json({
                error: 'Site not found',
                details: `No site found with ID ${productionSiteId} for company ${companyId}`
            });
        }

        const updatedSite = await ProductionSiteDAL.updateSite(companyId, productionSiteId, updates);
        res.json(updatedSite);
    } catch (error) {
        logger.error('[ProductionSiteController] Error updating site:', error);
        res.status(500).json({
            error: 'Failed to update production site',
            details: error.message
        });
    }
};

const deleteProductionSite = async (req, res) => {
    try {
        const { companyId, productionSiteId } = req.params;
        logger.info('[ProductionSiteController] Deleting site:', { companyId, productionSiteId });

        const site = await ProductionSiteDAL.getSiteById(companyId, productionSiteId);
        if (!site) {
            return res.status(404).json({
                error: 'Site not found',
                details: `No site found with ID ${productionSiteId} for company ${companyId}`
            });
        }

        await ProductionSiteDAL.deleteSite(companyId, productionSiteId);
        res.json({ success: true, message: 'Production site deleted successfully' });
    } catch (error) {
        logger.error('[ProductionSiteController] Error deleting site:', error);
        res.status(500).json({
            error: 'Failed to delete production site',
            details: error.message
        });
    }
};

module.exports = {
    getAllProductionSites,
    getProductionSiteById,
    createProductionSite,
    updateProductionSite,
    deleteProductionSite
>>>>>>> fbc1dea (Initial commit: Production site management application)
};
