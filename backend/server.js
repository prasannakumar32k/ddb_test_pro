require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const port = process.env.PORT || 3333;

// Configure DynamoDB
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'local',
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
    }
});

const docClient = DynamoDBDocumentClient.from(client);
global.dynamoDb = docClient;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
const productionSiteRoutes = require('./productionSite/productionSiteRoutes');
const productionRoutes = require('./productions/productionRoutes');

app.use('/api/production-site', productionSiteRoutes);
app.use('/api/production-unit', productionRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    const statusCode = err.statusCode || 500;
    const errorResponse = {
        error: err.status || 'Internal server error',
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred'
            : err.message
    };
    res.status(statusCode).json(errorResponse);
});

// Start server
const server = app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received. Closing HTTP server...');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;