const validateSite = (req, res, next) => {
    const { name, location, type } = req.body;

    if (!name || !location || !type) {
        return res.status(400).json({
            error: 'Validation error',
            details: 'Name, location, and type are required fields'
        });
    }

    // Additional validation rules
    if (req.body.capacity_MW && isNaN(parseFloat(req.body.capacity_MW))) {
        return res.status(400).json({
            error: 'Validation error',
            details: 'Capacity must be a valid number'
        });
    }

    if (req.body.annualProduction_L && isNaN(parseFloat(req.body.annualProduction_L))) {
        return res.status(400).json({
            error: 'Validation error',
            details: 'Annual production must be a valid number'
        });
    }

    next();
};

module.exports = validateSite;