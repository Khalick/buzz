/**
 * Check if a business is currently open based on its business_hours.
 * Handles the East Africa Time zone (UTC+3).
 */
export function isBusinessOpen(
  businessHours: Record<string, { open: string; close: string; closed?: boolean }> | null | undefined
): boolean {
  if (!businessHours || Object.keys(businessHours).length === 0) return false;

  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[now.getDay()];

  const todayHours = businessHours[today];
  if (!todayHours || todayHours.closed) return false;

  const { open, close } = todayHours;
  if (!open || !close) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTime(open);
  const closeMinutes = parseTime(close);

  if (openMinutes === null || closeMinutes === null) return false;

  // Handle overnight hours (e.g., open 22:00, close 04:00)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Parse a time string like "08:00", "8:00 AM", "17:30" to minutes since midnight.
 */
function parseTime(time: string): number | null {
  if (!time) return null;

  // Handle "HH:MM" format
  const match24 = time.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return parseInt(match24[1]) * 60 + parseInt(match24[2]);
  }

  // Handle "HH:MM AM/PM" format
  const match12 = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1]);
    const minutes = parseInt(match12[2]);
    const period = match12[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Get the today's business hours in a displayable format.
 */
export function getTodayHours(
  businessHours: Record<string, { open: string; close: string; closed?: boolean }> | null | undefined
): string {
  if (!businessHours || Object.keys(businessHours).length === 0) return 'Hours not available';

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];

  const todayHours = businessHours[today];
  if (!todayHours || todayHours.closed) return 'Closed today';

  return `${todayHours.open} – ${todayHours.close}`;
}
