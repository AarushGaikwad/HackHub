import { useState, useEffect, useCallback } from 'react';
import { Users, Trophy, Award, Building, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
    getOverviewStats, getAllUsers, approveOrganizer,
    rejectOrganizer, getAllHackathons, deleteHackathon,
    getAllCertificates, getAllOrganizations
} from '../../api/adminApi';

const TABS = ['Overview', 'Users', 'Hackathons', 'Organizations', 'Certificates'];

// Reusable table wrapper 
const Table = ({ headers, children, empty }) => (
    <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
    }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: 'var(--bg)' }}>
                    {headers.map(h => (
                        <th key={h} style={{
                            padding: '13px 20px',
                            textAlign: 'left',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: 'var(--text-secondary)',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid var(--border)',
                        }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
        {empty && (
            <div style={{
                padding: '48px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '14px',
            }}>
                {empty}
            </div>
        )}
    </div>
);

const Td = ({ children, muted }) => (
    <td style={{
        padding: '14px 20px',
        fontSize: '13px',
        color: muted ? 'var(--text-secondary)' : 'var(--text)',
        borderBottom: '1px solid var(--border)',
        fontWeight: muted ? '400' : '500',
    }}>
        {children}
    </td>
);

// ── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ stats }) => {
    if (!stats) return <LoadingSpinner />;
    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#4F46E5' },
        { label: 'Total Hackathons', value: stats.totalHackathons, icon: Trophy, color: '#0891B2' },
        { label: 'Active Hackathons', value: stats.activeHackathons, icon: RefreshCw, color: '#15803D' },
        { label: 'Upcoming Hackathons', value: stats.upcomingHackathons, icon: Trophy, color: '#D97706' },
        { label: 'Pending Organizers', value: stats.pendingOrganizers, icon: Users, color: '#DC2626' },
        { label: 'Total Teams', value: stats.totalTeams, icon: Users, color: '#7C3AED' },
        { label: 'Certificates Issued', value: stats.totalCertificatesIssued, icon: Award, color: '#0891B2' },
        { label: 'Total Organizers', value: stats.totalOrganizers, icon: Building, color: '#D97706' },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
        }}>
            {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
    );
};

// ── Users Tab ─────────────────────────────────────────────────────────────────
const UsersTab = ({ users, onApprove, onReject }) => (
    <Table
        headers={['Name', 'Email', 'Role', 'Status', 'Actions']}
        empty={!users?.length && 'No users found'}
    >
        {users?.map(u => (
            <tr key={u.id} style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Td>{u.name}</Td>
                <Td muted>{u.email}</Td>
                <Td>
                    <span style={{
                        backgroundColor: 'var(--brand-bg)',
                        color: 'var(--brand)',
                        padding: '3px 10px',
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: '600',
                    }}>{u.role}</span>
                </Td>
                <Td><StatusBadge status={u.status} /></Td>
                <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                    {u.role === 'ORGANIZER' && u.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => onApprove(u.id)} style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '6px 12px', borderRadius: '8px', border: 'none',
                                backgroundColor: 'var(--success-bg)', color: 'var(--success-text)',
                                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                            }}>
                                <CheckCircle size={13} /> Approve
                            </button>
                            <button onClick={() => onReject(u.id)} style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '6px 12px', borderRadius: '8px', border: 'none',
                                backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)',
                                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                            }}>
                                <XCircle size={13} /> Reject
                            </button>
                        </div>
                    )}
                    {!(u.role === 'ORGANIZER' && u.status === 'PENDING') && (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>—</span>
                    )}
                </td>
            </tr>
        ))}
    </Table>
);

// ── Hackathons Tab ────────────────────────────────────────────────────────────
const HackathonsTab = ({ hackathons, onDelete }) => (
    <Table
        headers={['Title', 'Organization', 'Organizer', 'Start', 'End', 'Actions']}
        empty={!hackathons?.length && 'No hackathons found'}
    >
        {hackathons?.map(h => (
            <tr key={h.id}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Td>{h.title}</Td>
                <Td muted>{h.organizationName}</Td>
                <Td muted>{h.organizerName}</Td>
                <Td muted>{new Date(h.startDate).toLocaleDateString()}</Td>
                <Td muted>{new Date(h.endDate).toLocaleDateString()}</Td>
                <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                    <button onClick={() => onDelete(h.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 12px', borderRadius: '8px', border: 'none',
                        backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    }}>
                        <Trash2 size={13} /> Delete
                    </button>
                </td>
            </tr>
        ))}
    </Table>
);

