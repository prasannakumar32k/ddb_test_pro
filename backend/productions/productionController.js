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
        logger.info('[ProductionController] Getting history:', { companyId, productionSiteId });

        const command = new QueryCommand({
            TableName: PRODUCTIONS_TABLE,
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: {
                ':pk': `${companyId}_${productionSiteId}`
            }
        });

        const result = await global.dynamoDb.send(command);

        return res.json({
            data: result.Items || [],
            message: result.Items?.length ? '' : 'No production history available'
        });
    } catch (error) {
        logger.error('[ProductionController] Error:', error);
        return res.status(500).json({
            error: 'Failed to fetch production history',
            details: error.message
        });
    }
};

// Create production data
const createProduction = async (req, res) => {
    try {
        const data = req.body;
        console.log('[ProductionController] Creating production data:', data);

        if (!data.pk || !data.sk) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'pk and sk are required'
            });
        }

        const params = {
            TableName: PRODUCTIONS_TABLE,
            Item: {
                pk: data.pk,
                sk: data.sk,
                c1: parseInt(data.c1) || 0,
                c2: parseInt(data.c2) || 0,
                c3: parseInt(data.c3) || 0,
                c4: parseInt(data.c4) || 0,
                c5: parseInt(data.c5) || 0,
                month: data.month,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

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
        const { companyId, productionSiteId, mmYY } = req.params;
        const updateData = req.body;
        console.log('[ProductionController] Updating production:', { companyId, productionSiteId, mmYY, updateData });

        // Validate input
        if (!companyId || !productionSiteId || !mmYY) {
            return res.status(400).json({
                error: 'Missing required parameters'
            });
        }

        const params = {
            TableName: PRODUCTIONS_TABLE,
            Key: {
                pk: `${companyId}_${productionSiteId}`,
                sk: mmYY
            },
            UpdateExpression: 'SET c1 = :c1, c2 = :c2, c3 = :c3, c4 = :c4, c5 = :c5, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':c1': parseInt(updateData.c1) || 0,
                ':c2': parseInt(updateData.c2) || 0,
                ':c3': parseInt(updateData.c3) || 0,
                ':c4': parseInt(updateData.c4) || 0,
                ':c5': parseInt(updateData.c5) || 0,
                ':updatedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        console.log('[ProductionController] Update params:', params);

        const command = new UpdateCommand(params);
        const result = await docClient.send(command);

        console.log('[ProductionController] Updated successfully:', result.Attributes);
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
        const { companyId, productionSiteId, sk } = req.params;
        console.log('[ProductionController] Deleting production:', { companyId, productionSiteId, sk });

        // Validate parameters
        if (!companyId || !productionSiteId || !sk) {
            return res.status(400).json({
                error: 'Missing required parameters',
                details: 'companyId, productionSiteId and sk are required'
            });
        }

        const params = {
            TableName: 'ProductionTable',
            Key: {
                pk: `${companyId}_${productionSiteId}`,
                sk: sk
            }
        };

        console.log('[ProductionController] Delete params:', params);
        const command = new DeleteCommand(params);
        await docClient.send(command);

        res.status(200).json({ success: true });
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
