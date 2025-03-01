import { format, parse, isValid } from 'date-fns';

class DateFormatter {
  static monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Convert to display format (e.g., "Jan 2025")
  static formatMonthYear(sk) {
    try {
      if (!sk || typeof sk !== 'string') {
        return 'Invalid Date';
      }

      // Handle both MMYY and MMYYYY formats
      const normalizedSk = sk.length === 4 ? `20${sk}` : sk;

      if (normalizedSk.length !== 6) {
        return 'Invalid Date';
      }

      const month = parseInt(normalizedSk.substring(0, 2)) - 1;
      const year = parseInt('20' + normalizedSk.substring(4, 6));

      return new Date(year, month).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  // Convert Date to API format (MMYYYY)
  static toApiFormat(date) {
    try {
      if (!date || !(date instanceof Date)) {
        return null;
      }
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${month}20${year}`; // Ensure MMYYYY format
    } catch (error) {
      console.error('Error in toApiFormat:', error);
      return null;
    }
  }

  // Parse API format to Date object
  static fromApiFormat(sk) {
    try {
      if (!sk || typeof sk !== 'string') {
        return null;
      }

      // Normalize SK to MMYYYY format
      const normalizedSK = sk.length === 4 ? sk + '20' : sk;

      if (normalizedSK.length !== 6) {
        return null;
      }

      const month = parseInt(normalizedSK.substring(0, 2)) - 1;
      const year = parseInt('20' + normalizedSK.substring(4, 6));
      const date = new Date(year, month);

      return isValid(date) ? date : null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  // Sort dates in descending order
  static sortDatesDesc(a, b) {
    try {
      if (!a?.sk || !b?.sk) return 0;

      const dateA = DateFormatter.fromApiFormat(a.sk);
      const dateB = DateFormatter.fromApiFormat(b.sk);

      if (!dateA || !dateB) return 0;

      return dateB.getTime() - dateA.getTime();
    } catch (error) {
      console.error('Error sorting dates:', error);
      return 0;
    }
  }

  // Convert to display format (e.g., "Jan 2025")
  static toDisplayFormat(date) {
    if (!date || !isValid(date)) return '';
    try {
      const formattedDate = format(date, 'MMM yyyy');
      return formattedDate;
    } catch (error) {
      console.error('Error in toDisplayFormat:', error);
      return '';
    }
  }

  // Format from API format to display format
  static formatForTable(dateStr) {
    try {
      if (!dateStr) return 'Invalid Date';

      const month = parseInt(dateStr.substring(0, 2)) - 1;
      const year = '20' + dateStr.substring(2);

      if (month < 0 || month > 11) return 'Invalid Date';

      return `${this.monthNames[month]} ${year}`;
    } catch (error) {
      console.error('Error in formatForTable:', error);
      return 'Invalid Date';
    }
  }

  // Get current month in API format
  static getCurrentMonthApi() {
    try {
      const now = new Date();
      return this.toApiFormat(now);
    } catch (error) {
      console.error('Error in getCurrentMonthApi:', error);
      return '';
    }
  }

  // Validate date string
  static isValidDate(dateStr) {
    if (!dateStr) return false;
    const date = this.fromApiFormat(dateStr);
    return date !== null && isValid(date);
  }

  static formatForDisplay(date) {
    try {
      if (!date || !isValid(date)) return '';
      return format(date, 'MMM yyyy');
    } catch (error) {
      console.error('Error formatting display date:', error);
      return '';
    }
  }
}

export default DateFormatter;