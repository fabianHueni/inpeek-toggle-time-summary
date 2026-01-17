/**
 * Date Utility Functions
 *
 * Handles date calculations for determining last calendar week (Monday-Sunday)
 * based on local timezone.
 */

export interface DateRange {
  start: string; // YYYY-MM-DD format
  end: string;   // YYYY-MM-DD format
}

/**
 * Formats a Date object to YYYY-MM-DD string in local timezone
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object to Swiss date format (DD.MM.YYYY)
 */
export function formatDateSwiss(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}.${month}.${year}`;
}

/**
 * Converts YYYY-MM-DD to Swiss format (DD.MM.YYYY)
 */
export function toSwissFormat(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return formatDateSwiss(date);
}

/**
 * Gets the date range for last calendar week (Monday to Sunday)
 * @returns DateRange object with start (Monday) and end (Sunday) dates
 */
export function getLastCalendarWeek(): DateRange {
  const today = new Date();

  // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDayOfWeek = today.getDay();

  // Calculate days to subtract to get to last Monday
  // If today is Sunday (0), we go back 6 days to get last Monday
  // If today is Monday (1), we go back 7 days to get last Monday
  // If today is Tuesday (2), we go back 8 days to get last Monday, etc.
  const daysToLastMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek + 6;

  // Calculate last Monday
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysToLastMonday);
  lastMonday.setHours(0, 0, 0, 0);

  // Calculate last Sunday (6 days after last Monday)
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);

  return {
    start: formatDate(lastMonday),
    end: formatDate(lastSunday),
  };
}

/**
 * Extracts the date (YYYY-MM-DD) from an ISO 8601 datetime string
 * Converts to local timezone before extracting the date
 */
export function extractDate(isoDatetime: string): string {
  const date = new Date(isoDatetime);
  return formatDate(date);
}

/**
 * Gets an array of all dates in the given range (inclusive)
 * @param start - Start date in YYYY-MM-DD format
 * @param end - End date in YYYY-MM-DD format
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');

  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Gets the day name for a given date string
 * @param dateStr - Date in YYYY-MM-DD format
 * @returns Day name (e.g., "Monday", "Tuesday")
 */
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Gets the date range for current calendar week (Monday to Sunday)
 * @returns DateRange object with start (Monday) and end (Sunday) dates
 */
export function getCurrentCalendarWeek(): DateRange {
  const today = new Date();
  const currentDayOfWeek = today.getDay();

  // Calculate days to subtract to get to this Monday
  const daysToThisMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  // Calculate this Monday
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - daysToThisMonday);
  thisMonday.setHours(0, 0, 0, 0);

  // Calculate this Sunday (6 days after this Monday)
  const thisSunday = new Date(thisMonday);
  thisSunday.setDate(thisMonday.getDate() + 6);
  thisSunday.setHours(23, 59, 59, 999);

  return {
    start: formatDate(thisMonday),
    end: formatDate(thisSunday),
  };
}

/**
 * Gets the date range for current month
 * @returns DateRange object with first and last day of current month
 */
export function getCurrentMonth(): DateRange {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    start: formatDate(firstDay),
    end: formatDate(lastDay),
  };
}

/**
 * Gets the date range for last month
 * @returns DateRange object with first and last day of last month
 */
export function getLastMonth(): DateRange {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);

  return {
    start: formatDate(firstDay),
    end: formatDate(lastDay),
  };
}