// ── Organizations Tab ─────────────────────────────────────────────────────────
const OrgsTab = ({ orgs }) => (
    <Table
        headers={['ID', 'Name', 'Type']}
        empty={!orgs?.length && 'No organizations found'}
    >
        {orgs?.map(o => (
            <tr key={o.id}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Td muted>#{o.id}</Td>
                <Td>{o.name}</Td>
                <Td>
                    <span style={{
                        backgroundColor: 'var(--info-bg)', color: 'var(--info-text)',
                        padding: '3px 10px', borderRadius: '100px',
                        fontSize: '11px', fontWeight: '600',
                    }}>{o.type}</span>
                </Td>
            </tr>
        ))}
    </Table>
);

// ── Certificates Tab ──────────────────────────────────────────────────────────
const CertificatesTab = ({ certs }) => (
    <Table
        headers={['ID', 'Participant', 'Hackathon', 'Type', 'Issued At']}
        empty={!certs?.length && 'No certificates found'}
    >
        {certs?.map(c => (
            <tr key={c.id}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Td muted>#{c.id}</Td>
                <Td>{c.participantName}</Td>
                <Td muted>{c.hackathonTitle}</Td>
                <Td><StatusBadge status={c.type} /></Td>
                <Td muted>{new Date(c.issuedAt).toLocaleDateString()}</Td>
            </tr>
        ))}
    </Table>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [hackathons, setHackathons] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async (tab) => {
        setLoading(true);
        setError('');
        try {
            if (tab === 'Overview') {
                const res = await getOverviewStats();
                setStats(res.data.data);
            } else if (tab === 'Users') {
                const res = await getAllUsers();
                setUsers(res.data.data);
            } else if (tab === 'Hackathons') {
                const res = await getAllHackathons();
                setHackathons(res.data.data);
            } else if (tab === 'Organizations') {
                const res = await getAllOrganizations();
                setOrgs(res.data.data);
            } else if (tab === 'Certificates') {
                const res = await getAllCertificates();
                setCerts(res.data.data);
            }
        } catch {
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(activeTab); }, [activeTab, fetchData]);

    const handleApprove = async (userId) => {
        try {
            await approveOrganizer(userId);
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, status: 'APPROVED' } : u
            ));
        } catch {
            setError('Failed to approve organizer');
        }
    };

    const handleReject = async (userId) => {
        try {
            await rejectOrganizer(userId);
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, status: 'REJECTED' } : u
            ));
        } catch {
            setError('Failed to reject organizer');
        }
    };

    const handleDelete = async (hackathonId) => {
        if (!window.confirm('Delete this hackathon? This cannot be undone.')) return;
        try {
            await deleteHackathon(hackathonId);
            setHackathons(prev => prev.filter(h => h.id !== hackathonId));
        } catch {
            setError('Failed to delete hackathon');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
            <Navbar />

            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

                {/* Page header */}
                <div style={{ marginBottom: '36px' }}>
                    <h1 style={{
                        fontSize: '28px', fontWeight: '800',
                        color: 'var(--text)', letterSpacing: '-0.5px',
                        marginBottom: '6px',
                    }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Manage users, hackathons, and platform settings
                    </p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '4px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '28px',
                    width: 'fit-content',
                }}>
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            padding: '8px 18px',
                            borderRadius: '9px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            backgroundColor: activeTab === tab ? 'var(--brand)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                            transition: 'all 0.15s ease',
                        }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        backgroundColor: 'var(--danger-bg)',
                        color: 'var(--danger-text)',
                        border: '1px solid var(--danger-text)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: '500',
                        marginBottom: '20px',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Tab content */}
                {loading
                    ? <LoadingSpinner />
                    : <>
                        {activeTab === 'Overview' && <OverviewTab stats={stats} />}
                        {activeTab === 'Users' && (
                            <UsersTab
                                users={users}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        )}
                        {activeTab === 'Hackathons' && (
                            <HackathonsTab
                                hackathons={hackathons}
                                onDelete={handleDelete}
                            />
                        )}
                        {activeTab === 'Organizations' && <OrgsTab orgs={orgs} />}
                        {activeTab === 'Certificates' && <CertificatesTab certs={certs} />}
                    </>
                }

            </div>
        </div>
    );
};

export default AdminDashboard;