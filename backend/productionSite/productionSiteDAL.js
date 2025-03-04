// productionSiteDAL.js
const { QueryCommand, ScanCommand, PutCommand, DeleteCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const logger = require('../utils/logger');
const db = require('../utils/db');

class ProductionSiteDAL {
  constructor() {
    this.tableName = process.env.PRODUCTION_SITES_TABLE || 'ProductionSiteTable';
  }

  async checkTableExists() {
    try {
      const { TableNames } = await global.dynamoDb.send(new ListTablesCommand({}));
      return TableNames.includes(this.tableName);
    } catch (error) {
      logger.error('[ProductionSiteDAL] checkTableExists Error:', error);
      throw error;
    }
  }

  async getAllItems() {
    try {
      if (!(await this.checkTableExists())) {
        throw new Error(`Table ${this.tableName} does not exist. Please run initialization script.`);
      }

      const command = new ScanCommand({
        TableName: this.tableName,
        ProjectionExpression: "companyId, productionSiteId, #name, #location, #type, #status, banking, capacity_MW, annualProduction_L, htscNo, injectionVoltage_KV, createdAt, updatedAt",
        ExpressionAttributeNames: {
          "#name": "name",
          "#location": "location",
          "#type": "type",
          "#status": "status"
        }
      });

      const result = await global.dynamoDb.send(command);
      return (result.Items || []).map(item => ({
        companyId: parseInt(item.companyId),
        productionSiteId: parseInt(item.productionSiteId),
        name: item.name,
        location: item.location,
        type: item.type,
        status: item.status,
        banking: parseInt(item.banking || 0),
        capacity_MW: parseFloat(item.capacity_MW || 0),
        annualProduction_L: parseFloat(item.annualProduction_L || 0),
        htscNo: item.htscNo,
        injectionVoltage_KV: parseFloat(item.injectionVoltage_KV || 0),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
    } catch (error) {
      logger.error('[ProductionSiteDAL] getAllItems Error:', error);
      throw error;
    }
  }

  async getItem(companyId, productionSiteId) {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'companyId = :companyId AND productionSiteId = :productionSiteId',
        ExpressionAttributeValues: {
          ':companyId': parseInt(companyId),
          ':productionSiteId': parseInt(productionSiteId)
        },
        ProjectionExpression: "companyId, productionSiteId, #name, #location, #type, #status, banking, capacity_MW, annualProduction_L, htscNo, injectionVoltage_KV, createdAt, updatedAt",
        ExpressionAttributeNames: {
          "#name": "name",
          "#location": "location",
          "#type": "type",
          "#status": "status"
        }
      });

      const result = await global.dynamoDb.send(command);
      const item = result.Items?.[0];

      if (!item) return null;

      // Return with consistent field names matching the sample data
      return {
        companyId: parseInt(companyId),
        productionSiteId: parseInt(productionSiteId),
        name: item.name || '',
        location: item.location || '',
        type: item.type || '',
        status: item.status || 'Active',
        banking: parseInt(item.banking || 0),
        capacity_MW: parseFloat(item.capacity_MW || 0),
        annualProduction_L: parseFloat(item.annualProduction_L || 0),
        htscNo: item.htscNo || '',
        injectionVoltage_KV: parseFloat(item.injectionVoltage_KV || 0),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      };
    } catch (error) {
      logger.error('[ProductionSiteDAL] getItem Error:', error);
      throw error;
    }
  }

  async createItem(item) {
    try {
      if (!item.companyId || !item.productionSiteId) {
        throw new Error('Missing required fields: companyId and productionSiteId');
      }

      const now = new Date().toISOString();
      const newItem = {
        companyId: parseInt(item.companyId),
        productionSiteId: parseInt(item.productionSiteId),
        name: item.name || item.Name || '',
        location: item.location || item.Location || '',
        type: item.type || item.Type || '',
        status: item.status || item.Status || 'Active',
        banking: parseInt(item.banking || item.Banking || 0),
        capacity_MW: parseFloat(item.capacity_MW || item.Capacity_MW || 0),
        annualProduction_L: parseFloat(item.annualProduction_L || item.AnnualProduction || 0),
        htscNo: item.htscNo || item.HtscNo || '',
        injectionVoltage_KV: parseFloat(item.injectionVoltage_KV || item.InjectionValue || 0),
        createdAt: now,
        updatedAt: now
      };

      const command = new PutCommand({
        TableName: this.tableName,
        Item: newItem
      });

      await db.send(command);
      return newItem;
    } catch (error) {
      logger.error('[ProductionSiteDAL] createItem Error:', error);
      throw error;
    }
  }

  async updateItem(companyId, productionSiteId, updates) {
    try {
      // Build update expression dynamically
      const updateExpressions = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'companyId' && key !== 'productionSiteId') {
          updateExpressions.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = value;
        }
      });

      // Add updatedAt timestamp
      updateExpressions.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: {
          companyId: parseInt(companyId),
          productionSiteId: parseInt(productionSiteId)
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
        ConditionExpression: 'attribute_exists(companyId) AND attribute_exists(productionSiteId)'
      });

      const result = await global.dynamoDb.send(command);
      return result.Attributes;
    } catch (error) {
      logger.error('[ProductionSiteDAL] updateItem Error:', error);
      throw error;
    }
  }

  async deleteItem(companyId, productionSiteId) {
    try {
      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: {
          companyId: parseInt(companyId),
          productionSiteId: parseInt(productionSiteId)
        },
        ConditionExpression: 'attribute_exists(companyId) AND attribute_exists(productionSiteId)'
      });
      await global.dynamoDb.send(command);
    } catch (error) {
      logger.error('[ProductionSiteDAL] deleteItem Error:', error);
      throw error;
    }
  }
}

module.exports = new ProductionSiteDAL();
