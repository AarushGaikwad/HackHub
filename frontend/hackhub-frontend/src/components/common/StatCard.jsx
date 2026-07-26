const StatCard = ({ label, value, icon: Icon, color = 'var(--brand)' }) => (
    <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    }}>
        {Icon && (
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: `${color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <Icon size={20} color={color} />
            </div>
        )}
        <div>
            <div style={{
                fontSize: '26px',
                fontWeight: '800',
                color: 'var(--text)',
                letterSpacing: '-0.5px',
                lineHeight: '1',
                marginBottom: '4px',
            }}>
                {value}
            </div>
            <div style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                fontWeight: '500',
            }}>
                {label}
            </div>
        </div>
    </div>
);

export default StatCard;