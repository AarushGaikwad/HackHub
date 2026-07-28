import { useState, useEffect, useCallback } from 'react';
import { Trophy, Users, Award, Plus, Trash2, Edit, ChevronDown, CheckCircle, XCircle, Medal } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import {
    createHackathon, getMyHackathons, updateHackathon, deleteHackathon,
    getRegisteredTeams, getLeaderboard, generateCertificates,
    getAssignedJudges, assignJudge, removeJudge, getAllUsers, getAllOrganizations
} from '../../api/organizerApi';

const TABS = ['Overview', 'My Hackathons', 'Manage', 'Judges'];

// ── Shared Table ────────────────────────────────────────────────────────────
const Table = ({ headers, children, empty }) => (
    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: 'var(--bg)' }}>
                    {headers.map(h => (
                        <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
        {empty && <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>{empty}</div>}
    </div>
);

const Td = ({ children, muted }) => (
    <td style={{ padding: '14px 20px', fontSize: '13px', color: muted ? 'var(--text-secondary)' : 'var(--text)', borderBottom: '1px solid var(--border)', fontWeight: muted ? '400' : '500' }}>{children}</td>
);

// ── Hackathon Form Modal ─────────────────────────────────────────────────────
const HackathonForm = ({ initial, organizations, onSubmit, onClose, loading }) => {
    const [form, setForm] = useState(initial || {
        title: '', description: '', rules: '',
        startDate: '', endDate: '', organizationId: '', maxTeamSize: '', registrationDeadline: '',
    });

    const u = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    const inputStyle = { width: '100%', height: '42px', padding: '0 12px', backgroundColor: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', marginBottom: '24px', letterSpacing: '-0.3px' }}>
                    {initial ? 'Edit Hackathon' : 'Create Hackathon'}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                        { label: 'Title', key: 'title', placeholder: 'AI Innovation Challenge 2025' },
                        { label: 'Description', key: 'description', placeholder: 'Brief description...' },
                        { label: 'Rules', key: 'rules', placeholder: 'Max 5 members per team...' },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label style={labelStyle}>{label}</label>
                            <input value={form[key]} onChange={u(key)} placeholder={placeholder} style={inputStyle} />
                        </div>
                    ))}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={labelStyle}>Start Date</label>
                            <input type="datetime-local" value={form.startDate} onChange={u('startDate')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>End Date</label>
                            <input type="datetime-local" value={form.endDate} onChange={u('endDate')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Max Team Size</label>
                            <input type="number" value={form.maxTeamSize} onChange={u('maxTeamSize')} placeholder="5" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Registration Deadline</label>
                            <input type="datetime-local" value={form.registrationDeadline} onChange={u('registrationDeadline')} style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Organization</label>
                        <select value={form.organizationId} onChange={u('organizationId')} style={{ ...inputStyle }}>
                            <option value="">Select organization</option>
                            {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button onClick={onClose} style={{ flex: 1, height: '42px', borderRadius: '10px', border: '1.5px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button onClick={() => onSubmit(form)} disabled={loading} style={{ flex: 1, height: '42px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--brand)', color: 'white', fontSize: '13px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Saving...' : initial ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ hackathons, user }) => {
    const now = new Date();
    const active = hackathons.filter(h => new Date(h.startDate) <= now && new Date(h.endDate) >= now).length;
    const upcoming = hackathons.filter(h => new Date(h.startDate) > now).length;
    const completed = hackathons.filter(h => new Date(h.endDate) < now).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ backgroundColor: 'var(--brand-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px 32px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                    Welcome back, {user?.name?.split(' ')[0]} 👋
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Manage your hackathons and track participants.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <StatCard label="Total Hackathons" value={hackathons.length} icon={Trophy} color="#4F46E5" />
                <StatCard label="Active" value={active} icon={Trophy} color="#15803D" />
                <StatCard label="Upcoming" value={upcoming} icon={Trophy} color="#D97706" />
                <StatCard label="Completed" value={completed} icon={Award} color="#0891B2" />
            </div>
        </div>
    );
};

// ── My Hackathons Tab ─────────────────────────────────────────────────────────
const HackathonsTab = ({ hackathons, onEdit, onDelete, onAdd }) => {
    const getStatus = (h) => {
        const now = new Date();
        if (new Date(h.endDate) < now) return 'ENDED';
        if (new Date(h.startDate) > now) return 'UPCOMING';
        return 'ACTIVE';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--brand)', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                    <Plus size={14} /> Create Hackathon
                </button>
            </div>
            <Table headers={['Title', 'Organization', 'Start', 'End', 'Status', 'Actions']} empty={!hackathons.length && 'No hackathons yet. Create your first one!'}>
                {hackathons.map(h => (
                    <tr key={h.id} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Td>{h.title}</Td>
                        <Td muted>{h.organizationName}</Td>
                        <Td muted>{new Date(h.startDate).toLocaleDateString()}</Td>
                        <Td muted>{new Date(h.endDate).toLocaleDateString()}</Td>
                        <Td><StatusBadge status={getStatus(h)} /></Td>
                        <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => onEdit(h)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--brand-bg)', color: 'var(--brand)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    <Edit size={12} /> Edit
                                </button>
                                <button onClick={() => onDelete(h.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>
        </div>
    );
};

// ── Manage Tab ────────────────────────────────────────────────────────────────
const ManageTab = ({ hackathons, user }) => {
    const [selectedId, setSelectedId] = useState('');
    const [teams, setTeams] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [certLoading, setCertLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadData = async (id) => {
        setLoading(true);
        setError('');
        try {
            const [tRes, lRes] = await Promise.all([
                getRegisteredTeams(id),
                getLeaderboard(id).catch(() => ({ data: { data: [] } })),
            ]);
            setTeams(tRes.data.data || []);
            setLeaderboard(lRes.data.data || []);
        } catch { setError('Failed to load hackathon data.'); }
        finally { setLoading(false); }
    };

    const handleSelect = (id) => { setSelectedId(id); if (id) loadData(id); };

    const handleGenerateCerts = async () => {
        if (!window.confirm('Generate certificates for all participants?')) return;
        setCertLoading(true);
        setError('');
        try {
            await generateCertificates(selectedId);
            setSuccess('Certificates generated and emailed to all participants!');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to generate certificates.');
        } finally { setCertLoading(false); }
    };

    const rankColors = ['#D97706', '#64748B', '#B45309'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Selector */}
            <div style={{ position: 'relative', maxWidth: '360px' }}>
                <select value={selectedId} onChange={e => handleSelect(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 36px 0 14px', backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Select a hackathon to manage</option>
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            </div>

            {error && <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500' }}>⚠️ {error}</div>}
            {success && <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500' }}>✓ {success}</div>}

            {!selectedId && <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontSize: '14px', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>Select a hackathon to view teams, leaderboard and generate certificates.</div>}

            {selectedId && loading && <LoadingSpinner />}

            {selectedId && !loading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Teams */}
                    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>
                                Registered Teams
                                <span style={{ marginLeft: '8px', backgroundColor: 'var(--brand-bg)', color: 'var(--brand)', padding: '2px 8px', borderRadius: '100px', fontSize: '11px' }}>{teams.length}</span>
                            </h3>
                        </div>
                        {teams.length === 0
                            ? <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No teams registered yet.</p>
                            : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {teams.map(t => (
                                    <div key={t.id} style={{ padding: '12px 14px', backgroundColor: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '2px' }}>{t.teamName}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Led by {t.leaderName} · {t.memberCount} members</div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>

                    {/* Leaderboard + Certs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px' }}>Leaderboard</h3>
                            {leaderboard.length === 0
                                ? <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No evaluations yet.</p>
                                : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {leaderboard.map((l, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', backgroundColor: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: `${rankColors[i] || 'var(--border)'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {i < 3 ? <Medal size={14} color={rankColors[i]} /> : <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>#{i + 1}</span>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>{l.teamName}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{l.totalEvaluations} evaluation{l.totalEvaluations !== 1 ? 's' : ''}</div>
                                            </div>
                                            <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--brand)' }}>{l.averageScore?.toFixed(1)}</div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>

                        {/* Generate Certificates */}
                        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>Certificates</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>Generate and email certificates to all participants. Hackathon must be completed.</p>
                            <button onClick={handleGenerateCerts} disabled={certLoading} style={{ width: '100%', height: '40px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--brand)', color: 'white', fontSize: '13px', fontWeight: '700', cursor: certLoading ? 'not-allowed' : 'pointer', opacity: certLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <Award size={14} /> {certLoading ? 'Generating...' : 'Generate Certificates'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Judges Tab ────────────────────────────────────────────────────────────────
const JudgesTab = ({ hackathons, user }) => {
    const [selectedId, setSelectedId] = useState('');
    const [judges, setJudges] = useState([]);
    const [allJudges, setAllJudges] = useState([]);
    const [selectedJudgeId, setSelectedJudgeId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        getAllUsers().then(r => {
            setAllJudges((r.data.data || []).filter(u => u.role === 'JUDGE'));
        }).catch(() => {});
    }, []);

    const loadJudges = async (id) => {
        setLoading(true);
        try { const r = await getAssignedJudges(id); setJudges(r.data.data || []); }
        catch { setError('Failed to load judges.'); }
        finally { setLoading(false); }
    };

    const handleSelect = (id) => { setSelectedId(id); if (id) loadJudges(id); };

    const handleAssign = async () => {
        if (!selectedJudgeId) return;
        try {
            await assignJudge(selectedId, selectedJudgeId, user.userId);
            setSelectedJudgeId('');
            await loadJudges(selectedId);
        } catch (e) { setError(e.response?.data?.message || 'Failed to assign judge.'); }
    };

    const handleRemove = async (judgeId) => {
        try {
            await removeJudge(selectedId, judgeId, user.userId);
            await loadJudges(selectedId);
        } catch { setError('Failed to remove judge.'); }
    };

    const assignedIds = judges.map(j => j.judgeId);
    const availableJudges = allJudges.filter(j => !assignedIds.includes(j.id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ position: 'relative', maxWidth: '360px' }}>
                <select value={selectedId} onChange={e => handleSelect(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 36px 0 14px', backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Select a hackathon</option>
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            </div>

            {error && <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px' }}>⚠️ {error}</div>}

            {selectedId && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Assigned judges */}
                    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px' }}>
                            Assigned Judges
                            <span style={{ marginLeft: '8px', backgroundColor: 'var(--brand-bg)', color: 'var(--brand)', padding: '2px 8px', borderRadius: '100px', fontSize: '11px' }}>{judges.length}</span>
                        </h3>
                        {loading ? <LoadingSpinner /> : judges.length === 0
                            ? <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No judges assigned yet.</p>
                            : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {judges.map(j => (
                                    <div key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{j.judgeName}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{j.judgeEmail}</div>
                                        </div>
                                        <button onClick={() => handleRemove(j.judgeId)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', border: 'none', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                            <XCircle size={11} /> Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>

                    {/* Assign new judge */}
                    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px' }}>Assign a Judge</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <select value={selectedJudgeId} onChange={e => setSelectedJudgeId(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 12px', backgroundColor: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', outline: 'none' }}>
                                <option value="">Select a judge</option>
                                {availableJudges.map(j => <option key={j.id} value={j.id}>{j.name} — {j.email}</option>)}
                            </select>
                            <button onClick={handleAssign} disabled={!selectedJudgeId} style={{ height: '42px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--brand)', color: 'white', fontSize: '13px', fontWeight: '700', cursor: selectedJudgeId ? 'pointer' : 'not-allowed', opacity: selectedJudgeId ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <CheckCircle size={14} /> Assign Judge
                            </button>
                        </div>
                        {availableJudges.length === 0 && (
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>All available judges are already assigned.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const OrganizerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Overview');
    const [hackathons, setHackathons] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingHackathon, setEditingHackathon] = useState(null);

    const loadHackathons = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [hRes, oRes] = await Promise.all([
                getMyHackathons(user.userId),
                getAllOrganizations().catch(() => ({ data: { data: [] } })),
            ]);
            setHackathons(hRes.data.data || []);
            setOrganizations(oRes.data.data || []);
        } catch { setError('Failed to load data.'); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { loadHackathons(); }, [loadHackathons]);

    const handleCreate = async (form) => {
        setFormLoading(true);
        try {
            await createHackathon({ ...form, createdBy: user.userId });
            await loadHackathons();
            setShowForm(false);
        } catch (e) { setError(e.response?.data?.message || 'Failed to create hackathon.'); }
        finally { setFormLoading(false); }
    };

    const handleUpdate = async (form) => {
        setFormLoading(true);
        try {
            await updateHackathon(editingHackathon.id, { ...form, createdBy: user.userId });
            await loadHackathons();
            setEditingHackathon(null);
        } catch (e) { setError(e.response?.data?.message || 'Failed to update hackathon.'); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this hackathon? This cannot be undone.')) return;
        try {
            await deleteHackathon(id);
            setHackathons(prev => prev.filter(h => h.id !== id));
        } catch { setError('Failed to delete hackathon.'); }
    };

    const openEdit = (h) => {
        setEditingHackathon({
            ...h,
            startDate: h.startDate?.slice(0, 16) || '',
            endDate: h.endDate?.slice(0, 16) || '',
            registrationDeadline: h.registrationDeadline?.slice(0, 16) || '',
        });
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
            <Navbar />
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>Organizer Dashboard</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Create and manage your hackathons</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', marginBottom: '28px', width: 'fit-content' }}>
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: activeTab === tab ? 'var(--brand)' : 'transparent', color: activeTab === tab ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s ease' }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {error && <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>⚠️ {error}</div>}

                {loading ? <LoadingSpinner /> : <>
                    {activeTab === 'Overview' && <OverviewTab hackathons={hackathons} user={user} />}
                    {activeTab === 'My Hackathons' && <HackathonsTab hackathons={hackathons} onEdit={openEdit} onDelete={handleDelete} onAdd={() => setShowForm(true)} />}
                    {activeTab === 'Manage' && <ManageTab hackathons={hackathons} user={user} />}
                    {activeTab === 'Judges' && <JudgesTab hackathons={hackathons} user={user} />}
                </>}
            </div>

            {/* Modals */}
            {showForm && <HackathonForm organizations={organizations} onSubmit={handleCreate} onClose={() => setShowForm(false)} loading={formLoading} />}
            {editingHackathon && <HackathonForm initial={editingHackathon} organizations={organizations} onSubmit={handleUpdate} onClose={() => setEditingHackathon(null)} loading={formLoading} />}
        </div>
    );
};

export default OrganizerDashboard;