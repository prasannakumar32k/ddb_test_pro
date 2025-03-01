const logger = {
    info: (message, ...args) => {
        console.log(`[${new Date().toISOString()}] INFO: ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[${new Date().toISOString()}] WARN: ${message}`, ...args);
    },
    debug: (message, ...args) => {
        console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`, ...args);
    },
    // Add request logging
    logRequest: (req) => {
        console.log(`[${new Date().toISOString()}] REQUEST: ${req.method} ${req.url}`);
    },
    // Add response logging
    logResponse: (req, res, time) => {
        console.log(`[${new Date().toISOString()}] RESPONSE: ${req.method} ${req.url} ${res.statusCode} ${time}ms`);
    }
};

module.exports = logger;