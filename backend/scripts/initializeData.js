const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000",
    credentials: {
        accessKeyId: "dummy",
        secretAccessKey: "dummy"
    }
});

const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTIONS_TABLE = 'ProductionTable';

const createTable = async () => {
    const params = {
        TableName: PRODUCTIONS_TABLE,
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

    try {
        await client.send(new CreateTableCommand(params));
        console.log("Table created successfully");
    } catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log("Table already exists");
        } else {
            throw error;
        }
    }
};

const insertSampleData = async () => {
    const sampleData = [
        {
            pk: "1_1",
            sk: "012024",
            c1: 100,
            c2: 200,
            c3: 300,
            c4: 400,
            c5: 500
        }
    ];

    for (const item of sampleData) {
        const params = {
            TableName: PRODUCTIONS_TABLE,
            Item: item
        };

        await docClient.send(new PutCommand(params));
        console.log("Inserted item:", item);
    }
};

const initialize = async () => {
    try {
        await createTable();
        await insertSampleData();
        console.log("Initialization complete");
    } catch (error) {
        console.error("Initialization failed:", error);
    }
};

initialize();