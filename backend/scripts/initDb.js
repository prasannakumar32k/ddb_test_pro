const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const logger = require('../utils/logger');

const client = new DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000",
    credentials: {
        accessKeyId: "dummy",
        secretAccessKey: "dummy"
    }
});

const docClient = DynamoDBDocumentClient.from(client);

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
    }
];

const sampleData = {
    ProductionSiteTable: [
        {
            companyId: 1,
            productionSiteId: 1,
            name: "Site 1",
            location: "Location 1",
            type: "Wind",
            status: "Active"
        },
        {
            companyId: 1,
            productionSiteId: 2,
            name: "Site 2",
            location: "Location 2",
            type: "Solar",
            status: "Active"
        }
    ]
};

async function initializeDatabase() {
    try {
        // Check existing tables
        const { TableNames } = await client.send(new ListTablesCommand({}));
        logger.info('Existing tables:', TableNames);

        // Create tables
        for (const tableConfig of tables) {
            if (!TableNames.includes(tableConfig.TableName)) {
                logger.info(`Creating table: ${tableConfig.TableName}`);
                await client.send(new CreateTableCommand(tableConfig));
                logger.info(`Table ${tableConfig.TableName} created successfully`);
                
                // Wait for table to be active
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Insert sample data
        for (const [tableName, items] of Object.entries(sampleData)) {
            logger.info(`Inserting sample data into ${tableName}`);
            for (const item of items) {
                await docClient.send(new PutCommand({
                    TableName: tableName,
                    Item: item
                }));
            }
        }

        logger.info('Database initialization completed successfully');
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
}

// Run initialization
if (require.main === module) {
    initializeDatabase()
        .then(() => logger.info('Initialization complete'))
        .catch(error => {
            logger.error('Initialization failed:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };