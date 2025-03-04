const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'local',
  ...(process.env.IS_OFFLINE && {
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy'
    }
  })
});

// Create document client
const docClient = DynamoDBDocumentClient.from(client);

module.exports = docClient;