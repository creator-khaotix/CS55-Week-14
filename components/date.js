/**
 * DATE COMPONENT (date.js)
 * 
 * Purpose: This component formats and displays dates in a consistent, readable format
 * throughout the application. It handles the conversion from WordPress date format
 * to a human-readable display format.
 * 
 * Key Features:
 * - Converts WordPress date format ("YYYY-MM-DD HH:MM:SS") to ISO-8601 format
 * - Formats dates as "Month Day, Year" (e.g., "November 5, 2025")
 * - Uses semantic HTML <time> element with datetime attribute for accessibility
 * - Utilizes date-fns library for reliable date parsing and formatting
 * 
 * Example Usage:
 * <Date dateString="2025-11-05 09:19:03" />
 * 
 * Renders as:
 * <time datetime="2025-11-05T09:19:03">November 5, 2025</time>
 */

// Import date utility functions from date-fns library
import { parseISO, format } from 'date-fns';
 
/**
 * Date - Format and display a date string or year
 * 
 * This component handles multiple date formats from various sources:
 * - Full WordPress dates: "2025-11-05 09:19:03" → "November 5, 2025"
 * - ISO dates: "2025-11-05" → "November 5, 2025"
 * - Years only: "2004" or 2004 → "2004"
 * 
 * @param {object} props - Component props
 * @param {string|number} props.dateString - Date string or year from API
 * @returns {JSX.Element} Formatted time element with readable date
 */
export default function Date({ dateString }) {
  // Convert to string if it's a number
  const dateStr = String(dateString);
  
  // Check if it's just a year (4 digits)
  if (/^\d{4}$/.test(dateStr)) {
    // Just display the year
    return <time dateTime={dateStr}>{dateStr}</time>;
  }
  
  // Handle full date strings
  // Convert WordPress date format to ISO-8601 format by replacing space with 'T'
  // WordPress returns: "2025-11-05 09:19:03"
  // ISO-8601 needs:    "2025-11-05T09:19:03"
  const isoDateString = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
  
  // Parse the ISO date string into a JavaScript Date object
  const date = parseISO(isoDateString);
  
  // Return semantic HTML time element with machine-readable datetime attribute
  // and human-readable formatted date display
  // Format pattern 'LLLL d, yyyy' produces: "November 5, 2025"
  return <time dateTime={isoDateString}>{format(date, 'LLLL d, yyyy')}</time>;
}
