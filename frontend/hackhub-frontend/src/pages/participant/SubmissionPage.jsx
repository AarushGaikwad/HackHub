import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Link2, Send, Trash2, Edit, Plus, FileText, CheckCircle } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getTeamSubmissions, submitProgress, submitFinal, editSubmission, deleteSubmission } from '../../api/participantApi';
import api from '../../api/axiosConfig';

//  Shared UI
const Card = ({ children, style = {} }) => (
    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', ...style }}>
        {children}
    </div>
);

const Input = ({ label, value, onChange, placeholder, type = 'text', required }) => (
    <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
            {label} {required && <span style={{ color: 'var(--danger-text)' }}>*</span>}
        </label>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
            style={{ width: '100%', height: '42px', padding: '0 14px', backgroundColor: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'var(--brand)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
    </div>
);

const Textarea = ({ label, value, onChange, placeholder, required }) => (
    <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
            {label} {required && <span style={{ color: 'var(--danger-text)' }}>*</span>}
        </label>
        <textarea value={value} onChange={onChange} placeholder={placeholder} rows={4}
            style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)', outline: 'none', resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'var(--brand)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
    </div>
);

const Btn = ({ children, onClick, variant = 'primary', disabled, fullWidth, type = 'button' }) => {
    const v = {
        primary: { backgroundColor: 'var(--brand)', color: 'white', border: 'none' },
        secondary: { backgroundColor: 'transparent', color: 'var(--text)', border: '1.5px solid var(--border)' },
        danger: { backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: 'none' },
        ghost: { backgroundColor: 'var(--brand-bg)', color: 'var(--brand)', border: 'none' },
        success: { backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: 'none' },
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled}
            style={{ ...v[variant], padding: '9px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px', width: fullWidth ? '100%' : 'auto', justifyContent: fullWidth ? 'center' : undefined, transition: 'opacity 0.15s' }}>
            {children}
        </button>
    );
};

//  Submission Form
const SubmissionForm = ({ type, initial, teamRegistrationId, onSubmit, loading }) => {
    const isFinal = type === 'FINAL';
    const [form, setForm] = useState({
        title: initial?.title || '',
        description: initial?.description || '',
        githubUrl: initial?.githubUrl || '',
        resourceUrl: initial?.resourceUrl || '',
    });
    const u = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
    const valid = form.title && form.description && (isFinal ? form.githubUrl : form.resourceUrl);

    const handleSubmit = () => onSubmit({ ...form, teamRegistrationId });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Title" value={form.title} onChange={u('title')} placeholder={isFinal ? 'AI Traffic Management System' : 'Round 1 — Idea Submission'} required />
            <Textarea label="Description" value={form.description} onChange={u('description')} placeholder={isFinal ? 'Describe your final project...' : 'What did you work on in this phase?'} required />
            {isFinal ? (
                <Input label="GitHub Repository URL" value={form.githubUrl} onChange={u('githubUrl')} placeholder="https://github.com/team/project" required />
            ) : (
                <Input label="Resource URL" value={form.resourceUrl} onChange={u('resourceUrl')} placeholder="https://drive.google.com/..." required />
            )}
            <Input label={isFinal ? 'Presentation / Demo URL (optional)' : 'GitHub URL (optional)'} value={isFinal ? form.resourceUrl : form.githubUrl} onChange={isFinal ? u('resourceUrl') : u('githubUrl')} placeholder={isFinal ? 'https://slides.google.com/...' : 'https://github.com/...'} />
            <Btn onClick={handleSubmit} disabled={!valid || loading} fullWidth>
                <Send size={14} /> {loading ? 'Submitting...' : initial ? 'Update Submission' : isFinal ? 'Submit Final Project' : 'Save Progress Update'}
            </Btn>
        </div>
    );
};

