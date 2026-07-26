const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div style={{
        textAlign: 'center',
        padding: '64px 32px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
    }}>
        {Icon && (
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'var(--brand-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
            }}>
                <Icon size={24} color="var(--brand)" />
            </div>
        )}
        <h3 style={{
            fontSize: '17px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '8px',
        }}>
            {title}
        </h3>
        <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: action ? '24px' : '0',
            lineHeight: '1.6',
        }}>
            {description}
        </p>
        {action && action}
    </div>
);

export default EmptyState;