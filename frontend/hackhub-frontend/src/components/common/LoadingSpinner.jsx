const LoadingSpinner = ({ text = 'Loading...' }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px',
        gap: '16px',
    }}>
        <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid var(--border)',
            borderTop: '3px solid var(--brand)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
        }}>
            {text}
        </span>
        <style>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export default LoadingSpinner;