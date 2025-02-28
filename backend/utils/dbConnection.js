const { DynamoDBClient, ListTablesCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

// DynamoDB Local configuration
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

// Create DocumentClient for easier data handling
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Function to verify table contents
async function verifyTableContents(tableName) {
    try {
        const params = {
            TableName: tableName,
            ConsistentRead: true
        };
        
        const command = new ScanCommand(params);
        const response = await ddbDocClient.send(command);
        
        console.log(`[DynamoDB] Table ${tableName} contains ${response.Items?.length || 0} items`);
        if (response.Items && response.Items.length > 0) {
            console.log('[DynamoDB] Sample item:', JSON.stringify(response.Items[0], null, 2));
        }
        
        return response.Items || [];
    } catch (err) {
        console.error(`[DynamoDB] Error scanning table ${tableName}:`, err);
        return [];
    }
}

async function checkConnection() {
    try {
        // List available tables
        const listCommand = new ListTablesCommand({});
        const { TableNames = [] } = await client.send(listCommand);
        
        if (TableNames.length === 0) {
            console.error('[DynamoDB] No tables found in DynamoDB Local');
            return false;
        }

        console.log('[DynamoDB] Available tables:', TableNames);

        // Check each table's structure and contents
        for (const tableName of TableNames) {
            // Get table description
            const describeCommand = new DescribeTableCommand({ TableName: tableName });
            const tableInfo = await client.send(describeCommand);
            
            console.log(`\n[DynamoDB] Table: ${tableName}`);
            console.log('[DynamoDB] Key Schema:', JSON.stringify(tableInfo.Table.KeySchema, null, 2));
            
            // Check table contents
            const items = await verifyTableContents(tableName);
            console.log(`[DynamoDB] ${tableName} has ${items.length} items`);
        }

        return true;
    } catch (err) {
        console.error('[DynamoDB] Connection check failed:', err);
        return false;
    }
}

// Export configured clients and utilities
module.exports = {
    client,
    ddbDocClient,
    checkConnection,
    verifyTableContents
};