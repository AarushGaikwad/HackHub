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

const URGENCY_THRESHOLD_DAYS = 3;

export function getRegistrationUrgency(registrationDeadline) {
  if (!registrationDeadline) return null;

  const now = new Date();
  const deadline = new Date(registrationDeadline);
  if (now >= deadline) return null;

  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.ceil((deadline - now) / dayMs);
  if (days > URGENCY_THRESHOLD_DAYS) return null;

  if (days <= 0) return 'Registration closes today';
  if (days === 1) return 'Registration closes tomorrow';
  return `Registration closes in ${days} days`;
}

export function getRelativeTimeAgo(dateStr) {
  if (!dateStr) return null;
  const diffMs = new Date() - new Date(dateStr);
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}