const productionSiteDAL = require("./productionSiteDAL");

// Helper function for robust data parsing
const parseValue = (value, type = 'string', defaultValue = null) => {
    if (value === undefined || value === null) return defaultValue;

    switch (type) {
        case 'int':
            const parsedInt = parseInt(value);
            return isNaN(parsedInt) ? (defaultValue || 0) : parsedInt;
        case 'float':
            const parsedFloat = parseFloat(value);
            return isNaN(parsedFloat) ? (defaultValue || 0) : parsedFloat;
        case 'boolean':
            return value === true || value === 1 || value === '1';
        default:
            return value;
    }
};

// Read (GET) all items
exports.getAllProductionSites = async (req, res) => {
    try {
        console.log('[ProductionSiteController] Fetching all production sites');
        console.log('[ProductionSiteController] Table Name:', productionSiteDAL.tableName);

        // More robust table existence check
        const tables = await productionSiteDAL.docClient.listTables().promise();
        console.log('[ProductionSiteController] Available Tables:', tables.TableNames);

        if (!tables.TableNames.includes(productionSiteDAL.tableName)) {
            console.error(`[ProductionSiteController] Table ${productionSiteDAL.tableName} not found`);
            return res.status(500).json({
                error: 'Database setup required',
                details: `Table ${productionSiteDAL.tableName} does not exist. Please run npm run create-table to set up the database`,
                availableTables: tables.TableNames
            });
        }

        const items = await productionSiteDAL.getAllItems();
        console.log(`[ProductionSiteController] Found ${items.length} items`);
        res.json(items);

    } catch (error) {
        console.error('[ProductionSiteController] Error:', error);
        res.status(500).json({
            error: 'Failed to get production sites',
            details: error.message,
            stack: error.stack
        });
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
};
