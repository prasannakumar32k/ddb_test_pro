const { DynamoDBClient, CreateTableCommand, ListTablesCommand, DeleteTableCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// Configure DynamoDB Client
const client = new DynamoDBClient({
    region: "us-west-2",
    endpoint: "http://localhost:8000",
    credentials: {
        accessKeyId: "dummy",
        secretAccessKey: "dummy"
    },
    tls: false,
    forcePathStyle: true
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

// Table definitions
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

// Sample data
const sampleData = {
    ProductionSiteTable: [
        {
            companyId: 1,
            productionSiteId: 1,
            name: "Star_Radhapuram_600KW",
            location: "Tirunelveli, Radhapuram",
            type: "Wind",
            banking: 1,
            capacity_MW: 0.6,
            annualProduction_L: 9,
            htscNo: "79204721131",
            injectionVoltage_KV: 33,
            status: "Active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    ProductionTable: [
        {
            pk: "1_1",
            sk: "112024",
            c1: 1, c2: 2, c3: 3, c4: 4, c5: 5,
            c001: 6, c002: 7, c003: 8, c004: 9, c005: 10,
            c006: 11, c007: 12, c008: 13, c009: 14, c010: 15,
            companyId: 1,
            productionSiteId: 1
        }
    ]
};

// Add this helper function to check if data exists
async function checkExistingData(docClient, tableName) {
    const command = new ScanCommand({
        TableName: tableName,
        Limit: 1
    });
    const result = await docClient.send(command);
    return (result.Items || []).length > 0;
}

// Modify insertData function
async function insertData() {
    for (const [tableName, items] of Object.entries(sampleData)) {
        console.log(`\nPopulating ${tableName}:`);
        const hasExistingData = await checkExistingData(ddbDocClient, tableName);

        if (!hasExistingData) {
            for (const item of items) {
                try {
                    await ddbDocClient.send(new PutCommand({
                        TableName: tableName,
                        Item: item
                    }));
                    console.log(`Added item to ${tableName}:`, JSON.stringify(item, null, 2));
                } catch (error) {
                    console.error(`Error adding item to ${tableName}:`, error);
                }
            }
        } else {
            console.log(`${tableName} already has data, skipping...`);
        }
    }
}

async function deleteExistingTables() {
    try {
        const { TableNames } = await client.send(new ListTablesCommand({}));
        for (const tableName of TableNames) {
            console.log(`Deleting existing table: ${tableName}`);
            await client.send(new DeleteTableCommand({ TableName: tableName }));
            console.log(`Deleted table: ${tableName}`);
        }
        // Wait for tables to be deleted
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
        console.error('Error deleting tables:', error);
    }
}

async function createTables() {
    for (const tableDefinition of tables) {
        try {
            console.log(`Creating table: ${tableDefinition.TableName}`);
            await client.send(new CreateTableCommand(tableDefinition));
            console.log(`Created table: ${tableDefinition.TableName}`);
        } catch (error) {
            if (error.name === 'ResourceInUseException') {
                console.log(`Table ${tableDefinition.TableName} already exists`);
            } else {
                throw error;
            }
        }
    }
    // Wait for tables to be created
    await new Promise(resolve => setTimeout(resolve, 2000));
}

async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');

        // Delete existing tables
        await deleteExistingTables();

        // Create fresh tables
        await createTables();

        // Insert sample data
        await insertData();

        console.log('\nDatabase initialization completed successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

// Run initialization
console.log('DynamoDB Local Data Initialization');
console.log('================================');
initializeDatabase();