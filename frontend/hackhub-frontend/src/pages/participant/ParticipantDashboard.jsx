import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, FileText, Award, ChevronRight, Download, Filter } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getAllHackathons, filterHackathons, getMyTeams, getMySubmissions, getMyCertificates, downloadCertificate } from '../../api/participantApi';

const TABS = ['Overview', 'Hackathons', 'My Teams', 'Submissions', 'Certificates'];
const FILTERS = ['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'];

// ── Shared table wrapper ────────────────────────────────────────────────────
const Table = ({ headers, children, empty }) => (
    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: 'var(--bg)' }}>
                    {headers.map(h => (
                        <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
        {empty && <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>{empty}</div>}
    </div>
);

const Tr = ({ children, onClick }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <tr onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{ backgroundColor: hovered ? 'var(--bg)' : 'transparent', cursor: onClick ? 'pointer' : 'default', transition: 'background 0.15s' }}>
            {children}
        </tr>
    );
};

const Td = ({ children, muted }) => (
    <td style={{ padding: '14px 20px', fontSize: '13px', color: muted ? 'var(--text-secondary)' : 'var(--text)', borderBottom: '1px solid var(--border)', fontWeight: muted ? '400' : '500' }}>
        {children}
    </td>
);

// ── Hackathon Card ──────────────────────────────────────────────────────────
const HackathonCard = ({ h, onClick }) => {
    const now = new Date();
    const start = new Date(h.startDate);
    const end = new Date(h.endDate);
    const status = end < now ? 'ENDED' : start > now ? 'UPCOMING' : 'ACTIVE';

    return (
        <div onClick={onClick} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <StatusBadge status={status} />
                <ChevronRight size={16} color="var(--text-secondary)" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.2px' }}>{h.title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{h.organizationName}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Start: {new Date(h.startDate).toLocaleDateString()}</span>
                <span>End: {new Date(h.endDate).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

// ── Overview Tab ────────────────────────────────────────────────────────────
const OverviewTab = ({ user, stats }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ backgroundColor: 'var(--brand-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px 32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                Welcome back, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Here's a summary of your HackHub activity.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <StatCard label="Hackathons Joined" value={stats.hackathons} icon={Trophy} color="#4F46E5" />
            <StatCard label="Teams I'm In" value={stats.teams} icon={Users} color="#0891B2" />
            <StatCard label="Submissions Made" value={stats.submissions} icon={FileText} color="#D97706" />
            <StatCard label="Certificates Earned" value={stats.certificates} icon={Award} color="#15803D" />
        </div>
    </div>
);

// ── Hackathons Tab ──────────────────────────────────────────────────────────
const HackathonsTab = ({ hackathons, loading, activeFilter, onFilter, onCardClick }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="var(--text-secondary)" />
            <div style={{ display: 'flex', gap: '6px' }}>
                {FILTERS.map(f => (
                    <button key={f} onClick={() => onFilter(f)} style={{
                        padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                        backgroundColor: activeFilter === f ? 'var(--brand)' : 'var(--surface)',
                        color: activeFilter === f ? 'white' : 'var(--text-secondary)',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                    }}>{f}</button>
                ))}
            </div>
        </div>
        {loading ? <LoadingSpinner /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {hackathons.length ? hackathons.map(h => (
                    <HackathonCard key={h.id} h={h} onClick={() => onCardClick(h.id)} />
                )) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        No hackathons found.
                    </div>
                )}
            </div>
        )}
    </div>
);

// ── My Teams Tab
const TeamsTab = ({ teams }) => (
    <Table headers={['Team Name', 'Leader', 'Members', 'Invite Code']} empty={!teams?.length && 'You are not part of any team yet.'}>
        {teams?.map(t => (
            <Tr key={t.id}>
                <Td>{t.name}</Td>
                <Td muted>{t.leaderName}</Td>
                <Td muted>{t.memberCount}</Td>
                <Td>
                    <span style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand)', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                        {t.inviteCode}
                    </span>
                </Td>
            </Tr>
        ))}
    </Table>
);

// ── Submissions Tab
const SubmissionsTab = ({ submissions }) => (
    <Table headers={['Title', 'Team', 'Hackathon', 'Type', 'Submitted']} empty={!submissions?.length && 'No submissions yet.'}>
        {submissions?.map(s => (
            <Tr key={s.id}>
                <Td>{s.title}</Td>
                <Td muted>{s.teamName}</Td>
                <Td muted>{s.hackathonTitle}</Td>
                <Td><StatusBadge status={s.status} /></Td>
                <Td muted>{new Date(s.submittedAt).toLocaleDateString()}</Td>
            </Tr>
        ))}
    </Table>
);

