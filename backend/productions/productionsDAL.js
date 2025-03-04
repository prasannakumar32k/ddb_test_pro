const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const BaseDAL = require('../common/baseDAL');

class ProductionsDAL extends BaseDAL {
  constructor() {
    super('Productions');
  }

  generateKeys(site, date) {
    const [year, month] = date.split('-');
    return {
      PK: `SITE#${site}`,
      SK: `PRODUCTION#${year}#${month.padStart(2, '0')}`,
    };
  }

  async createProduction(productionData) {
    const { site, date, ...rest } = productionData;
    const [year, month] = date.split('-');
    const keys = this.generateKeys(site, date);
    const item = {
      ...keys,
      site,
      year: parseInt(year),
      month: parseInt(month),
      ...rest
    };

    const params = {
      TableName: this.tableName,
      Item: item,
    };

    try {
      await this.docClient.send(new PutCommand(params));
      return item;
    } catch (error) {
      console.error("Error in createProduction:", error);
      throw error;
    }
  }

  async updateProduction(site, date, updateData) {
    const keys = this.generateKeys(site, date);

    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.keys(updateData).forEach((prop, index) => {
      updateExpression.push(`#field${index} = :value${index}`);
      expressionAttributeNames[`#field${index}`] = prop;
      expressionAttributeValues[`:value${index}`] = updateData[prop];
    });

    const params = {
      TableName: this.tableName,
      Key: keys,
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    try {
      const result = await this.docClient.send(new UpdateCommand(params));
      return unmarshall(result.Attributes);
    } catch (error) {
      console.error("Error in updateProduction:", error);
      throw error;
    }
  }

  async deleteProduction(site, date) {
    const keys = this.generateKeys(site, date);
    const params = {
      TableName: this.tableName,
      Key: keys,
    };

    try {
      await this.docClient.send(new DeleteCommand(params));
    } catch (error) {
      console.error("Error in deleteProduction:", error);
      throw error;
    }
  }

  async getProduction(site, date) {
    const keys = this.generateKeys(site, date);
    const params = {
      TableName: this.tableName,
      Key: keys,
    };

    try {
      const result = await this.docClient.send(new GetCommand(params));
      return result.Item ? unmarshall(result.Item) : null;
    } catch (error) {
      console.error("Error in getProduction:", error);
      throw error;
    }
  }

  async getProductionsBySite(site) {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `SITE#${site}`,
        ':sk': 'PRODUCTION#',
      },
    };

    try {
      const result = await this.docClient.send(new QueryCommand(params));
      return result.Items.map(item => unmarshall(item));
    } catch (error) {
      console.error("Error in getProductionsBySite:", error);
      throw error;
    }
  }
}

module.exports = new ProductionsDAL();

