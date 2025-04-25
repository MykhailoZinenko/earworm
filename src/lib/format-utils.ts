/**
 * Format a duration in milliseconds to a human-readable string (mm:ss)
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, "0")}`;
}

/**
 * Format a large number with appropriate suffixes (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

/**
 * Format a date string into a readable format
 */
export function formatDate(
  dateStr: string,
  includeYear: boolean = true
): string {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return "Unknown date";
  }

  // Different formats based on precision in the string
  if (dateStr.length === 4) {
    // Only year
    return dateStr;
  } else if (dateStr.length === 7) {
    // Year and month
    const options: Intl.DateTimeFormatOptions = {
      year: includeYear ? "numeric" : undefined,
      month: "long",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  } else {
    // Full date
    const options: Intl.DateTimeFormatOptions = {
      year: includeYear ? "numeric" : undefined,
      month: "long",
      day: "numeric",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }
}
