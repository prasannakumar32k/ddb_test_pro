const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    try {
        logger.logRequest(req);

        // Log response
        const originalEnd = res.end;
        res.end = function (...args) {
            logger.logResponse(req, res);
            originalEnd.apply(res, args);
        };

        next();
    } catch (error) {
        logger.logError(error, req);
        next();
    }
};

module.exports = requestLogger;