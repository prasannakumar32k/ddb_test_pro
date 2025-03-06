const errorHandler = (err, req, res, next) => {
    console.error('[ErrorHandler] Error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.message
        });
    }

    if (err.name === 'ConditionalCheckFailedException') {
        return res.status(409).json({
            error: 'Conflict',
            details: 'Data already exists'
        });
    }

    // DynamoDB specific errors
    if (err.name === 'ResourceNotFoundException') {
        return res.status(404).json({
            error: 'Resource not found',
            details: 'The requested resource does not exist'
        });
    }

    // Default error response
    return res.status(500).json({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

module.exports = errorHandler;