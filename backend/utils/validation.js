const validateNumber = (value, fieldName) => {
    if (value === undefined || value === null) return true;
    const num = parseFloat(value);
    if (isNaN(num)) {
        throw new Error(`${fieldName} must be a valid number`);
    }
    return true;
};

const validateRequired = (value, fieldName) => {
    if (!value) {
        throw new Error(`${fieldName} is required`);
    }
    return true;
};

const validateFields = (data) => {
    const requiredFields = ['pk', 'sk'];
    const numericFields = [
        'c1', 'c2', 'c3', 'c4', 'c5',
        'c001', 'c002', 'c003', 'c004', 'c005',
        'c006', 'c007', 'c008', 'c009', 'c010'
    ];

    // Validate required fields
    requiredFields.forEach(field => {
        if (!data[field]) {
            throw new Error(`${field} is required`);
        }
    });

    // Validate numeric fields
    numericFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null) {
            const num = parseFloat(data[field]);
            if (isNaN(num)) {
                throw new Error(`${field} must be a valid number`);
            }
        }
    });

    return true;
};

const transformProductionData = (item) => {
    // Pick only required fields
    const {
        pk, sk,
        c1, c2, c3, c4, c5,
        c001, c002, c003, c004, c005,
        c006, c007, c008, c009, c010
    } = item;

    // Return transformed data
    return {
        pk,
        sk,
        c1: Number(parseFloat(c1 || 0).toFixed(2)),
        c2: Number(parseFloat(c2 || 0).toFixed(2)),
        c3: Number(parseFloat(c3 || 0).toFixed(2)),
        c4: Number(parseFloat(c4 || 0).toFixed(2)),
        c5: Number(parseFloat(c5 || 0).toFixed(2)),
        c001: Number(parseFloat(c001 || 0).toFixed(2)),
        c002: Number(parseFloat(c002 || 0).toFixed(2)),
        c003: Number(parseFloat(c003 || 0).toFixed(2)),
        c004: Number(parseFloat(c004 || 0).toFixed(2)),
        c005: Number(parseFloat(c005 || 0).toFixed(2)),
        c006: Number(parseFloat(c006 || 0).toFixed(2)),
        c007: Number(parseFloat(c007 || 0).toFixed(2)),
        c008: Number(parseFloat(c008 || 0).toFixed(2)),
        c009: Number(parseFloat(c009 || 0).toFixed(2)),
        c010: Number(parseFloat(c010 || 0).toFixed(2))
    };
};

module.exports = {
    validateNumber,
    validateRequired,
    validateFields,
    transformProductionData
};