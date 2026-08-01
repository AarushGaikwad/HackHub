import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {Plus, Users, Copy, LogOut, Trash2, Crown, ArrowRight, Check, Trophy, FileText } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import {
    getMyTeams, createTeam, joinTeam, leaveTeam, deleteTeam,
    getTeamMembers, getTeamRegistrations, registerTeamForHackathon,
    withdrawTeam, getAllHackathons, transferLeader
} from '../../api/participantApi';

//  Small reusable pieces
const Card = ({ children, style = {} }) => (
    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', ...style }}>
        {children}
    </div>
);

const Btn = ({ children, onClick, variant = 'primary', size = 'sm', disabled = false, fullWidth = false }) => {
    const variants = {
        primary: { backgroundColor: 'var(--brand)', color: 'white', border: 'none' },
        secondary: { backgroundColor: 'transparent', color: 'var(--text)', border: '1.5px solid var(--border)' },
        danger: { backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: 'none' },
        ghost: { backgroundColor: 'var(--brand-bg)', color: 'var(--brand)', border: 'none' },
    };
    const sizes = { sm: { padding: '7px 14px', fontSize: '12px' }, md: { padding: '10px 20px', fontSize: '13px' } };
    return (
        <button onClick={onClick} disabled={disabled} style={{ ...variants[variant], ...sizes[size], borderRadius: '9px', fontWeight: '700', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: '5px', width: fullWidth ? '100%' : 'auto', justifyContent: fullWidth ? 'center' : 'flex-start', transition: 'opacity 0.15s' }}>
            {children}
        </button>
    );
};

