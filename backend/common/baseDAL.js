<<<<<<< HEAD
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
=======
const AWS = require('aws-sdk');

class BaseDAL {
    constructor(tableName) {
        if (!tableName) {
            throw new Error('Table name is required');
        }

        this.tableName = tableName;

        // Configure AWS
        AWS.config.update({
            region: process.env.AWS_REGION || 'us-west-2',
            endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
        });

        this.docClient = new AWS.DynamoDB.DocumentClient();
>>>>>>> fbc1dea (Initial commit: Production site management application)
    }

    async scanTable() {
        try {
            const params = {
                TableName: this.tableName,
                ConsistentRead: true
            };

            console.log(`[DynamoDB] Scanning table: ${this.tableName}`);
<<<<<<< HEAD
            const command = new ScanCommand(params);
            const response = await ddbDocClient.send(command);
=======
            const response = await this.docClient.scan(params).promise();
>>>>>>> fbc1dea (Initial commit: Production site management application)

            console.log(`[DynamoDB] Found ${response.Items?.length || 0} items`);
            return response.Items || [];
        } catch (err) {
            console.error(`[DynamoDB] Scan error:`, err);
            throw err;
        }
    }

    async getItem(key) {
        try {
            const params = {
                TableName: this.tableName,
                Key: key,
                ConsistentRead: true
            };

            console.log(`[DynamoDB] Getting item with key:`, key);
<<<<<<< HEAD
            const command = new GetCommand(params);
            const response = await ddbDocClient.send(command);
=======
            const response = await this.docClient.get(params).promise();
>>>>>>> fbc1dea (Initial commit: Production site management application)

            return response.Item || null;
        } catch (err) {
            console.error(`[DynamoDB] GetItem error:`, err);
            throw err;
        }
    }

    async putItem(item) {
<<<<<<< HEAD
        try {
            const params = {
                TableName: this.tableName,
                Item: item,
                ReturnValues: 'ALL_OLD'
            };

            console.log(`[DynamoDB] Putting item:`, item);
            const command = new PutCommand(params);
            const response = await ddbDocClient.send(command);

            return item;
        } catch (err) {
            console.error(`[DynamoDB] PutItem error:`, err);
            throw err;
        }
=======
        const params = {
            TableName: this.tableName,
            Item: item
        };

        return this.docClient.put(params).promise();
>>>>>>> fbc1dea (Initial commit: Production site management application)
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
<<<<<<< HEAD
            const command = new UpdateCommand(params);
            const response = await ddbDocClient.send(command);
=======
            const response = await this.docClient.update(params).promise();
>>>>>>> fbc1dea (Initial commit: Production site management application)

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
<<<<<<< HEAD
            const command = new DeleteCommand(params);
            const response = await ddbDocClient.send(command);
=======
            const response = await this.docClient.delete(params).promise();
>>>>>>> fbc1dea (Initial commit: Production site management application)

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
<<<<<<< HEAD
            const command = new QueryCommand(params);
            const response = await ddbDocClient.send(command);
=======
            const response = await this.docClient.query(params).promise();
>>>>>>> fbc1dea (Initial commit: Production site management application)

            return response.Items || [];
        } catch (err) {
            console.error(`[DynamoDB] Query error:`, err);
            throw err;
        }
    }
}

module.exports = BaseDAL;
