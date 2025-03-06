const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'dummy',
  secretAccessKey: 'dummy'
});

const dynamodb = new AWS.DynamoDB();

const tables = [
  {
    TableName: 'ProductionSiteTable',
    KeySchema: [
      { AttributeName: 'companyId', KeyType: 'HASH' },
      { AttributeName: 'productionSiteId', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'companyId', AttributeType: 'N' },
      { AttributeName: 'productionSiteId', AttributeType: 'N' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: 'ProductionTable',
    KeySchema: [
      { AttributeName: 'pk', KeyType: 'HASH' },
      { AttributeName: 'sk', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'pk', AttributeType: 'S' },
      { AttributeName: 'sk', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
];

async function createTables() {
  for (const tableParams of tables) {
    try {
      console.log(`Creating table: ${tableParams.TableName}`);
      await dynamodb.createTable(tableParams).promise();
      console.log(`Table ${tableParams.TableName} created successfully`);
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        console.log(`Table ${tableParams.TableName} already exists`);
      } else {
        console.error(`Error creating table ${tableParams.TableName}:`, error);
      }
    }
  }
}

createTables();