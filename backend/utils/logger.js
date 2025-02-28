const winston = require('winston');
const path = require('path');

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
    })
);

// Custom format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

// Define log directory
const logDir = path.join(__dirname, '../logs');

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // Error log file transport
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Combined log file transport
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ],
    // Handle exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
            format: fileFormat
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
            format: fileFormat
        })
    ]
});

// Add request logger method
logger.logRequest = (req) => {
    logger.info(`${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        body: req.body,
        ip: req.ip
    });
};

// Add response logger method
logger.logResponse = (req, res, responseTime) => {
    logger.info(`${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`, {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime
    });
};

// Add error logger method
logger.logError = (error, req = null) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    };

    if (req) {
        errorLog.method = req.method;
        errorLog.url = req.url;
        errorLog.params = req.params;
        errorLog.query = req.query;
        errorLog.body = req.body;
    }

    logger.error('Error occurred', errorLog);
};

module.exports = logger;