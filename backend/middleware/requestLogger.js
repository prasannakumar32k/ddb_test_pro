const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    // Log request
    logger.logRequest(req);

    // Get start time
    const start = Date.now();

    // Log response when finished
    res.on('finish', () => {
        const responseTime = Date.now() - start;
        logger.logResponse(req, res, responseTime);
    });

    next();
};

module.exports = requestLogger;