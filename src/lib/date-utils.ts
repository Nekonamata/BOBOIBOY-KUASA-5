/**
 * Utility functions for safe date handling to prevent RangeError: Invalid time value
 */

/**
 * Safely parse a date string and return a Date object or null if invalid
 */
export const safeDateParse = (dateString: string | null | undefined): Date | null => {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  try {
    // Try to parse as ISO string first
    if (dateString.includes('T') || /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try to parse as locale date string
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  } catch (error) {
    console.warn('Failed to parse date:', dateString, error);
    return null;
  }
};

/**
 * Safely format a date to locale string with fallback
 */
export const safeDateFormat = (
  dateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = 'Tanggal tidak valid'
): string => {
  const date = safeDateParse(dateString);
  if (!date) {
    return fallback;
  }

  try {
    return date.toLocaleDateString('id-ID', options);
  } catch (error) {
    console.warn('Failed to format date:', dateString, error);
    return fallback;
  }
};

/**
 * Safely format a date to locale date string with weekday
 */
export const safeDateFormatWithWeekday = (
  dateString: string | null | undefined,
  fallback: string = 'Tanggal tidak valid'
): string => {
  return safeDateFormat(
    dateString,
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    fallback
  );
};

/**
 * Safely format a date to locale date string without weekday
 */
export const safeDateFormatSimple = (
  dateString: string | null | undefined,
  fallback: string = 'Tanggal tidak valid'
): string => {
  return safeDateFormat(
    dateString,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    fallback
  );
};

/**
 * Safely format a date to locale string (date and time)
 */
export const safeDateTimeFormat = (
  dateString: string | null | undefined,
  fallback: string = 'Waktu tidak valid'
): string => {
  const date = safeDateParse(dateString);
  if (!date) {
    return fallback;
  }

  try {
    return date.toLocaleString('id-ID');
  } catch (error) {
    console.warn('Failed to format datetime:', dateString, error);
    return fallback;
  }
};

/**
 * Check if a date string is valid
 */
export const isValidDateString = (dateString: string | null | undefined): boolean => {
  return safeDateParse(dateString) !== null;
};
