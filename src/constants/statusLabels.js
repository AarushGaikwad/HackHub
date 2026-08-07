// Maps backend status values to the label shown to users. Keeps the raw
// enum value (used for filtering, API calls, Badge color lookup) separate
// from what's displayed — e.g. DRAFT is shown as "Upcoming" without
// changing what gets sent to /hackathon/filter?status=.
export const HACKATHON_STATUS_LABELS = {
  ACTIVE: 'Active',
  DRAFT: 'Upcoming',
  ENDED: 'Ended',
};

export function getStatusLabel(status) {
  if (!status) return status;
  return HACKATHON_STATUS_LABELS[status.toUpperCase()] || status;
}