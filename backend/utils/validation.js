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

module.exports = {
    validateNumber,
    validateRequired
};