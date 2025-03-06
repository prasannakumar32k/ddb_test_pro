const BaseDAL = require("../common/baseDAL");
const productionDTO = require("./productionDTO");
const { QueryCommand, GetItemCommand } = require("@aws-sdk/lib-dynamodb");
const logger = require('../utils/logger');
const db = require('../utils/db');

const PRODUCTION_SITE_TABLE = "ProductionTable";

class ProductionDAL extends BaseDAL {
  constructor() {
    super(PRODUCTION_SITE_TABLE);
    this.tableName = process.env.PRODUCTION_DATA_TABLE;
  }

  async getAllItems() {
    return await super.scanTable();
  }

  async getItem(companyId, productionSiteId, mmYY) {
    // Ensure companyId and productionSiteId are strings when concatenating
    const pk = `${companyId}_${productionSiteId}`;
    const key = { "pk": pk, "sk": mmYY };
    const item = await super.getItem(key);
    return item;
  }

  async putItem(item) {
    // Ensure pk is properly formatted when putting items
    if (item.companyId && item.productionSiteId) {
      item.pk = `${item.companyId}_${item.productionSiteId}`;
    }
    return await super.putItem(item);
  }

  async updateItem(companyId, productionSiteId, mmYY, updateItems) {
    const pk = `${companyId}_${productionSiteId}`;
    const key = { "pk": pk, "sk": mmYY };
    return await super.updateItem(key, updateItems);
  }

  async deleteItem(companyId, productionSiteId, mmYY) {
    const pk = `${companyId}_${productionSiteId}`;
    const key = { "pk": pk, "sk": mmYY };
    const item = await super.deleteItem(key);
    return item;
  }

  async queryItems(keyCondition) {
    try {
      console.log('[ProductionDAL] Querying with condition:', keyCondition);
      const items = await super.queryItems(keyCondition);
      console.log(`[ProductionDAL] Found ${items.length} items`);
      return items;
    } catch (error) {
      console.error('[ProductionDAL] Query error:', error);
      throw error;
    }
  }

  async getProductionData(companyId, productionSiteId) {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
          ':pk': `${companyId}_${productionSiteId}`
        }
      });

      const result = await global.dynamoDb.send(command);

      if (!result.Items || result.Items.length === 0) {
        logger.info(`No production data found for site ${companyId}_${productionSiteId}`);
        return [];
      }

      return result.Items;
    } catch (error) {
      logger.error('[ProductionDAL] getProductionData Error:', error);
      throw error;
    }
  }

  async getProductionData(companyId, productionSiteId, sk) {
    try {
      const params = {
        TableName: this.tableName,
        Key: {
          companyId: parseInt(companyId),
          productionSiteId: productionSiteId,
          sk: sk
        }
      };

      const command = new GetItemCommand(params);
      const result = await db.send(command);

      return result.Item || null;
    } catch (error) {
      console.error('[ProductionDAL] Get data error:', error);
      throw error;
    }
  }
}

module.exports = ProductionDAL;