const Input = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        {label && <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>{label}</label>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
            style={{ width: '100%', height: '42px', padding: '0 14px', backgroundColor: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'var(--brand)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
    </div>
);

//  Create Team Modal
const CreateTeamModal = ({ onSubmit, onClose, loading }) => {
    const [name, setName] = useState('');
    return (
        <Modal title="Create a Team" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input label="Team Name" value={name} onChange={e => setName(e.target.value)} placeholder="Code Warriors" />
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <Btn variant="secondary" onClick={onClose} size="md" fullWidth>Cancel</Btn>
                    <Btn onClick={() => onSubmit(name)} disabled={!name.trim() || loading} size="md" fullWidth>
                        <Plus size={13} /> {loading ? 'Creating...' : 'Create Team'}
                    </Btn>
                </div>
            </div>
        </Modal>
    );
};

//  Join Team Modal
const JoinTeamModal = ({ onSubmit, onClose, loading }) => {
    const [code, setCode] = useState('');
    return (
        <Modal title="Join a Team" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input label="Invite Code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="AB12CD" />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '-8px' }}>Ask your team leader for the 6-character invite code.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Btn variant="secondary" onClick={onClose} size="md" fullWidth>Cancel</Btn>
                    <Btn onClick={() => onSubmit(code)} disabled={code.length < 6 || loading} size="md" fullWidth>
                        <ArrowRight size={13} /> {loading ? 'Joining...' : 'Join Team'}
                    </Btn>
                </div>
            </div>
        </Modal>
    );
};

//  Register for Hackathon Modal
const RegisterModal = ({ teamId, hackathons, registrations, onSubmit, onWithdraw, onClose, loading }) => {
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const registeredIds = registrations.map(r => r.hackathonId);
    const available = hackathons.filter(h => !registeredIds.includes(h.id));

    return (
        <Modal title="Hackathon Registrations" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Registered hackathons */}
                {registrations.length > 0 && (
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Registered</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {registrations.map(r => (
                                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{r.hackathonTitle}</div>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    <Btn variant="danger" onClick={() => onWithdraw(r.hackathonId)} size="sm">Withdraw</Btn>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Register for new hackathon */}
                {available.length > 0 && (
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Register for Hackathon</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select value={selectedHackathon} onChange={e => setSelectedHackathon(e.target.value)}
                                style={{ flex: 1, height: '42px', padding: '0 12px', backgroundColor: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', outline: 'none' }}>
                                <option value="">Select hackathon</option>
                                {available.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                            </select>
                            <Btn onClick={() => onSubmit(selectedHackathon)} disabled={!selectedHackathon || loading} size="md">
                                {loading ? 'Registering...' : 'Register'}
                            </Btn>
                        </div>
                    </div>
                )}

                {available.length === 0 && registrations.length === 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>No hackathons available to register for.</p>
                )}

                <Btn variant="secondary" onClick={onClose} size="md" fullWidth>Close</Btn>
            </div>
        </Modal>
    );
};

// Transfer Leadership modal
const TransferLeaderModal = ({ team, members, onSubmit, onClose, loading }) => {
    const [selectedId, setSelectedId] = useState('');
    const otherMembers = members.filter(m => !m.leader);

    return (
        <Modal title="Transfer Leadership" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Select a member to become the new team leader. After transferring, you can leave the team.
                </p>
                {otherMembers.length === 0 ? (
                    <div style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', fontWeight: '500' }}>
                        ⚠️ No other members to transfer leadership to. Add members first.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {otherMembers.map(m => (
                            <button key={m.userId} onClick={() => setSelectedId(m.userId)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: selectedId === m.userId ? 'var(--brand-bg)' : 'var(--bg)', border: `1.5px solid ${selectedId === m.userId ? 'var(--brand)' : 'var(--border)'}`, borderRadius: '10px', cursor: 'pointer', width: '100%', transition: 'all 0.15s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand)' }}>{m.name?.charAt(0)}</span>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{m.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{m.email}</div>
                                    </div>
                                </div>
                                {selectedId === m.userId && <Check size={15} color="var(--brand)" />}
                            </button>
                        ))}
                    </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <Btn variant="secondary" onClick={onClose} size="md" fullWidth>Cancel</Btn>
                    <Btn onClick={() => onSubmit(selectedId)} disabled={!selectedId || loading || otherMembers.length === 0} size="md" fullWidth>
                        <Crown size={13} /> {loading ? 'Transferring...' : 'Transfer Leadership'}
                    </Btn>
                </div>
            </div>
        </Modal>
    );
};

//  Modal wrapper
const Modal = ({ title, onClose, children }) => (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text)', marginBottom: '20px', letterSpacing: '-0.3px' }}>{title}</h2>
            {children}
        </div>
    </div>
);

//  Team Card
const TeamCard = ({ team, userId, onLeave, onDelete, onRegister, onGoToSubmission, onCopy, copied, onTransfer }) => {
    const [members, setMembers] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const isLeader = team.leaderName === team.leaderName; // will refine with actual check

    useEffect(() => {
    if (expanded) {
        Promise.all([
            getTeamMembers(team.id).then(r => {
                console.log("Members:", r.data.data);
                setMembers(r.data.data || []);
            }),
            getTeamRegistrations(team.id).then(r => setRegistrations(r.data.data || [])),
        ]).catch(() => {});
    }
}, [expanded, team.id]);

    return (
        <Card>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.3px' }}>{team.name}</h3>
                        {team.leaderName && <span style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: '700' }}>
                            <Crown size={9} style={{ display: 'inline', marginRight: '3px' }} />{team.leaderName}
                        </span>}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{team.memberCount} member{team.memberCount !== 1 ? 's' : ''}</p>
                </div>

                {/* Invite code */}
                <button onClick={() => onCopy(team.inviteCode)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '9px', backgroundColor: 'var(--brand-bg)', border: 'none', cursor: 'pointer' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: 'var(--brand)', letterSpacing: '0.08em' }}>{team.inviteCode}</span>
                    {copied === team.inviteCode ? <Check size={13} color="var(--success-text)" /> : <Copy size={13} color="var(--brand)" />}
                </button>
            </div>

            {/* Expand toggle */}
            <button onClick={() => setExpanded(p => !p)} style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: '0', marginBottom: expanded ? '16px' : '0' }}>
                {expanded ? '▲ Hide details' : '▼ Show details'}
            </button>

            {/* Expanded content */}
            {expanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                    {/* Members */}
                    {members.length > 0 && (
                        <div style={{ backgroundColor: 'var(--bg)', borderRadius: '10px', padding: '12px 14px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Members</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {members.map(m => (
                                    <div key={m.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{m.name}</span>
                                        {m.leader && <Crown size={13} color="var(--warning-text)" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hackathon registrations */}
                    {registrations.length > 0 && (
                        <div style={{ backgroundColor: 'var(--bg)', borderRadius: '10px', padding: '12px 14px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Hackathon Registrations</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {registrations.map(r => (
                                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{r.hackathonTitle}</span>
                                            <div style={{ marginTop: '2px' }}><StatusBadge status={r.status} /></div>
                                        </div>
                                        <Btn variant="ghost" size="sm" onClick={() => onGoToSubmission(r.id)}>
                                            <FileText size={12} /> Submit
                                        </Btn>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <Btn variant="ghost" size="sm" onClick={() => onRegister(team.id, registrations)}>
                    <Trophy size={12} /> Register for Hackathon
                </Btn>

                {/* Transfer Leadership — only show if user is leader */}
                {members.some(m => m.userId === userId && m.leader) && (
                    <Btn variant="secondary" size="sm" onClick={() => onTransfer(team.id, members)}>
                        <Crown size={12} /> Transfer Leadership
                    </Btn>
                )}

                <Btn variant="danger" size="sm" onClick={() => onLeave(team.id)}>
                    <LogOut size={12} /> Leave
                </Btn>
                <Btn variant="danger" size="sm" onClick={() => onDelete(team.id)}>
                    <Trash2 size={12} /> Delete
                </Btn>
            </div>
        </Card>
    );
};


//  Main Page
const TeamPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [copied, setCopied] = useState('');
    const [modal, setModal] = useState(null); // 'create' | 'join' | { type: 'register', teamId, registrations }

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [tRes, hRes] = await Promise.all([
                getMyTeams(user.userId),
                getAllHackathons(),
            ]);
            setTeams(tRes.data.data || []);
            setHackathons(hRes.data.data || []);
        } catch { setError('Failed to load teams.'); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const notify = (msg, isError = false) => {
        if (isError) setError(msg); else setSuccess(msg);
        setTimeout(() => { setError(''); setSuccess(''); }, 3000);
    };

    const handleCreate = async (name) => {
        setActionLoading(true);
        try {
            await createTeam({ name });
            await load();
            setModal(null);
            notify('Team created successfully!');
        } catch (e) { notify(e.response?.data?.message || 'Failed to create team.', true); }
        finally { setActionLoading(false); }
    };

    const handleJoin = async (code) => {
        setActionLoading(true);
        try {
            await joinTeam(code);
            await load();
            setModal(null);
            notify('Joined team successfully!');
        } catch (e) { notify(e.response?.data?.message || 'Failed to join team.', true); }
        finally { setActionLoading(false); }
    };

    const handleLeave = async (teamId) => {
        if (!window.confirm('Leave this team?')) return;
        try {
            await leaveTeam(teamId);
            await load();
            notify('Left the team.');
        } catch (e) { notify(e.response?.data?.message || 'Failed to leave team.', true); }
    };

    const handleDelete = async (teamId) => {
        if (!window.confirm('Delete this team? This cannot be undone.')) return;
        try {
            await deleteTeam(teamId);
            await load();
            notify('Team deleted.');
        } catch (e) { notify(e.response?.data?.message || 'Failed to delete team.', true); }
    };

    const handleRegister = async (hackathonId) => {
        setActionLoading(true);
        try {
            await registerTeamForHackathon(hackathonId, modal.teamId);
            await load();
            setModal(null);
            notify('Team registered for hackathon!');
        } catch (e) { notify(e.response?.data?.message || 'Failed to register.', true); }
        finally { setActionLoading(false); }
    };

    const handleWithdraw = async (hackathonId) => {
        if (!window.confirm('Withdraw from this hackathon?')) return;
        try {
            await withdrawTeam(hackathonId, modal.teamId);
            setModal(null);
            await load();
            notify('Withdrawn from hackathon.');
        } catch (e) { notify(e.response?.data?.message || 'Failed to withdraw.', true); }
    };

    const handleTransfer = async (newLeaderId) => {
        setActionLoading(true);
        try {
            await transferLeader(modal.teamId, newLeaderId);
            await load();
            setModal(null);
            notify('Leadership transferred successfully!');
        } catch (e) {
            notify(e.response?.data?.message || 'Failed to transfer leadership.', true);
        } finally { setActionLoading(false); }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
            <Navbar />
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>My Teams</h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Create or join teams and register for hackathons</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Btn variant="secondary" size="md" onClick={() => setModal('join')}>
                            <ArrowRight size={14} /> Join with Code
                        </Btn>
                        <Btn size="md" onClick={() => setModal('create')}>
                            <Plus size={14} /> Create Team
                        </Btn>
                    </div>
                </div>

                {/* Alerts */}
                {error && <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>⚠️ {error}</div>}
                {success && <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>✓ {success}</div>}

                {/* Content */}
                {loading ? <LoadingSpinner /> : teams.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '64px 32px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Users size={24} color="var(--brand)" />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>No teams yet</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Create a team or join one with an invite code to get started.</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <Btn variant="secondary" size="md" onClick={() => setModal('join')}><ArrowRight size={14} /> Join with Code</Btn>
                            <Btn size="md" onClick={() => setModal('create')}><Plus size={14} /> Create Team</Btn>
                        </div>
                    </Card>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                        {teams.map(team => (
                            <TeamCard key={team.id} team={team} userId={user.userId}
                                onLeave={handleLeave} onDelete={handleDelete}
                                onRegister={(teamId, regs) => setModal({ type: 'register', teamId, registrations: regs })}
                                onGoToSubmission={(regId) => navigate(`/participant/submission/${regId}`)}
                                onCopy={handleCopy} copied={copied}
                                onTransfer={(teamId, members) => setModal({type: 'transfer', teamId, members})} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {modal === 'create' && <CreateTeamModal onSubmit={handleCreate} onClose={() => setModal(null)} loading={actionLoading} />}
            {modal === 'join' && <JoinTeamModal onSubmit={handleJoin} onClose={() => setModal(null)} loading={actionLoading} />}
            {modal?.type === 'register' && (
                <RegisterModal teamId={modal.teamId} hackathons={hackathons} registrations={modal.registrations}
                    onSubmit={handleRegister} onWithdraw={handleWithdraw}
                    onClose={() => setModal(null)} loading={actionLoading} />
            )}
            {modal?.type === 'transfer' && (
                <TransferLeaderModal
                    team={modal}
                    members={modal.members}
                    onSubmit={handleTransfer}
                    onClose={() => setModal(null)}
                    loading={actionLoading}
                />
            )}
        </div>
    );
};

export default TeamPage;