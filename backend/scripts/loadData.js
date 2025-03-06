const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { 
    DynamoDBDocumentClient, 
    PutCommand,
    ScanCommand  // Add ScanCommand to imports
} = require("@aws-sdk/lib-dynamodb");

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

const productionSites = [
    {
        companyId: 1,
        productionSiteId: 1,
        name: "Star_Radhapuram_600KW",
        location: "Tirunelveli, Radhapuram",
        type: "Wind",
        banking: 1,
        capacity_MW: 0.6,
        annualProduction_L: 9,
        htscNo: 79204721131,
        injectionVoltage_KV: 33,
        status: "Active"
    },
    {
        companyId: 1,
        productionSiteId: 2,
        name: "DVN_Keelathur_1WM",
        location: "Pudukkottai, Keelathur",
        type: "Solar",
        banking: 0,
        capacity_MW: 1.0,
        annualProduction_L: 18,
        htscNo: 69534460069,
        injectionVoltage_KV: 22,
        status: "Active"
    }
];

const productionData = [
    {
        pk: "1_1",
        sk: "122024",
        c1: 1,
        c2: 2,
        c3: 3,
        c4: 4,
        c5: 5,
        c001: 6,
        c002: 7,
        c003: 8,
        c004: 9,
        c005: 10,
        c006: 11,
        c007: 12,
        c008: 13,
        c009: 14,
        c010: 15
    },
    {
        pk: "1_2",
        sk: "112024",
        c1: 1,
        c2: 2,
        c3: 3,
        c4: 4,
        c5: 5,
        c001: 6,
        c002: 7,
        c003: 8,
        c004: 9,
        c005: 10,
        c006: 11,
        c007: 12,
        c008: 13,
        c009: 14,
        c010: 15
    }
];

async function loadData() {
    try {
        console.log('\nLoading data into DynamoDB Local');
        console.log('================================');

        // Load Production Sites
        console.log('\nLoading Production Sites:');
        for (const site of productionSites) {
            await ddbDocClient.send(new PutCommand({
                TableName: "ProductionSiteTable",
                Item: site
            }));
            console.log(`Added site: ${site.name}`);
        }

        // Load Production Data with ordered fields
        console.log('\nLoading Production Data:');
        for (const data of productionData) {
            // Create ordered item object
            const orderedItem = {
                pk: data.pk,
                sk: data.sk,
                c1: data.c1,
                c2: data.c2,
                c3: data.c3,
                c4: data.c4,
                c5: data.c5,
                c001: data.c001,
                c002: data.c002,
                c003: data.c003,
                c004: data.c004,
                c005: data.c005,
                c006: data.c006,
                c007: data.c007,
                c008: data.c008,
                c009: data.c009,
                c010: data.c010
            };

            await ddbDocClient.send(new PutCommand({
                TableName: "ProductionTable",
                Item: orderedItem
            }));
            console.log(`Added production data for: ${data.pk}, month: ${data.sk}`);
        }

        console.log('\nData loading completed');
        
        // Verify the data order
        await verifyDataOrder();
    } catch (error) {
        console.error('Data loading failed:', error);
    }
}

async function verifyDataOrder() {
    try {
        console.log('\nVerifying data order:');
        const command = new ScanCommand({
            TableName: "ProductionTable",
            ConsistentRead: true
        });
        
        const { Items } = await ddbDocClient.send(command);

        
        // Improve the output formatting
        if (Items && Items.length > 0) {
            console.log('\nProduction Table Items:');
            Items.forEach((item, index) => {
                console.log(`\nItem ${index + 1} (${item.pk}, ${item.sk}):`);
                console.log(JSON.stringify(item, null, 2));
            });
        } else {
            console.log('No items found in ProductionTable');
        }
    } catch (error) {
        console.error('Data order verification failed:', error);
    }
}

loadData();