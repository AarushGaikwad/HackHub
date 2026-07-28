import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Building, Users, Trophy, ExternalLink } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getHackathonById } from '../../api/participantApi';
import api from '../../api/axiosConfig';

const InfoCard = ({ icon: Icon, label, value, color = 'var(--brand)' }) => (
    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} color={color} />
        </div>
        <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>{value}</div>
        </div>
    </div>
);

const HackathonDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [hackathon, setHackathon] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const [hRes, tRes] = await Promise.all([
                    getHackathonById(id),
                    api.get(`/hackathon/${id}/registered-teams`).catch(() => ({ data: { data: [] } })),
                ]);
                setHackathon(hRes.data.data);
                setTeams(tRes.data.data || []);
            } catch { setError('Failed to load hackathon details.'); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const getStatus = (h) => {
        const now = new Date();
        if (new Date(h.endDate) < now) return 'ENDED';
        if (new Date(h.startDate) > now) return 'UPCOMING';
        return 'ACTIVE';
    };

    if (loading) return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}><Navbar /><LoadingSpinner /></div>;

    if (error || !hackathon) return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
            <Navbar />
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>
                <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: '10px', padding: '16px', fontSize: '14px' }}>
                    {error || 'Hackathon not found.'}
                </div>
            </div>
        </div>
    );

    const status = getStatus(hackathon);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
            <Navbar />
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

                {/* Back */}
                <button onClick={() => navigate('/participant/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '28px', padding: '0' }}>
                    <ArrowLeft size={15} /> Back to Dashboard
                </button>

                {/* Hero */}
                <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <div style={{ marginBottom: '10px' }}><StatusBadge status={status} /></div>
                            <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '8px' }}>{hackathon.title}</h1>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '680px' }}>{hackathon.description}</p>
                        </div>
                    </div>

                    {/* Info cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '24px' }}>
                        <InfoCard icon={Building} label="Organization" value={hackathon.organizationName} color="#4F46E5" />
                        <InfoCard icon={Trophy} label="Organizer" value={hackathon.organizerName} color="#0891B2" />
                        <InfoCard icon={Calendar} label="Start Date" value={new Date(hackathon.startDate).toLocaleDateString()} color="#D97706" />
                        <InfoCard icon={Calendar} label="End Date" value={new Date(hackathon.endDate).toLocaleDateString()} color="#DC2626" />
                    </div>
                </div>

                {/* Success / Error messages */}
                {successMsg && (
                    <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>
                        ✓ {successMsg}
                    </div>
                )}
                {error && (
                    <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

                    {/* Left — Rules */}
                    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px', letterSpacing: '-0.2px' }}>Rules & Guidelines</h2>
                        {hackathon.rules ? (
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{hackathon.rules}</p>
                        ) : (
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No rules specified.</p>
                        )}

                        {/* Max team size */}
                        {hackathon.maxTeamSize && (
                            <div style={{ marginTop: '20px', padding: '14px', backgroundColor: 'var(--brand-bg)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Users size={16} color="var(--brand)" />
                                <span style={{ fontSize: '13px', color: 'var(--brand)', fontWeight: '600' }}>
                                    Max team size: {hackathon.maxTeamSize} members
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right — Registered teams */}
                    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px', letterSpacing: '-0.2px' }}>
                            Registered Teams
                            <span style={{ marginLeft: '8px', backgroundColor: 'var(--brand-bg)', color: 'var(--brand)', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>
                                {teams.length}
                            </span>
                        </h2>

                        {teams.length === 0 ? (
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No teams registered yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {teams.map(t => (
                                    <div key={t.id} style={{ padding: '12px 14px', backgroundColor: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '3px' }}>{t.teamName}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            Led by {t.leaderName} · {t.memberCount} member{t.memberCount !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HackathonDetailPage;