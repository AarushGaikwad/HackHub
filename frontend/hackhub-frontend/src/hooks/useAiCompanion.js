import { useCallback, useEffect, useRef, useState } from 'react';
import { sendCompanionMessage } from '../api/aiApi';

const COOLDOWN_MS = 4000;

const INITIAL_MESSAGE = {
    role: 'model',
    content: "Hi! I'm HackBot 🤖.What can I help you with?"
};

export const useAiCompanion = () => {

    const [messages, setMessages] = useState([
        INITIAL_MESSAGE
    ]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);

    const [cooldown, setCooldown] = useState(false);

    const cooldownRef = useRef(null);

    useEffect(() => {

        return () => {

            if (cooldownRef.current) {
                clearTimeout(cooldownRef.current);
            }

        };

    }, []);

    const sendMessage = useCallback(async (text) => {

        const trimmedText = text?.trim();

        if (!trimmedText ||
            loading ||
            cooldown) {
            return;
        }

        setError(null);

        const conversationHistory =
            messages.filter(
                message =>
                    message !== INITIAL_MESSAGE
            );

        const userMessage = {
            role: 'user',
            content: trimmedText
        };

        const nextMessages = [
            ...messages,
            userMessage
        ];

        setMessages(nextMessages);

        setLoading(true);

        setCooldown(true);

        cooldownRef.current = setTimeout(() => {
            setCooldown(false);
        }, COOLDOWN_MS);

        try {

            const reply =
                await sendCompanionMessage(
                    trimmedText,
                    conversationHistory
                );

            setMessages(prev => [
                ...prev,
                {
                    role: 'model',
                    content: reply
                }
            ]);

        } catch (err) {

            console.error(
                'HackBot error:',
                err
            );

            const status =
                err?.response?.status;

            if (status === 429) {

                setError(
                    'HackBot is busy right now. Please try again in a few seconds.'
                );

            } else if (status === 503) {

                setError(
                    'HackBot is temporarily unavailable. Please try again shortly.'
                );

            } else {

                setError(
                    'Something went wrong. Please try again.'
                );
            }

            /*
             * Remove the user message if the request failed.
             */
            setMessages(prev =>
                prev.slice(0, -1)
            );
        } finally {

            setLoading(false);
        }

    }, [
        messages,
        loading,
        cooldown
    ]);

    const clearConversation = useCallback(() => {

        setMessages([
            INITIAL_MESSAGE
        ]);

        setError(null);

    }, []);

    return {
        messages,
        sendMessage,
        clearConversation,
        loading,
        error,
        cooldown
    };
};