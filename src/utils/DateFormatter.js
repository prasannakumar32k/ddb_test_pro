import { format, parse } from 'date-fns';

class DateFormatter {
  static monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  static formatDate(sk) {
    if (!sk) return '';

    try {
      const month = parseInt(sk.substring(0, 2));
      const year = parseInt(sk.substring(2));
      const date = new Date(year, month - 1);
      return format(date, 'MMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return sk;
    }
  }

  static formatForTable(sk) {
    if (!sk) return '';

    try {
      const month = parseInt(sk.substring(0, 2));
      const year = parseInt(sk.substring(2));
      const date = new Date(year, month - 1);
      return format(date, 'MMM yyyy');
    } catch (error) {
      console.error('Error formatting date for table:', error);
      return sk;
    }
  }

  static sortDates(a, b) {
    if (!a.sk || !b.sk) return 0;

    const aYear = parseInt(a.sk.substring(2));
    const bYear = parseInt(b.sk.substring(2));
    if (aYear !== bYear) return aYear - bYear;

    const aMonth = parseInt(a.sk.substring(0, 2));
    const bMonth = parseInt(b.sk.substring(0, 2));
    return aMonth - bMonth;
  }

  static parseDate(dateString) {
    try {
      return parse(dateString, 'MMMyyyy', new Date());
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  static formatSK(month, year) {
    return `${String(month).padStart(2, '0')}${year}`;
  }

  static formatMonthYear(sk) {
    try {
      if (!sk || typeof sk !== 'string') {
        return 'Invalid Date';
      }

      const month = parseInt(sk.substring(0, 2)) - 1;
      const year = sk.substring(2); // Already in YYYY format

      if (month < 0 || month > 11) {
        return 'Invalid Date';
      }

      return `${this.monthNames[month]} ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  static getMonthName(month) {
    try {
      const date = new Date(2000, month - 1);
      return format(date, 'MMM');
    } catch (error) {
      console.error('Error getting month name:', error);
      return '';
    }
  }

  static toApiFormat(date) {
    try {
      if (!date || !(date instanceof Date)) {
        return null;
      }
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear());
      return `${month}${year}`; // Returns MMYYYY format
    } catch (error) {
      console.error('Error in toApiFormat:', error);
      return null;
    }
  }
}

export default DateFormatter;
