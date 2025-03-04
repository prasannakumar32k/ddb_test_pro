const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    QueryCommand,
    ScanCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const docClient = require('../config/db');
const PRODUCTIONS_TABLE = 'ProductionTable'; // Updated table name
const logger = require('../utils/logger');

// Get all productions
const getAllProductions = async (req, res) => {
    try {
        console.log('[ProductionController] Getting all productions');
        const params = {
            TableName: PRODUCTIONS_TABLE
        };

        const command = new ScanCommand(params);
        const result = await docClient.send(command);

        // Transform and validate the data before sending
        const transformedItems = (result.Items || []).map(item => ({
            companyId: parseInt(item.companyId),
            productionSiteId: parseInt(item.productionSiteId),
            sk: item.sk,
            c1: parseInt(item.c1 || 0),
            c2: parseInt(item.c2 || 0),
            c3: parseInt(item.c3 || 0),
            c4: parseInt(item.c4 || 0),
            c5: parseInt(item.c5 || 0)
        }));

        console.log('[ProductionController] Found items:', transformedItems.length);
        return res.json(transformedItems);
    } catch (error) {
        console.error('[ProductionController] Error in getAllProductions:', error);
        return res.status(500).json({
            error: 'Failed to fetch productions',
            details: error.message
        });
    }
};

// Get production history by company and production-site
const getProductionHistory = async (req, res) => {
    try {
        const { companyId, productionSiteId } = req.params;
        console.log('[ProductionController] Fetching history for:', { companyId, productionSiteId });

        const params = {
            TableName: PRODUCTIONS_TABLE,
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: {
                ':pk': `${companyId}_${productionSiteId}`
            }
        };

        const command = new QueryCommand(params);
        const result = await docClient.send(command);

        // Transform the data to ensure consistent format
        const transformedData = (result.Items || []).map(item => ({
            pk: item.pk,
            sk: item.sk,
            c1: parseInt(item.c1 || 0),
            c2: parseInt(item.c2 || 0),
            c3: parseInt(item.c3 || 0),
            c4: parseInt(item.c4 || 0),
            c5: parseInt(item.c5 || 0),
            c001: parseInt(item.c001 || 0),
            c002: parseInt(item.c002 || 0),
            c003: parseInt(item.c003 || 0),
            c004: parseInt(item.c004 || 0),
            c005: parseInt(item.c005 || 0),
            c006: parseInt(item.c006 || 0),
            c007: parseInt(item.c007 || 0),
            c008: parseInt(item.c008 || 0),
            c009: parseInt(item.c009 || 0),
            c010: parseInt(item.c010 || 0)
        }));

        console.log('[ProductionController] Found items:', transformedData.length);

        // Return just the array without wrapping
        res.json(transformedData);

    } catch (error) {
        console.error('[ProductionController] Error:', error);
        res.status(500).json({
            error: 'Failed to fetch production history',
            details: error.message
        });
    }
};

// Create production data
const createProduction = async (req, res) => {
    try {
        const { companyId, productionSiteId } = req.params;
        const data = req.body;

        // Create pk from route parameters
        const pk = `${companyId}_${productionSiteId}`;

        console.log('[ProductionController] Creating production data:', {
            pk,
            sk: data.sk,
            ...data
        });

        const params = {
            TableName: PRODUCTIONS_TABLE,
            Item: {
                pk: pk,
                sk: data.sk,
                // Unit Matrix (c1-c5)
                c1: parseInt(data.c1) || 0,
                c2: parseInt(data.c2) || 0,
                c3: parseInt(data.c3) || 0,
                c4: parseInt(data.c4) || 0,
                c5: parseInt(data.c5) || 0,
                // Charge Matrix (c001-c010)
                c001: parseInt(data.c001) || 0,
                c002: parseInt(data.c002) || 0,
                c003: parseInt(data.c003) || 0,
                c004: parseInt(data.c004) || 0,
                c005: parseInt(data.c005) || 0,
                c006: parseInt(data.c006) || 0,
                c007: parseInt(data.c007) || 0,
                c008: parseInt(data.c008) || 0,
                c009: parseInt(data.c009) || 0,
                c010: parseInt(data.c010) || 0,
                // Metadata
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        // Validate required fields
        if (!pk || !data.sk) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'CompanyId, ProductionSiteId and sk are required'
            });
        }

        console.log('[ProductionController] Attempting to create with params:', params);

        const command = new PutCommand(params);
        await docClient.send(command);

        console.log('[ProductionController] Data created successfully');
        res.status(201).json(params.Item);
    } catch (error) {
        console.error('[ProductionController] Error creating production:', error);
        res.status(500).json({
            error: 'Failed to create production data',
            details: error.message
        });
    }
};


