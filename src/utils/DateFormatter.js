import { format, parse, isValid } from 'date-fns';

class DateFormatter {
  static monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  static toApiFormat(date) {
    if (!date || !isValid(date)) {
      console.warn('Invalid date provided to toApiFormat:', date);
      return '';
    }

    try {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      return `${month}${year}`;
    } catch (error) {
      console.error('Error in toApiFormat:', error);
      return '';
    }
  }

  static formatForTable(dateStr) {
    if (!dateStr || dateStr.length !== 6) {
      console.warn('Invalid date string in formatForTable:', dateStr);
      return '';
    }

    try {
      const month = parseInt(dateStr.substring(0, 2));
      const year = dateStr.substring(2);
      
      if (month < 1 || month > 12) {
        console.warn('Invalid month number:', month);
        return '';
      }

      return `${this.monthNames[month - 1]} 20${year}`;
    } catch (error) {
      console.error('Error in formatForTable:', error);
      return '';
    }
  }

  static sortDatesDesc(a, b) {
    if (!a?.sk || !b?.sk) return 0;

    try {
      const [monthA, yearA] = [a.sk.substring(0, 2), a.sk.substring(2)];
      const [monthB, yearB] = [b.sk.substring(0, 2), b.sk.substring(2)];
      
      const dateA = new Date(2000 + parseInt(yearA), parseInt(monthA) - 1);
      const dateB = new Date(2000 + parseInt(yearB), parseInt(monthB) - 1);

      return dateB.getTime() - dateA.getTime();
    } catch (error) {
      console.error('Error in sortDatesDesc:', error);
      return 0;
    }
  }
}

export default DateFormatter;