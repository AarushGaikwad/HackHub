import { useState, useEffect, useCallback } from 'react';
import { Trophy, FileText, Star, CheckCircle, ChevronDown, Medal, Send } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import {
    getJudgeHackathons, getPendingSubmissions, getJudgeEvaluations,
    getJudgeStats, getSubmissionsWithStatus, getLeaderboard,
    submitEvaluation, updateEvaluation, getSubmissionEvaluations
} from '../../api/judgeApi';

const TABS = ['Overview', 'Submissions', 'My Evaluations', 'Leaderboard'];

//  Shared Table
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

//  Evaluate Modal
const EvaluateModal = ({ submission, existingEval, onSubmit, onClose, loading }) => {
    const [score, setScore] = useState(existingEval?.score ?? '');
    const [feedback, setFeedback] = useState(existingEval?.feedback ?? '');

    const inputStyle = { width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
                    {existingEval ? 'Update Evaluation' : 'Submit Evaluation'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>{submission?.title}</p>

                {/* Submission info */}
                <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Team</span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{submission?.teamName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hackathon</span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{submission?.hackathonTitle}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Type</span>
                            <StatusBadge status={submission?.submissionStatus} />
                        </div>
                        {submission?.githubUrl && (
                            <a href={submission.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: '600', textDecoration: 'none' }}>
                                View on GitHub →
                            </a>
                        )}
                        {submission?.resourceUrl && (
                            <a href={submission.resourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: '600', textDecoration: 'none' }}>
                                View Resources →
                            </a>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Score */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
                            Score (0 – 100)
                        </label>
                        <input type="number" min="0" max="100" value={score}
                            onChange={e => setScore(e.target.value)} placeholder="85"
                            style={{ ...inputStyle, height: '42px', padding: '0 14px' }} />
                        {/* Score bar */}
                        {score !== '' && (
                            <div style={{ marginTop: '8px', height: '4px', backgroundColor: 'var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(score, 100)}%`, backgroundColor: score >= 80 ? 'var(--success-text)' : score >= 50 ? 'var(--brand)' : 'var(--danger-text)', borderRadius: '100px', transition: 'width 0.3s ease' }} />
                            </div>
                        )}
                    </div>

                    {/* Feedback */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>Feedback</label>
                        <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                            placeholder="Provide detailed feedback on the submission..."
                            rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button onClick={onClose} style={{ flex: 1, height: '42px', borderRadius: '10px', border: '1.5px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button onClick={() => onSubmit({ score: Number(score), feedback })} disabled={loading || score === ''} style={{ flex: 1, height: '42px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--brand)', color: 'white', fontSize: '13px', fontWeight: '700', cursor: loading || score === '' ? 'not-allowed' : 'pointer', opacity: loading || score === '' ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Send size={13} /> {loading ? 'Submitting...' : existingEval ? 'Update' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

//  Overview Tab
const OverviewTab = ({ user, stats, hackathons }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ backgroundColor: 'var(--brand-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px 32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                Welcome back, {user?.name} 👋
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                You have {hackathons.length} hackathon{hackathons.length !== 1 ? 's' : ''} assigned to you.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <StatCard label="Total Evaluations" value={stats?.totalEvaluations ?? 0} icon={CheckCircle} color="#4F46E5" />
            <StatCard label="Avg Score Given" value={stats?.averageScoreGiven ? stats.averageScoreGiven.toFixed(1) : '—'} icon={Star} color="#D97706" />
            <StatCard label="Hackathons Judged" value={stats?.hackathonsJudged ?? 0} icon={Trophy} color="#0891B2" />
        </div>

        {/* Assigned hackathons */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px' }}>
                Assigned Hackathons
            </h3>
            {hackathons.length === 0
                ? <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No hackathons assigned yet.</p>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {hackathons.map(h => (
                        <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '3px' }}>{h.hackathonTitle}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Assigned by {h.assignedByName}</div>
                            </div>
                            <StatusBadge status={h.status} />
                        </div>
                    ))}
                </div>
            }
        </div>
    </div>
);

//  Submissions Tab
const SubmissionsTab = ({ judgeId, onEvaluate }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        getSubmissionsWithStatus(judgeId)
            .then(r => setSubmissions(r.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [judgeId]);

    const filtered = filter === 'ALL' ? submissions
        : filter === 'PENDING' ? submissions.filter(s => !s.evaluated)
        : submissions.filter(s => s.evaluated);

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter */}
            <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'PENDING', 'EVALUATED'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: filter === f ? 'var(--brand)' : 'var(--surface)', color: filter === f ? 'white' : 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {f}
                    </button>
                ))}
            </div>

            <Table headers={['Title', 'Team', 'Hackathon', 'Type', 'Status', 'Action']} empty={!filtered.length && 'No submissions found.'}>
                {filtered.map(s => (
                    <tr key={s.submissionId} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Td>{s.submissionTitle}</Td>
                        <Td muted>{s.teamName}</Td>
                        <Td muted>{s.hackathonTitle}</Td>
                        <Td><StatusBadge status={s.submissionStatus} /></Td>
                        <Td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: s.evaluated ? 'var(--success-text)' : 'var(--warning-text)' }}>
                                {s.evaluated ? <><CheckCircle size={12} /> Evaluated</> : '⏳ Pending'}
                            </span>
                        </Td>
                        <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                            <button onClick={() => onEvaluate(s)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: s.evaluated ? 'var(--brand-bg)' : 'var(--brand)', color: s.evaluated ? 'var(--brand)' : 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                <Star size={12} /> {s.evaluated ? 'Update' : 'Evaluate'}
                            </button>
                        </td>
                    </tr>
                ))}
            </Table>
        </div>
    );
};

//  My Evaluations Tab
const EvaluationsTab = ({ judgeId, onUpdate }) => {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getJudgeEvaluations(judgeId)
            .then(r => setEvaluations(r.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [judgeId]);

    if (loading) return <LoadingSpinner />;

    return (
        <Table headers={['Submission', 'Team', 'Hackathon', 'Score', 'Evaluated', 'Action']} empty={!evaluations.length && 'No evaluations submitted yet.'}>
            {evaluations.map(e => (
                <tr key={e.id} onMouseEnter={ev => ev.currentTarget.style.backgroundColor = 'var(--bg)'} onMouseLeave={ev => ev.currentTarget.style.backgroundColor = 'transparent'}>
                    <Td>{e.submissionTitle}</Td>
                    <Td muted>{e.teamName}</Td>
                    <Td muted>{e.hackathonTitle}</Td>
                    <Td>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: e.score >= 80 ? 'var(--success-text)' : e.score >= 50 ? 'var(--brand)' : 'var(--danger-text)' }}>
                            {e.score}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '3px' }}>/100</span>
                    </Td>
                    <Td muted>{new Date(e.evaluatedAt).toLocaleDateString()}</Td>
                    <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                        <button onClick={() => onUpdate(e)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--brand-bg)', color: 'var(--brand)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                            <Star size={12} /> Update
                        </button>
                    </td>
                </tr>
            ))}
        </Table>
    );
};