// Update production data
const updateProduction = async (req, res) => {
    try {
        const { companyId, productionSiteId, month } = req.params;
        const data = req.body;

        // Validate input
        if (!companyId || !productionSiteId || !month) {
            return res.status(400).json({
                error: 'Missing required parameters',
                details: 'CompanyId, ProductionSiteId and month are required'
            });
        }

        // Create update params
        const params = {
            TableName: PRODUCTIONS_TABLE,
            Key: {
                pk: `${companyId}_${productionSiteId}`,
                sk: month
            },
            UpdateExpression: 'SET ' +
                'c1 = :c1, c2 = :c2, c3 = :c3, c4 = :c4, c5 = :c5, ' +
                'c001 = :c001, c002 = :c002, c003 = :c003, c004 = :c004, c005 = :c005, ' +
                'c006 = :c006, c007 = :c007, c008 = :c008, c009 = :c009, c010 = :c010, ' +
                'updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':c1': Number(data.c1) || 0,
                ':c2': Number(data.c2) || 0,
                ':c3': Number(data.c3) || 0,
                ':c4': Number(data.c4) || 0,
                ':c5': Number(data.c5) || 0,
                ':c001': Number(data.c001) || 0,
                ':c002': Number(data.c002) || 0,
                ':c003': Number(data.c003) || 0,
                ':c004': Number(data.c004) || 0,
                ':c005': Number(data.c005) || 0,
                ':c006': Number(data.c006) || 0,
                ':c007': Number(data.c007) || 0,
                ':c008': Number(data.c008) || 0,
                ':c009': Number(data.c009) || 0,
                ':c010': Number(data.c010) || 0,
                ':updatedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        console.log('[ProductionController] Updating with params:', params);

        const command = new UpdateCommand(params);
        const result = await docClient.send(command);

        console.log('[ProductionController] Update successful:', result.Attributes);
        res.json(result.Attributes);

    } catch (error) {
        console.error('[ProductionController] Update error:', error);
        res.status(500).json({
            error: 'Failed to update production data',
            details: error.message
        });
    }
};


// Delete production data
const deleteProduction = async (req, res) => {
    try {
        const { companyId, productionSiteId, month } = req.params;

        // Validate required parameters
        if (!companyId || !productionSiteId || !month) {
            return res.status(400).json({
                error: 'Missing required parameters',
                details: 'companyId, productionSiteId and month are required'
            });
        }

        const params = {
            TableName: PRODUCTIONS_TABLE,
            Key: {
                pk: `${companyId}_${productionSiteId}`,
                sk: month
            }
        };

        console.log('[ProductionController] Deleting production data:', params);

        const command = new DeleteCommand(params);
        await docClient.send(command);

        console.log('[ProductionController] Delete successful');
        res.status(200).json({ message: 'Production data deleted successfully' });

    } catch (error) {
        console.error('[ProductionController] Delete error:', error);
        res.status(500).json({
            error: 'Failed to delete production data',
            details: error.message
        });
    }
};

const getProductionUnits = async (req, res) => {
    try {
        const params = {
            TableName: "ProductionTable",
            ProjectionExpression: "pk, sk, Name, Type, Capacity_MW, Status, Banking, Location, HtscNo"
        };

        const command = new ScanCommand(params);
        const result = await docClient.send(command);

        const units = result.Items.map(unit => ({
            CompanyId: parseInt(unit.pk.split('_')[0]),
            productionSiteId: parseInt(unit.pk.split('_')[1]),
            Name: unit.Name,
            Type: unit.Type,
            Location: unit.Location,
            Capacity_MW: parseFloat(unit.Capacity_MW),
            Status: unit.Status,
            Banking: unit.Banking === 1 || unit.Banking === '1',
            HtscNo: unit.HtscNo
        }));

        console.log('[ProductionController] Found units:', units);
        res.json(units);
    } catch (error) {
        console.error('[ProductionController] Error:', error);
        res.status(500).json({ error: 'Failed to fetch production units' });
    }
};

module.exports = {
    getAllProductions,
    getProductionHistory,
    createProduction,
    updateProduction,
    deleteProduction,
    getProductionUnits
};
