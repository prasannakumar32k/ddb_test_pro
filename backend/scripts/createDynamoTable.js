const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000",
    credentials: {
        accessKeyId: "dummy",
        secretAccessKey: "dummy"
    }
});

const tableParams = {
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
};

async function createTable() {
    try {
        // Check if table exists
        const listCommand = new ListTablesCommand({});
        const { TableNames } = await client.send(listCommand);
        
        if (TableNames.includes(tableParams.TableName)) {
            console.log(`Table ${tableParams.TableName} already exists`);
            return;
        }

        // Create table
        const command = new CreateTableCommand(tableParams);
        const response = await client.send(command);
        console.log("Table created successfully:", response);
    } catch (error) {
        console.error("Error creating table:", error);
        throw error;
    }
}

createTable()
    .then(() => console.log("Table creation process completed"))
    .catch(console.error);