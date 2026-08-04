// Small relative-time helper for hackathon list/detail screens.
// Kept dependency-free (no date-fns/moment) since this is the only place
// that needs it right now.
export function getHackathonTiming(startDate, endDate) {
  if (!startDate && !endDate) return null;

  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const dayMs = 24 * 60 * 60 * 1000;

  if (start && now < start) {
    const days = Math.ceil((start - now) / dayMs);
    if (days <= 0) return 'Starts today';
    if (days === 1) return 'Starts tomorrow';
    return `Starts in ${days} days`;
  }

  if (start && end && now >= start && now <= end) {
    return 'Happening now';
  }

  if (end && now > end) {
    const days = Math.floor((now - end) / dayMs);
    if (days <= 0) return 'Ended today';
    if (days === 1) return 'Ended yesterday';
    return `Ended ${days} days ago`;
  }

  return null;
}