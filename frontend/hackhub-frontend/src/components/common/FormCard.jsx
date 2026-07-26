const FormCard = ({ children, maxWidth = '480px' }) => (
    <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
    }}>
        <div style={{
            width: '100%',
            maxWidth,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
            {children}
        </div>
    </div>
);

export default FormCard;