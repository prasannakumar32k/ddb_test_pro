import { format, parse, isValid } from 'date-fns';

class DateFormatter {
  static monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

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

  // Convert to API format (e.g., "012025")
  static toApiFormat(date) {
    try {
      let parsedDate;
      
      // If date is a string, try to parse it
      if (typeof date === 'string') {
        // Try parsing different formats
        const formats = [
          'yyyy-MM-dd', 
          'MM/dd/yyyy', 
          'dd/MM/yyyy', 
          'yyyy/MM/dd'
        ];
        
        for (let format of formats) {
          parsedDate = parse(date, format, new Date());
          if (isValid(parsedDate)) break;
        }
        
        // If no valid parse found, use current date
        if (!isValid(parsedDate)) {
          console.warn('[DateFormatter] Could not parse date:', date);
          parsedDate = new Date();
        }
      } else if (date instanceof Date) {
        // If already a Date object
        parsedDate = date;
      } else {
        // If not a string or Date, use current date
        console.warn('[DateFormatter] Invalid date type:', date);
        parsedDate = new Date();
      }

      // Ensure we have a valid date
      if (!isValid(parsedDate)) {
        console.warn('[DateFormatter] Invalid date:', parsedDate);
        parsedDate = new Date();
      }

      const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = parsedDate.getFullYear().toString().slice(-2);
      return `${month}${year}`; // Returns format: MMYY (e.g., "0224" for February 2024)
    } catch (error) {
      console.error('[DateFormatter] Error in toApiFormat:', error);
      return null;
    }
  }

  // Parse API format (MMYYYY) to Date
  static fromApiFormat(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') {
      console.warn('Invalid date string in fromApiFormat:', dateStr);
      return null;
    }

    try {
      // Handle both MMYYYY and MMYY formats
      const month = parseInt(dateStr.substring(0, 2)) - 1; // 0-based month
      const yearStr = dateStr.length === 6 ? dateStr.substring(2) : dateStr.substring(2, 4);
      const year = parseInt(`20${yearStr}`);

      if (month < 0 || month > 11 || isNaN(year)) {
        console.warn('Invalid month or year:', month, year);
        return null;
      }

      const date = new Date(year, month, 1);
      return isValid(date) ? date : null;
    } catch (error) {
      console.error('Error in fromApiFormat:', error);
      return null;
    }
  }

  // Sort dates in descending order
  static sortDatesDesc(a, b) {
    try {
      if (!a?.sk || !b?.sk) return 0;
      
      const dateA = new Date(a.sk.substring(0, 2) + '/01/' + '20' + a.sk.substring(2));
      const dateB = new Date(b.sk.substring(0, 2) + '/01/' + '20' + b.sk.substring(2));
      
      return dateB.getTime() - dateA.getTime();
    } catch (error) {
      console.error('Error in sortDatesDesc:', error);
      return 0;
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

// Export only the DateFormatter class
export default DateFormatter;