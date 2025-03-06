export const handleError = (error, defaultMessage = 'An error occurred') => {
    console.error('[API Error]', error);

    if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || defaultMessage;
        return new Error(message);
    }

    if (error.request) {
        // Request was made but no response
        return new Error('No response from server');
    }

    // Something else went wrong
    return new Error(error.message || defaultMessage);
};