//  Leaderboard Tab
const LeaderboardTab = ({ hackathons }) => {
    const [selectedId, setSelectedId] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const rankColors = ['#D97706', '#64748B', '#B45309'];

    const load = async (id) => {
        setLoading(true);
        try { const r = await getLeaderboard(id); setLeaderboard(r.data.data || []); }
        catch { setLeaderboard([]); }
        finally { setLoading(false); }
    };

    const handleSelect = (id) => { setSelectedId(id); if (id) load(id); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ position: 'relative', maxWidth: '360px' }}>
                <select value={selectedId} onChange={e => handleSelect(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 36px 0 14px', backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Select a hackathon</option>
                    {hackathons.map(h => <option key={h.hackathonId} value={h.hackathonId}>{h.hackathonTitle}</option>)}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            </div>

            {!selectedId && <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontSize: '14px', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>Select a hackathon to view the leaderboard.</div>}

            {selectedId && (loading ? <LoadingSpinner /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {leaderboard.length === 0
                        ? <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontSize: '14px', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>No evaluations yet for this hackathon.</div>
                        : leaderboard.map((l, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', backgroundColor: 'var(--surface)', border: `1px solid ${i < 3 ? rankColors[i] + '40' : 'var(--border)'}`, borderRadius: '14px', transition: 'all 0.15s' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: i < 3 ? `${rankColors[i]}20` : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {i < 3 ? <Medal size={16} color={rankColors[i]} /> : <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>#{i + 1}</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '3px' }}>{l.teamName}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{l.totalEvaluations} evaluation{l.totalEvaluations !== 1 ? 's' : ''}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '800', color: i < 3 ? rankColors[i] : 'var(--text)', letterSpacing: '-0.5px' }}>{l.averageScore?.toFixed(1)}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>avg score</div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            ))}
        </div>
    );
};

//  Main Dashboard
const JudgeDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Overview');
    const [hackathons, setHackathons] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [evalModal, setEvalModal] = useState(null);
    const [evalLoading, setEvalLoading] = useState(false);
    const [error, setError] = useState('');
    const [existingEval, setExistingEval] = useState(null);

    const loadBase = useCallback(async () => {
        if (!user) return;
        try {
            const [hRes, sRes] = await Promise.all([
                getJudgeHackathons(user.userId),
                getJudgeStats(user.userId),
            ]);
            setHackathons(hRes.data.data || []);
            setStats(sRes.data.data);
        } catch { setError('Failed to load dashboard data.'); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { loadBase(); }, [loadBase]);

    const openEvaluate = async (submission) => {
        setEvalModal(submission);
        setExistingEval(null);
        try {
            const r = await getSubmissionEvaluations(submission.submissionId);
            const evals = r.data.data || [];
            const mine = evals.find(e => e.judgeId === user.userId);
            if (mine) setExistingEval(mine);
        } catch {}
    };

    const openUpdate = (evaluation) => {
        setExistingEval(evaluation);
        setEvalModal({ submissionId: evaluation.submissionId, title: evaluation.submissionTitle, teamName: evaluation.teamName, hackathonTitle: evaluation.hackathonTitle });
    };

    const handleSubmitEval = async ({ score, feedback }) => {
        setEvalLoading(true);
        setError('');
        try {
            if (existingEval) {
                await updateEvaluation(existingEval.id, { submissionId: evalModal.submissionId, score, feedback });
            } else {
                await submitEvaluation({ submissionId: evalModal.submissionId, score, feedback });
            }
            setEvalModal(null);
            setExistingEval(null);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to submit evaluation.');
            setEvalModal(null);
        } finally { setEvalLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
            <Navbar />
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>

                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                        Judge Panel
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Review submissions, evaluate projects, and publish fair results.</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', marginBottom: '28px', width: 'fit-content' }}>
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: activeTab === tab ? 'var(--brand)' : 'transparent', color: activeTab === tab ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s ease' }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {error && (
                    <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>
                        ⚠️ {error}
                    </div>
                )}

                {loading ? <LoadingSpinner /> : <>
                    {activeTab === 'Overview' && <OverviewTab user={user} stats={stats} hackathons={hackathons} />}
                    {activeTab === 'Submissions' && <SubmissionsTab judgeId={user.userId} onEvaluate={openEvaluate} />}
                    {activeTab === 'My Evaluations' && <EvaluationsTab judgeId={user.userId} onUpdate={openUpdate} />}
                    {activeTab === 'Leaderboard' && <LeaderboardTab hackathons={hackathons} />}
                </>}
            </div>

            {evalModal && (
                <EvaluateModal
                    submission={evalModal}
                    existingEval={existingEval}
                    onSubmit={handleSubmitEval}
                    onClose={() => { setEvalModal(null); setExistingEval(null); }}
                    loading={evalLoading}
                />
            )}
        </div>
    );
};

export default JudgeDashboard;