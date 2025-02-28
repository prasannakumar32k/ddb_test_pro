require('dotenv').config();
const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const { DynamoDBClient, ListTablesCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
const productionSiteRoutes = require('./productionSite/productionSiteRoutes');
const productionRoutes = require('./productions/productionRoutes');
const { checkConnection } = require('./utils/dbConnection');
const app = express();
const port = process.env.PORT || 3333;

// Configure DynamoDB Client using SDK v3
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

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false // Changed to false
}));

app.use(express.json());

// Add more detailed logging
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] Completed ${req.method} ${req.url} with status ${res.statusCode} in ${duration}ms`);
    });

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add this before your routes
=======
const { DynamoDBClient, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const productionSiteRoutes = require('./productionSite/productionSiteRoutes');
const productionRoutes = require('./productions/productionRoutes');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3333;

// Configure DynamoDB
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-west-2',
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
    }
});

const docClient = DynamoDBDocumentClient.from(client);

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/production-site', productionSiteRoutes); // Changed from /api/production-units
app.use('/api/production-unit', productionRoutes);     // Changed from /api/productions

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
    });
});

// DB connection test endpoint
>>>>>>> fbc1dea (Initial commit: Production site management application)
app.get('/api/test-db', async (req, res) => {
    try {
        const command = new ListTablesCommand({});
        const response = await client.send(command);
        res.json({
            status: 'connected',
            tables: response.TableNames,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
<<<<<<< HEAD
=======
        logger.error('Database connection test failed:', error);
>>>>>>> fbc1dea (Initial commit: Production site management application)
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

<<<<<<< HEAD
// Routes with proper prefixes
app.use('/api/units', productionSiteRoutes);
app.use('/api/productions', productionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path
    });
});

async function verifyDynamoDBConnection() {
    try {
        const command = new DescribeTableCommand({
            TableName: "ProductionTable"
        });
        await client.send(command);
        console.log('Successfully connected to DynamoDB');
        return true;
    } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
            console.error('Table does not exist. Please run the initialization script first.');
        } else {
            console.error('Failed to connect to DynamoDB:', error);
        }
=======
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use(errorHandler);

// Verify DynamoDB connection
async function verifyDynamoDBConnection() {
    try {
        const command = new ListTablesCommand({});
        const { TableNames: tables = [] } = await client.send(command);
        
        logger.info('[DynamoDB] Available tables:', tables);
        
        const requiredTables = [
            'ProductionSiteTable',
            'ProductionTable',
            'ConsumptionSiteTable',
            'ConsumptionTable'
        ];
        
        const missingTables = requiredTables.filter(table => !tables.includes(table));
        
        if (missingTables.length > 0) {
            logger.warn('[DynamoDB] Missing tables:', missingTables);
            return false;
        }
        
        return true;
    } catch (error) {
        logger.error('[DynamoDB] Connection error:', error);
>>>>>>> fbc1dea (Initial commit: Production site management application)
        return false;
    }
}

<<<<<<< HEAD
async function startServer() {
    try {
        const isDynamoDBConnected = await verifyDynamoDBConnection();
        
        if (!isDynamoDBConnected) {
            console.error('Could not connect to DynamoDB. Please ensure:');
            console.error('1. DynamoDB Local is running');
            console.error('2. The table has been created (run: npm run create-table)');
            process.exit(1);
        }

        const PORT = process.env.PORT || 3333;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
=======
// Start server
async function startServer() {
    try {
        const isDynamoDBConnected = await verifyDynamoDBConnection();

        if (!isDynamoDBConnected) {
            logger.error(`
⚠️  DynamoDB setup incomplete. Please ensure:
1. DynamoDB Local is running (port 8000)
2. All required tables exist
3. Run: npm run setup to create missing tables
            `);
            return;
        }

        app.listen(port, () => {
            logger.info(`
🚀 Server running on port ${port}
📁 DynamoDB endpoint: ${process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'}
            `);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
>>>>>>> fbc1dea (Initial commit: Production site management application)
        process.exit(1);
    }
}

<<<<<<< HEAD
startServer();
=======
// Handle uncaught errors
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

startServer();

module.exports = app;
>>>>>>> fbc1dea (Initial commit: Production site management application)