//  Submission Card
const SubmissionCard = ({ s, onEdit, onDelete }) => (
    <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StatusBadge status={s.status} />
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>{s.title}</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(s.submittedAt).toLocaleDateString()}</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>{s.description}</p>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {s.githubUrl && (
                <a href={s.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--brand)', fontWeight: '600', textDecoration: 'none' }}>
                    <Link2 size={13} /> GitHub
                </a>
            )}
            {s.resourceUrl && (
                <a href={s.resourceUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--brand)', fontWeight: '600', textDecoration: 'none' }}>
                    <Link2 size={13} /> Resources
                </a>
            )}
        </div>
        {s.status === 'PROGRESS' && (
            <div style={{ display: 'flex', gap: '8px' }}>
                <Btn variant="ghost" onClick={() => onEdit(s)}>
                    <Edit size={12} /> Edit
                </Btn>
                <Btn variant="danger" onClick={() => onDelete(s.id)}>
                    <Trash2 size={12} /> Delete
                </Btn>
            </div>
        )}
        {s.status === 'FINAL' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--success-text)', fontWeight: '600' }}>
                <CheckCircle size={13} /> Final submission locked
            </div>
        )}
    </div>
);

//  Main Page
const SubmissionPage = () => {
    const { teamRegistrationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [activeForm, setActiveForm] = useState(null); // 'PROGRESS' | 'FINAL' | { type, submission }
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const hasFinal = submissions.some(s => s.status === 'FINAL');
    const progressSubs = submissions.filter(s => s.status === 'PROGRESS');

    const getHackathonStatus = (reg) => {
        const startDate = reg?.hackathonStartDate || reg?.startDate || reg?.hackathon?.startDate;
        const endDate = reg?.hackathonEndDate || reg?.endDate || reg?.hackathon?.endDate;

        if (!startDate || !endDate) return 'UNKNOWN';

        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < now) return 'ENDED';
        if (start > now) return 'UPCOMING';
        return 'ACTIVE';
    };

    const hackathonStatus = getHackathonStatus(registration);
    const isHackathonActive = hackathonStatus === 'ACTIVE';

    const load = useCallback(async () => {
        try {
            const [sRes, rRes] = await Promise.all([
                getTeamSubmissions(teamRegistrationId),
                api.get(`/hackathon/team/${teamRegistrationId}/registrations`).catch(() => ({ data: { data: [] } })),
            ]);
            setSubmissions(sRes.data.data || []);
            const regs = rRes.data.data || [];
            const reg = regs.find(r => r.id === parseInt(teamRegistrationId));
            setRegistration(reg || null);
        } catch { setError('Failed to load submissions.'); }
        finally { setLoading(false); }
    }, [teamRegistrationId]);

    useEffect(() => { load(); }, [load]);

    const notify = (msg, isError = false) => {
        if (isError) setError(msg); else setSuccess(msg);
        setTimeout(() => { setError(''); setSuccess(''); }, 3000);
    };

    const handleSubmit = async (data) => {
        if (!isHackathonActive) {
            notify('Submissions are only available while the hackathon is active.', true);
            return;
        }

        setFormLoading(true);
        try {
            if (activeForm?.submission) {
                await editSubmission(activeForm.submission.id, data);
                notify('Submission updated!');
            } else if (activeForm === 'FINAL') {
                await submitFinal(data);
                notify('Final submission submitted!');
            } else {
                await submitProgress(data);
                notify('Progress update saved!');
            }
            setActiveForm(null);
            await load();
        } catch (e) { notify(e.response?.data?.message || 'Failed to submit.', true); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this submission?')) return;
        try {
            await deleteSubmission(id);
            await load();
            notify('Submission deleted.');
        } catch (e) { notify(e.response?.data?.message || 'Failed to delete.', true); }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
            <Navbar />
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>

                {/* Header */}
                <button onClick={() => navigate('/participant/teams')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '28px', padding: '0' }}>
                    <ArrowLeft size={15} /> Back to Teams
                </button>

                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                        {registration ? registration.hackathonTitle : 'Submissions'}
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {registration ? `Team: ${registration.teamName}` : `Registration #${teamRegistrationId}`}
                    </p>
                </div>

                {/* Alerts */}
                {error && <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>⚠️ {error}</div>}
                {success && <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>✓ {success}</div>}

                {loading ? <LoadingSpinner /> : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'flex-start' }}>

                        {/* Left — submission list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* Action buttons */}
                            {!isHackathonActive && (
                                <div style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: '600' }}>
                                    Submissions are only available while the hackathon is active.
                                </div>
                            )}

                            {isHackathonActive && !hasFinal && (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <Btn onClick={() => setActiveForm(activeForm === 'PROGRESS' ? null : 'PROGRESS')} variant={activeForm === 'PROGRESS' ? 'ghost' : 'primary'}>
                                        <Plus size={14} /> Progress Update
                                    </Btn>
                                    <Btn onClick={() => setActiveForm(activeForm === 'FINAL' ? null : 'FINAL')} variant="success">
                                        <CheckCircle size={14} /> Final Submission
                                    </Btn>
                                </div>
                            )}

                            {hasFinal && (
                                <div style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-text)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--success-text)', fontWeight: '600' }}>
                                    <CheckCircle size={15} /> Final submission has been submitted. No further changes allowed.
                                </div>
                            )}

                            {/* Submissions list */}
                            {submissions.length === 0 ? (
                                <Card style={{ textAlign: 'center', padding: '48px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <FileText size={22} color="var(--brand)" />
                                    </div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>No submissions yet</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Submit a progress update to get started.</p>
                                </Card>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {submissions.map(s => (
                                        <SubmissionCard key={s.id} s={s}
                                            onEdit={(sub) => setActiveForm({ type: sub.status, submission: sub })}
                                            onDelete={handleDelete} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right — form panel */}
                        <div style={{ position: 'sticky', top: '80px' }}>
                            {activeForm ? (
                                isHackathonActive ? (
                                    <Card>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.2px' }}>
                                                {activeForm?.submission ? 'Edit Submission' : activeForm === 'FINAL' ? 'Final Submission' : 'Progress Update'}
                                            </h2>
                                            <button onClick={() => setActiveForm(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
                                        </div>
                                        {activeForm === 'FINAL' && (
                                            <div style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', fontWeight: '500', marginBottom: '16px' }}>
                                                ⚠️ Final submission cannot be edited after submitting.
                                            </div>
                                        )}
                                        <SubmissionForm
                                            type={activeForm?.submission ? activeForm.type : activeForm}
                                            initial={activeForm?.submission}
                                            teamRegistrationId={parseInt(teamRegistrationId)}
                                            onSubmit={handleSubmit}
                                            loading={formLoading} />
                                    </Card>
                                ) : (
                                    <Card style={{ textAlign: 'center', padding: '32px' }}>
                                        <FileText size={32} color="var(--text-secondary)" style={{ margin: '0 auto 12px', display: 'block' }} />
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                            Submissions are only available while the hackathon is active.
                                        </p>
                                    </Card>
                                )
                            ) : (
                                <Card style={{ textAlign: 'center', padding: '32px' }}>
                                    <FileText size={32} color="var(--text-secondary)" style={{ margin: '0 auto 12px', display: 'block' }} />
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        {hasFinal ? 'Your final submission is locked.' : isHackathonActive ? 'Select an action on the left to submit or update.' : 'Submissions are only available while the hackathon is active.'}
                                    </p>
                                </Card>
                            )}

                            {/* Stats */}
                            <Card style={{ marginTop: '16px' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '12px' }}>Summary</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { label: 'Progress Updates', value: progressSubs.length, color: 'var(--info-text)' },
                                        { label: 'Final Submitted', value: hasFinal ? 'Yes' : 'No', color: hasFinal ? 'var(--success-text)' : 'var(--danger-text)' },
                                        { label: 'Total Submissions', value: submissions.length, color: 'var(--brand)' },
                                    ].map(item => (
                                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</span>
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: item.color }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmissionPage;