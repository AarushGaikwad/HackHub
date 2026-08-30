import { useEffect, useRef, useState } from 'react';
import { useAiCompanion } from '../../hooks/useAiCompanion';

const AiCompanionWidget = () => {

    const [open, setOpen] = useState(false);

    const [input, setInput] = useState('');

    const messagesEndRef = useRef(null);

    const {
        messages,
        sendMessage,
        clearConversation,
        loading,
        error,
        cooldown
    } = useAiCompanion();

    useEffect(() => {

        if (open) {

            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth'
            });
        }

    }, [
        messages,
        open,
        loading
    ]);

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!input.trim() ||
            loading ||
            cooldown) {
            return;
        }

        const message = input;

        setInput('');

        await sendMessage(message);
    };

    const handleKeyDown = (event) => {

        if (
            event.key === 'Enter' &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSubmit(event);
        }
    };

    return (
        <>
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '90px',
                        right: '24px',
                        width: '360px',
                        height: '520px',
                        background: '#ffffff',
                        borderRadius: '16px',
                        boxShadow:
                            '0 10px 40px rgba(0,0,0,0.18)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        zIndex: 9999,
                        border: '1px solid #e5e7eb'
                    }}
                >

                    {/* Header */}
                    <div
                        style={{
                            padding: '16px',
                            background: '#111827',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >

                        <div>
                            <div
                                style={{
                                    fontWeight: '700',
                                    fontSize: '16px'
                                }}
                            >
                                🤖 HackBot
                            </div>

                            <div
                                style={{
                                    fontSize: '12px',
                                    opacity: 0.75,
                                    marginTop: '3px'
                                }}
                            >
                                Your HackHub companion
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: '8px'
                            }}
                        >

                            <button
                                type="button"
                                onClick={clearConversation}
                                title="Clear conversation"
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                ↻
                            </button>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    fontSize: '20px'
                                }}
                            >
                                ×
                            </button>

                        </div>

                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            background: '#f9fafb'
                        }}
                    >

                        {messages.map((message, index) => (

                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent:
                                        message.role === 'user'
                                            ? 'flex-end'
                                            : 'flex-start',
                                    marginBottom: '12px'
                                }}
                            >

                                <div
                                    style={{
                                        maxWidth: '80%',
                                        padding:
                                            '10px 13px',
                                        borderRadius:
                                            '12px',
                                        background:
                                            message.role === 'user'
                                                ? '#2563eb'
                                                : '#ffffff',
                                        color:
                                            message.role === 'user'
                                                ? '#ffffff'
                                                : '#111827',
                                        boxShadow:
                                            message.role === 'user'
                                                ? 'none'
                                                : '0 1px 3px rgba(0,0,0,0.08)',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        whiteSpace:
                                            'pre-wrap'
                                    }}
                                >
                                    {message.content}
                                </div>

                            </div>

                        ))}

                        {loading && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent:
                                        'flex-start',
                                    marginBottom: '12px'
                                }}
                            >

                                <div
                                    style={{
                                        padding:
                                            '10px 13px',
                                        background:
                                            '#ffffff',
                                        borderRadius:
                                            '12px',
                                        fontSize: '14px',
                                        color: '#6b7280'
                                    }}
                                >
                                    HackBot is thinking...
                                </div>

                            </div>
                        )}

                        {error && (
                            <div
                                style={{
                                    padding: '10px',
                                    marginTop: '8px',
                                    borderRadius: '8px',
                                    background: '#fef2f2',
                                    color: '#b91c1c',
                                    fontSize: '13px'
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div ref={messagesEndRef} />

                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            padding: '12px',
                            background: '#ffffff',
                            borderTop:
                                '1px solid #e5e7eb'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                gap: '8px'
                            }}
                        >

                            <textarea
                                value={input}
                                onChange={event =>
                                    setInput(
                                        event.target.value
                                    )
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Ask HackBot..."
                                disabled={loading}
                                rows={1}
                                style={{
                                    flex: 1,
                                    resize: 'none',
                                    border:
                                        '1px solid #d1d5db',
                                    borderRadius: '10px',
                                    padding: '9px 11px',
                                    outline: 'none',
                                    fontSize: '14px',
                                    fontFamily:
                                        'inherit'
                                }}
                            />

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    cooldown ||
                                    !input.trim()
                                }
                                style={{
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding:
                                        '0 14px',
                                    background:
                                        loading ||
                                        cooldown ||
                                        !input.trim()
                                            ? '#9ca3af'
                                            : '#2563eb',
                                    color: '#ffffff',
                                    cursor:
                                        loading ||
                                        cooldown ||
                                        !input.trim()
                                            ? 'not-allowed'
                                            : 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Send
                            </button>

                        </div>

                        {cooldown && !loading && (
                            <div
                                style={{
                                    fontSize: '11px',
                                    color: '#6b7280',
                                    marginTop: '5px'
                                }}
                            >
                                Please wait a moment...
                            </div>
                        )}

                    </form>

                </div>
            )}

            {/* Floating button */}
            {!open && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    title="Open HackBot"
                    style={{
                        position: 'fixed',
                        right: '24px',
                        bottom: '24px',
                        width: '58px',
                        height: '58px',
                        borderRadius: '50%',
                        border: 'none',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontSize: '26px',
                        cursor: 'pointer',
                        boxShadow:
                            '0 6px 20px rgba(0,0,0,0.2)',
                        zIndex: 9999
                    }}
                >
                    🤖
                </button>
            )}
        </>
    );
};

export default AiCompanionWidget;