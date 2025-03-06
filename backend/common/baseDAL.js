const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    ScanCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand
} = require("@aws-sdk/lib-dynamodb");
const logger = require('../utils/logger');

// DynamoDB Local Configuration
const client = new DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000",
    credentials: {
        accessKeyId: "local",
        secretAccessKey: "local"
    },
    tls: false,
    forcePathStyle: true
});

// Configure DocumentClient with proper marshalling
const ddbDocClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
    }
});

class BaseDAL {
    constructor(tableName) {
        this.tableName = tableName;
        this.docClient = global.dynamoDb;
    }

    async scanTable() {
        try {
            const command = new ScanCommand({
                TableName: this.tableName
            });
            const response = await this.docClient.send(command);
            return response.Items || [];
        } catch (error) {
            logger.error(`[BaseDAL] Scan error for ${this.tableName}:`, error);
            throw error;
        }
    }

    async getItem(key) {
        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: key
            });
            const response = await this.docClient.send(command);
            return response.Item;
        } catch (error) {
            logger.error(`[BaseDAL] GetItem error for ${this.tableName}:`, error);
            throw error;
        }
    }

    async putItem(item) {
        try {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: item
            });
            await this.docClient.send(command);
            return item;
        } catch (error) {
            logger.error(`[BaseDAL] PutItem error for ${this.tableName}:`, error);
            throw error;
        }
    }

    async updateItem(key, updateData) {
        try {
            const updateExpression = [];
            const expressionAttributeValues = {};
            const expressionAttributeNames = {};

            Object.entries(updateData).forEach(([key, value]) => {
                if (value !== undefined) {
                    const attrKey = `#${key}`;
                    const attrValue = `:${key}`;
                    updateExpression.push(`${attrKey} = ${attrValue}`);
                    expressionAttributeValues[attrValue] = value;
                    expressionAttributeNames[attrKey] = key;
                }
            });

            const params = {
                TableName: this.tableName,
                Key: key,
                UpdateExpression: `SET ${updateExpression.join(', ')}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            };

            console.log(`[DynamoDB] Updating item:`, params);
            const command = new UpdateCommand(params);
            const response = await ddbDocClient.send(command);

            return response.Attributes;
        } catch (err) {
            console.error(`[DynamoDB] UpdateItem error:`, err);
            throw err;
        }
    }

    async deleteItem(key) {
        try {
            const params = {
                TableName: this.tableName,
                Key: key,
                ReturnValues: 'ALL_OLD'
            };

            console.log(`[DynamoDB] Deleting item with key:`, key);
            const command = new DeleteCommand(params);
            const response = await ddbDocClient.send(command);

            return response.Attributes;
        } catch (err) {
            console.error(`[DynamoDB] DeleteItem error:`, err);
            throw err;
        }
    }

    async queryItems(keyCondition, filterExpression = null) {
        try {
            const params = {
                TableName: this.tableName,
                KeyConditionExpression: keyCondition.expression,
                ExpressionAttributeValues: keyCondition.values,
                ConsistentRead: true
            };

            if (filterExpression) {
                params.FilterExpression = filterExpression.expression;
                params.ExpressionAttributeValues = {
                    ...params.ExpressionAttributeValues,
                    ...filterExpression.values
                };
            }

            console.log(`[DynamoDB] Querying items:`, params);
            const command = new QueryCommand(params);
            const response = await ddbDocClient.send(command);

            return response.Items || [];
        } catch (err) {
            console.error(`[DynamoDB] Query error:`, err);
            throw err;
        }
    }
}

module.exports = BaseDAL;
