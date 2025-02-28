<<<<<<< HEAD
// productionSiteDAL.js
const BaseDAL = require("../common/baseDAL");

class ProductionSiteDAL extends BaseDAL {
  constructor() {
    super("ProductionSiteTable");
  }

  async getAllItems() {
    try {
      console.log('[ProductionSiteDAL] Scanning DynamoDB table');
      const items = await this.scanTable();

      if (!items || items.length === 0) {
        console.log('[ProductionSiteDAL] No items found in DynamoDB');
        return [];
      }

      // Transform DynamoDB items to match frontend format
      const transformedItems = items.map(item => ({
        companyId: parseInt(item.companyId),
        productionSiteId: parseInt(item.productionSiteId),
        name: item.name,
        location: item.location,
        type: item.type,
        banking: item.banking === 1,
        capacity_MW: parseFloat(item.capacity_MW || 0),
        annualProduction_L: parseInt(item.annualProduction_L || 0),
        htscNo: item.htscNo,
        injectionVoltage_KV: parseInt(item.injectionVoltage_KV || 0),
        status: item.status
      }));

      console.log(`[ProductionSiteDAL] Transformed ${transformedItems.length} items`);
      return transformedItems;
    } catch (error) {
      console.error('[ProductionSiteDAL] Error scanning DynamoDB:', error);
      throw error;
    }
  }

  async getItem(companyId, productionSiteId) {
    try {
      if (!companyId || !productionSiteId) {
        throw new Error('Missing required parameters');
      }

      const key = {
        companyId: parseInt(companyId),
        productionSiteId: parseInt(productionSiteId)
      };

      console.log('[ProductionSiteDAL] Getting item from DynamoDB:', key);
      const item = await super.getItem(key);

      if (!item) {
        console.log('[ProductionSiteDAL] Item not found in DynamoDB');
        return null;
      }

      return item;
    } catch (error) {
      console.error('[ProductionSiteDAL] Error getting item:', error);
      throw error;
    }
  }

  async putItem(item) {
    try {
      if (!item) {
        throw new Error('No item provided');
      }

      const validatedItem = {
        companyId: parseInt(item.companyId),
        productionSiteId: parseInt(item.productionSiteId),
        name: item.name,
        location: item.location,
        type: item.type,
        banking: item.banking ? 1 : 0,
        capacity_MW: parseFloat(item.capacity_MW || 0),
        htscNo: item.htscNo,
        status: item.status
      };

      console.log('[ProductionSiteDAL] Putting item to DynamoDB:', validatedItem);
      return await super.putItem(validatedItem);
    } catch (error) {
      console.error('[ProductionSiteDAL] Error putting item:', error);
      throw error;
    }
  }

  async updateItem(companyId, productionSiteId, updateItems) {
    try {
      if (!companyId || !productionSiteId || !updateItems) {
        throw new Error('Missing required parameters');
      }

      const key = {
        companyId: parseInt(companyId),
        productionSiteId: parseInt(productionSiteId)
      };

      console.log('[ProductionSiteDAL] Updating item in DynamoDB:', { key, updateItems });
      return await super.updateItem(key, updateItems);
    } catch (error) {
      console.error('[ProductionSiteDAL] Error updating item:', error);
      throw error;
    }
  }

  async deleteItem(companyId, productionSiteId) {
    try {
      if (!companyId || !productionSiteId) {
        throw new Error('Missing required parameters');
      }

      const key = {
        companyId: parseInt(companyId),
        productionSiteId: parseInt(productionSiteId)
      };

      console.log('[ProductionSiteDAL] Deleting item from DynamoDB:', key);
      return await super.deleteItem(key);
    } catch (error) {
      console.error('[ProductionSiteDAL] Error deleting item:', error);
      throw error;
    }
  }
=======
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { 
    DynamoDBDocumentClient, 
    ScanCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand 
} = require("@aws-sdk/lib-dynamodb");
const logger = require('../utils/logger');

class ProductionSiteDAL {
    constructor() {
        this.tableName = 'ProductionSiteTable';
        this.client = new DynamoDBClient({
            region: process.env.AWS_REGION || 'us-west-2',
            endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
            }
        });
        this.docClient = DynamoDBDocumentClient.from(this.client);
    }