// ── Certificates Tab
const CertificatesTab = ({ certs, onDownload }) => (
    <Table headers={['Hackathon', 'Type', 'Issued', 'Download']} empty={!certs?.length && 'No certificates yet.'}>
        {certs?.map(c => (
            <Tr key={c.id}>
                <Td>{c.hackathonTitle}</Td>
                <Td><StatusBadge status={c.type} /></Td>
                <Td muted>{new Date(c.issuedAt).toLocaleDateString()}</Td>
                <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                    <button onClick={() => onDownload(c.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '8px', border: 'none',
                        backgroundColor: 'var(--brand-bg)', color: 'var(--brand)',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    }}>
                        <Download size={13} /> Download PDF
                    </button>
                </td>
            </Tr>
        ))}
    </Table>
);

// ── Main Dashboard
const ParticipantDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');
    const [hackathons, setHackathons] = useState([]);
    const [teams, setTeams] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [certs, setCerts] = useState([]);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ hackathons: 0, teams: 0, submissions: 0, certificates: 0 });

    const fetchOverview = useCallback(async () => {
        if (!user) return;
        try {
            const [teamsRes, subsRes, certsRes] = await Promise.all([
                getMyTeams(user.userId),
                getMySubmissions(user.userId),
                getMyCertificates(),
            ]);
            const t = teamsRes.data.data || [];
            const s = subsRes.data.data || [];
            const c = certsRes.data.data || [];
            setTeams(t);
            setSubmissions(s);
            setCerts(c);
            setStats({ hackathons: t.length, teams: t.length, submissions: s.length, certificates: c.length });
        } catch { setError('Failed to load overview data.'); }
    }, [user]);

    const fetchHackathons = useCallback(async (filter = 'ALL') => {
        setFilterLoading(true);
        try {
            const res = filter === 'ALL' ? await getAllHackathons() : await filterHackathons(filter);
            setHackathons(res.data.data || []);
        } catch { setError('Failed to load hackathons.'); }
        finally { setFilterLoading(false); }
    }, []);

    useEffect(() => {
        setError('');
        setLoading(true);
        const load = async () => {
            if (activeTab === 'Overview') await fetchOverview();
            else if (activeTab === 'Hackathons') await fetchHackathons('ALL');
            else if (activeTab === 'My Teams') { const r = await getMyTeams(user.userId); setTeams(r.data.data || []); }
            else if (activeTab === 'Submissions') { const r = await getMySubmissions(user.userId); setSubmissions(r.data.data || []); }
            else if (activeTab === 'Certificates') { const r = await getMyCertificates(); setCerts(r.data.data || []); }
            setLoading(false);
        };
        load();
    }, [activeTab]);

    const handleFilter = async (filter) => {
        setActiveFilter(filter);
        await fetchHackathons(filter === 'ALL' ? 'ALL' : filter);
    };

    const handleDownload = async (certId) => {
        try {
            const res = await downloadCertificate(certId);
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `HackHub_Certificate_${certId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch { setError('Failed to download certificate.'); }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
            <Navbar />
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                        Participant Dashboard
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Track your hackathons, teams, submissions and certificates
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', marginBottom: '28px', width: 'fit-content' }}>
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                            fontSize: '13px', fontWeight: '600',
                            backgroundColor: activeTab === tab ? 'var(--brand)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                            transition: 'all 0.15s ease',
                        }}>{tab}</button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Content */}
                {loading ? <LoadingSpinner /> : <>
                    {activeTab === 'Overview' && <OverviewTab user={user} stats={stats} />}
                    {activeTab === 'Hackathons' && <HackathonsTab hackathons={hackathons} loading={filterLoading} activeFilter={activeFilter} onFilter={handleFilter} onCardClick={(id) => navigate(`/participant/hackathon/${id}`)} />}
                    {activeTab === 'My Teams' && <TeamsTab teams={teams} />}
                    {activeTab === 'Submissions' && <SubmissionsTab submissions={submissions} />}
                    {activeTab === 'Certificates' && <CertificatesTab certs={certs} onDownload={handleDownload} />}
                </>}

            </div>
        </div>
    );
};

export default ParticipantDashboard;