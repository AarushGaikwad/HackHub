const statusMap = {
    ACTIVE:       { bg: 'var(--success-bg)', text: 'var(--success-text)', label: 'Active' },
    APPROVED:     { bg: 'var(--success-bg)', text: 'var(--success-text)', label: 'Approved' },
    COMPLETED:    { bg: 'var(--success-bg)', text: 'var(--success-text)', label: 'Completed' },
    UPCOMING:     { bg: 'var(--warning-bg)', text: 'var(--warning-text)', label: 'Upcoming' },
    PENDING:      { bg: 'var(--warning-bg)', text: 'var(--warning-text)', label: 'Pending' },
    PROGRESS:     { bg: 'var(--info-bg)',    text: 'var(--info-text)',    label: 'In Progress' },
    REGISTERED:   { bg: 'var(--info-bg)',    text: 'var(--info-text)',    label: 'Registered' },
    ENDED:        { bg: 'var(--danger-bg)',  text: 'var(--danger-text)',  label: 'Ended' },
    REJECTED:     { bg: 'var(--danger-bg)',  text: 'var(--danger-text)',  label: 'Rejected' },
    FINAL:        { bg: 'var(--brand-bg)',   text: 'var(--brand)',        label: 'Final' },
    WINNER:       { bg: 'var(--warning-bg)', text: 'var(--warning-text)', label: 'Winner' },
    FIRST_RUNNER_UP:  { bg: 'var(--info-bg)', text: 'var(--info-text)', label: '1st Runner Up' },
    SECOND_RUNNER_UP: { bg: 'var(--success-bg)', text: 'var(--success-text)', label: '2nd Runner Up' },
    PARTICIPATION:    { bg: 'var(--border)',  text: 'var(--text-secondary)', label: 'Participation' },
};

const StatusBadge = ({ status }) => {
    const config = statusMap[status?.toUpperCase()] || {
        bg: 'var(--border)',
        text: 'var(--text-secondary)',
        label: status,
    };

    return (
        <span style={{
            backgroundColor: config.bg,
            color: config.text,
            padding: '3px 10px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.03em',
            display: 'inline-block',
            whiteSpace: 'nowrap',
        }}>
            {config.label}
        </span>
    );
};

export default StatusBadge;