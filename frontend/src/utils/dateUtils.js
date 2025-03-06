export const formatMonthYear = (sk) => {
  try {
    if (!sk || typeof sk !== 'string' || sk.length !== 6) {
      return 'Invalid Date';
    }

    const month = parseInt(sk.substring(0, 2));
    const year = parseInt('20' + sk.substring(2));
    
    const date = new Date(year, month - 1);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const parseMonthYear = (dateStr) => {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).substring(2);
  return `${month}${year}`;
};