    async getAllItems() {
        try {
            logger.info('[ProductionSiteDAL] Scanning table for all items');
            
            const command = new ScanCommand({
                TableName: this.tableName
            });

            const { Items = [] } = await this.docClient.send(command);
            
            logger.info(`[ProductionSiteDAL] Found ${Items.length} items`);

            // Transform the data to ensure consistent format
            const normalizedItems = Items.map(item => ({
                companyId: Number(item.companyId),
                productionSiteId: Number(item.productionSiteId),
                name: item.name || '',
                location: item.location || '',
                type: item.type || '',
                capacity_MW: Number(item.capacity_MW || 0),
                banking: Boolean(item.banking),
                status: item.status || 'Active',
                htscNo: item.htscNo || '',
                injectionVoltage_KV: Number(item.injectionVoltage_KV || 0),
                annualProduction_L: Number(item.annualProduction_L || 0)
            }));

            logger.debug('[ProductionSiteDAL] Normalized items:', normalizedItems);
            return normalizedItems;

        } catch (error) {
            logger.error('[ProductionSiteDAL] Error in getAllItems:', error);
            throw error;
        }
    }

    async getSiteById(companyId, productionSiteId) {
        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: {
                    companyId: parseInt(companyId),
                    productionSiteId: parseInt(productionSiteId)
                }
            });

            const { Item } = await this.docClient.send(command);
            return Item;
        } catch (error) {
            console.error('[ProductionSiteDAL] Error in getSiteById:', error);
            throw error;
        }
    }

    async createSite(site) {
        try {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: {
                    companyId: parseInt(site.companyId),
                    productionSiteId: parseInt(site.productionSiteId),
                    name: site.name,
                    location: site.location,
                    type: site.type,
                    banking: site.banking ? 1 : 0,
                    capacity_MW: parseFloat(site.capacity_MW || 0),
                    annualProduction_L: parseFloat(site.annualProduction_L || 0),
                    htscNo: site.htscNo,
                    injectionVoltage_KV: parseFloat(site.injectionVoltage_KV || 0),
                    status: site.status || 'Active'
                }
            });

            await this.docClient.send(command);
            return site;
        } catch (error) {
            console.error('[ProductionSiteDAL] Error in createSite:', error);
            throw error;
        }
    }

    async updateSite(companyId, productionSiteId, updates) {
        try {
            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: {
                    companyId: parseInt(companyId),
                    productionSiteId: parseInt(productionSiteId)
                },
                UpdateExpression: 'set #n = :name, #l = :location, #t = :type, #b = :banking, #c = :capacity, #a = :annual, #h = :htsc, #i = :injection, #s = :status',
                ExpressionAttributeNames: {
                    '#n': 'name',
                    '#l': 'location',
                    '#t': 'type',
                    '#b': 'banking',
                    '#c': 'capacity_MW',
                    '#a': 'annualProduction_L',
                    '#h': 'htscNo',
                    '#i': 'injectionVoltage_KV',
                    '#s': 'status'
                },
                ExpressionAttributeValues: {
                    ':name': updates.name,
                    ':location': updates.location,
                    ':type': updates.type,
                    ':banking': updates.banking ? 1 : 0,
                    ':capacity': parseFloat(updates.capacity_MW || 0),
                    ':annual': parseFloat(updates.annualProduction_L || 0),
                    ':htsc': updates.htscNo,
                    ':injection': parseFloat(updates.injectionVoltage_KV || 0),
                    ':status': updates.status || 'Active'
                },
                ReturnValues: 'ALL_NEW'
            });

            const { Attributes } = await this.docClient.send(command);
            return Attributes;
        } catch (error) {
            console.error('[ProductionSiteDAL] Error in updateSite:', error);
            throw error;
        }
    }

    async deleteSite(companyId, productionSiteId) {
        try {
            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: {
                    companyId: parseInt(companyId),
                    productionSiteId: parseInt(productionSiteId)
                }
            });

            await this.docClient.send(command);
            return { companyId, productionSiteId };
        } catch (error) {
            console.error('[ProductionSiteDAL] Error in deleteSite:', error);
            throw error;
        }
    }
>>>>>>> fbc1dea (Initial commit: Production site management application)
}

module.exports = new ProductionSiteDAL();
