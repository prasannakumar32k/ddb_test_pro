export const handleError = (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('[Error Handler]', message, error);
    return {
        error: true,
        message
    };
};