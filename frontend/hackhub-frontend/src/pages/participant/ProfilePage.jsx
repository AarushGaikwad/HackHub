import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Building, Shield, Calendar, Award } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getUserById } from '../../api/participantApi';

const InfoRow = ({ icon: Icon, label, value, color = 'var(--brand)' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={16} color={color} />
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{value || '—'}</div>
        </div>
    </div>
);

const roleColors = { ADMIN: '#DC2626', ORGANIZER: '#0891B2', JUDGE: '#D97706', PARTICIPANT: '#4F46E5' };
const roleDescriptions = {
    ADMIN: 'Full platform access — manage users, hackathons, and system settings.',
    ORGANIZER: 'Create and manage hackathons, track teams, and issue certificates.',
    JUDGE: 'Evaluate submissions and score projects for assigned hackathons.',
    PARTICIPANT: 'Join hackathons, form teams, submit projects, and earn certificates.',
};

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        getUserById(user.userId)
            .then(r => setProfile(r.data.data))
            .catch(() => setError('Failed to load profile.'))
            .finally(() => setLoading(false));
    }, [user]);

    const color = roleColors[user?.role] || 'var(--brand)';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 32px' }}>

                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>My Profile</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Your account details and role information</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>
                        ⚠️ {error}
                    </div>
                )}

                {loading ? <LoadingSpinner /> : profile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Avatar + name card */}
                        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: `${color}18`, border: `3px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '28px', fontWeight: '800', color }}>{profile.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.4px', marginBottom: '6px' }}>{profile.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <span style={{ backgroundColor: `${color}18`, color, padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>
                                        {profile.role}
                                    </span>
                                    <StatusBadge status={profile.status} />
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                                    {roleDescriptions[profile.role] || ''}
                                </p>
                            </div>
                        </div>

                        {/* Info card */}
                        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.2px' }}>Account Information</h3>
                            <div>
                                <InfoRow icon={User} label="Full Name" value={profile.name} color={color} />
                                <InfoRow icon={Mail} label="Email Address" value={profile.email} color="#0891B2" />
                                {profile.designation && <InfoRow icon={Briefcase} label="Occupation" value={profile.designation} color="#D97706" />}
                                {profile.collegeName && <InfoRow icon={Building} label="College" value={profile.collegeName} color="#7C3AED" />}
                                {profile.contactNo && <InfoRow icon={User} label="Contact" value={profile.contactNo} color="#0891B2" />}
                                <InfoRow icon={Shield} label="Role" value={profile.role} color={color} />
                                <InfoRow icon={Award} label="Account Status" value={<StatusBadge status={profile.status} />} color={color} />
                                <InfoRow icon={Calendar} label="Member Since" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} color="var(--text-secondary)" />
                            </div>
                        </div>

                        {/* Pending notice for organizer */}
                        {profile.role === 'ORGANIZER' && profile.status === 'PENDING' && (
                            <div style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-text)', borderRadius: '14px', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span style={{ fontSize: '18px' }}>⏳</span>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--warning-text)', marginBottom: '4px' }}>Approval Pending</div>
                                    <p style={{ fontSize: '13px', color: 'var(--warning-text)', lineHeight: '1.5', opacity: 0.9 }}>
                                        Your organizer account is awaiting admin approval. You'll be able to create hackathons once approved.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;