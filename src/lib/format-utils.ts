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

export function format(date: Date, formatStr: string): string {
  const pad = (num: number, size: number = 2): string => {
    let s = num.toString();
    while (s.length < size) s = "0" + s;
    return s;
  };

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours24 >= 12 ? "PM" : "AM";

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthNamesShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const tokens: Record<string, string> = {
    yyyy: year.toString(),
    yy: year.toString().slice(-2),
    MMMM: monthNames[month - 1],
    MMM: monthNamesShort[month - 1],
    MM: pad(month),
    M: month.toString(),
    dd: pad(day),
    d: day.toString(),
    EEEE: dayNames[date.getDay()],
    EEE: dayNamesShort[date.getDay()],
    HH: pad(hours24),
    H: hours24.toString(),
    hh: pad(hours12),
    h: hours12.toString(),
    mm: pad(minutes),
    m: minutes.toString(),
    ss: pad(seconds),
    s: seconds.toString(),
    aa: ampm,
    a: ampm.toLowerCase(),
  };

  // Sort tokens by length (longest first) to avoid partial matches
  const tokenRegex = new RegExp(
    Object.keys(tokens)
      .sort((a, b) => b.length - a.length)
      .join("|"),
    "g"
  );

  return formatStr.replace(tokenRegex, (match) => tokens[match] || match);
}
