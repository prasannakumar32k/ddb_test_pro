import { format, parse, isValid } from 'date-fns';

class DateFormatter {
  static toApiFormat(date) {
    if (!date || !(date instanceof Date)) return null;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}${year}`;
  }

  static fromApiFormat(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;
    try {
      // Expected format: MMYYYY
      const month = parseInt(dateString.substring(0, 2)) - 1; // 0-based months
      const year = parseInt(dateString.substring(2));
      const date = new Date(year, month, 1);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  static formatToSK(date) {
    return this.toApiFormat(date);
  }

  static formatMonthYear(dateString) {
    const date = this.fromApiFormat(dateString);
    if (!date) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  static toDisplayFormat(date) {
    if (!date || !(date instanceof Date)) return '';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }
}

export default DateFormatter;