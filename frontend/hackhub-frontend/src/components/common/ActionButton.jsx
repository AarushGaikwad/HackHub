const ActionButton = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    fullWidth = false,
}) => {
    const sizes = {
        sm: { padding: '8px 16px', fontSize: '13px' },
        md: { padding: '10px 20px', fontSize: '14px' },
        lg: { padding: '13px 28px', fontSize: '15px' },
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--brand)',
            color: 'white',
            border: 'none',
        },
        secondary: {
            backgroundColor: 'transparent',
            color: 'var(--text)',
            border: '1.5px solid var(--border)',
        },
        danger: {
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger-text)',
            border: '1px solid var(--danger-text)',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--brand)',
            border: 'none',
        },
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                ...variants[variant],
                ...sizes[size],
                borderRadius: '10px',
                fontWeight: '600',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.15s ease',
                width: fullWidth ? '100%' : 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
            }}
        >
            {children}
        </button>
    );
};

export default ActionButton;