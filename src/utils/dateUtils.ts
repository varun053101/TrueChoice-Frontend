import { format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kolkata';

/**
 * Formats a date string or Date object to the specified timezone (Asia/Kolkata).
 * Default format: 'PP pp' (e.g. Apr 29, 2024 5:30 PM)
 * Use this for DISPLAYING dates to the user.
 */
export const formatDate = (date: string | Date, formatStr: string = 'PP pp'): string => {
    if (!date) return 'Invalid Date';

    try {
        // Treat the input date as UTC if it's a string ending in Z or if it's a standard ISO string from backend
        // date-fns-tz toZonedTime handles conversion from local/UTC to target zone
        const zonedDate = toZonedTime(date, TIMEZONE);
        return format(zonedDate, formatStr);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

/**
 * Returns the current date in the target timezone
 */
export const getNow = (): Date => {
    return toZonedTime(new Date(), TIMEZONE);
};

/**
 * Formats a date for use in datetime-local input (value attribute).
 * Converts UTC timestamp -> IST time -> "YYYY-MM-DDThh:mm" string.
 * Use this when INITIALIZING form inputs from backend data.
 */
export const formatForInput = (date: string | Date | undefined | null): string => {
    if (!date) return '';
    try {
        const zonedDate = toZonedTime(date, TIMEZONE);
        return format(zonedDate, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
        console.error('Error formatting date for input:', error);
        return '';
    }
};

/**
 * Converts a datetime-local input string (treated as IST) to a UTC ISO string.
 * Input: "2025-12-06T22:44" (User accepted this as IST)
 * Output: "2025-12-06T17:14:00.000Z" (The actual UTC moment)
 * Use this when SENDING form data to backend.
 */
export const dateInputToUTC = (inputString: string): string => {
    if (!inputString) return '';
    try {
        // Treat inputString as being in Asia/Kolkata
        // fromZonedTime converts that time in that zone to a UTC Date
        const utcDate = fromZonedTime(inputString, TIMEZONE);
        return utcDate.toISOString();
    } catch (error) {
        console.error('Error converting input to UTC:', error);
        return '';
    }
};
