import { format, parse, isValid } from 'date-fns';

class DateFormatter {
  static toApiFormat(date) {
    if (!date || !isValid(date)) return null;
    return format(date, 'MMyyyy');
  }

  // Add this method that was missing and causing the error
  static formatToSK(date) {
    return this.toApiFormat(date);
  }

  static fromApiFormat(dateString) {
    if (!dateString || typeof dateString !== 'string') return new Date();
    try {
      const parsedDate = parse(dateString, 'MMyyyy', new Date());
      return isValid(parsedDate) ? parsedDate : new Date();
    } catch (error) {
      console.error('Date parsing error:', error);
      return new Date();
    }
  }

  static formatMonthYear(dateString) {
    const date = this.fromApiFormat(dateString);
    return format(date, 'MMMM yyyy');
  }
}

export default DateFormatter;