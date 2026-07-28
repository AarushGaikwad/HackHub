import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axiosConfig';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (_) {}
        logout();
        navigate('/login');
    };

    const getDashboardLink = () => {
        const map = {
            ADMIN: '/admin/dashboard',
            ORGANIZER: '/organizer/dashboard',
            JUDGE: '/judge/dashboard',
            PARTICIPANT: '/participant/dashboard',
        };
        return map[user?.role] || '/';
    };

    return (
        <nav style={{
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            height: '64px',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 32px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                {/* Logo */}
                <Link to={getDashboardLink()} style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--brand)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '15px',
                    }}>H</div>
                    <span style={{
                        color: 'var(--text)',
                        fontWeight: '700',
                        fontSize: '17px',
                        letterSpacing: '-0.3px',
                    }}>HackHub</span>
                </Link>

                {/* Right side */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    {/* Theme toggle */}
                    <button onClick={toggleTheme} style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                    }}>
                        {isDark
                            ? <Sun size={16} />
                            : <Moon size={16} />}
                    </button>

                    {/* User chip */}
                    {user && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 12px',
                            backgroundColor: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                        }}>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--brand-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <User size={13} color="var(--brand)" />
                            </div>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: 'var(--text)',
                                maxWidth: '120px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {user.name}
                            </span>
                        </div>
                    )}

                    {/* Logout */}
                    <button onClick={handleLogout} style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--danger-bg)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--danger-text)',
                    }}>
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;