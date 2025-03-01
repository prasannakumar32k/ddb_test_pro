const { CreateTableCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const logger = require('../utils/logger');

const client = new DynamoDBClient({
    region: 'local',
    endpoint: 'http://localhost:8000',
    credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy'
    }
});

const tables = [
    {
        TableName: "ProductionSiteTable",
        KeySchema: [
            { AttributeName: "companyId", KeyType: "HASH" },
            { AttributeName: "productionSiteId", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "companyId", AttributeType: "N" },
            { AttributeName: "productionSiteId", AttributeType: "N" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: "ProductionTable",
        KeySchema: [
            { AttributeName: "pk", KeyType: "HASH" },
            { AttributeName: "sk", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "pk", AttributeType: "S" },
            { AttributeName: "sk", AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    }
];

async function setupTables() {
    for (const table of tables) {
        try {
            logger.info(`Creating table: ${table.TableName}`);
            const command = new CreateTableCommand(table);
            await client.send(command);
            logger.info(`Table ${table.TableName} created successfully`);
        } catch (error) {
            if (error.name === 'ResourceInUseException') {
                logger.info(`Table ${table.TableName} already exists`);
            } else {
                logger.error(`Error creating table ${table.TableName}:`, error);
            }
        }
    }
}

setupTables().catch(console.error);