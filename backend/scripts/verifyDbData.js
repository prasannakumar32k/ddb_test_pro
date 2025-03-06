const { DynamoDBClient, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

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

async function verifyDatabase() {
    try {
        console.log('\nVerifying DynamoDB Local Data');
        console.log('============================');

        // List tables
        const { TableNames } = await client.send(new ListTablesCommand({}));
        console.log('Available tables:', TableNames);

        // Check each table
        for (const tableName of TableNames) {
            console.log(`\nChecking table: ${tableName}`);
            
            const command = new ScanCommand({
                TableName: tableName,
                ConsistentRead: true
            });
            
            const response = await ddbDocClient.send(command);
            const items = response.Items || [];
            
            console.log(`Found ${items.length} items in ${tableName}`);
            if (items.length > 0) {
                console.log('Sample items:');
                items.forEach((item, index) => {
                    console.log(`\nItem ${index + 1}:`);
                    console.log(JSON.stringify(item, null, 2));
                });
            }
        }
    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyDatabase();