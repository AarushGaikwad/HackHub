const PageHeader = ({ title, description, action }) => (
    <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '40px',
    }}>
        <div>
            <h1 style={{
                fontSize: '30px',
                fontWeight: '700',
                color: 'var(--text)',
                letterSpacing: '-0.5px',
                marginBottom: '6px',
            }}>
                {title}
            </h1>
            {description && (
                <p style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                }}>
                    {description}
                </p>
            )}
        </div>
        {action && <div>{action}</div>}
    </div>
);

export default PageHeader;