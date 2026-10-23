import { useCallback, useEffect, useState } from 'react';
import { assistantService } from '@/services/assistant/assistantService';
import { STORAGE_KEYS } from '@/constants/storage';
import { createId, nowIso } from '@/utils';
import { useLocalStorage } from './useLocalStorage';

/**
 * Conversation state for the assistant. Persists locally per user and keeps the
 * source panel in sync with the message the learner is reading.
 */
export function useAssistantConversation(user) {
  const storageKey = `${STORAGE_KEYS.assistantConversations}.${user?.id ?? 'anonymous'}`;
  const [messages, setMessages] = useLocalStorage(storageKey, []);
  const [defaultSuggestions, setDefaultSuggestions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);

  useEffect(() => {
    let active = true;
    assistantService
      .suggestions()
      .then((items) => {
        if (!active) return;
        setDefaultSuggestions(items);
        setSuggestions((current) => (current.length ? current : items));
      })
      .catch(() => {
        if (active) setDefaultSuggestions([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
  const activeMessage =
    messages.find((message) => message.id === activeMessageId) ?? lastAssistant ?? null;
  const activeSources = activeMessage?.sources ?? [];

  const send = useCallback(
    async (rawQuestion) => {
      const question = String(rawQuestion ?? '').trim();
      if (!question || isTyping) return null;
      setError(null);
      const userMessage = {
        id: createId('msg'),
        role: 'user',
        content: question,
        createdAt: nowIso(),
        sources: [],
      };
      setMessages((current) => [...current, userMessage]);
      setIsTyping(true);
      try {
        const reply = await assistantService.ask(question);
        const assistantMessage = {
          id: reply.messageId,
          role: 'assistant',
          content: reply.content,
          createdAt: nowIso(),
          sources: reply.sources ?? [],
          noAnswer: reply.noAnswer,
          intent: reply.intent,
        };
        setMessages((current) => [...current, assistantMessage]);
        setSuggestions(reply.suggestedQuestions ?? []);
        setActiveMessageId(assistantMessage.id);
        return assistantMessage;
      } catch (caught) {
        setError(caught?.message ?? 'The assistant could not answer right now.');
        return null;
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, setMessages],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setActiveMessageId(null);
    setError(null);
    setSuggestions(defaultSuggestions);
  }, [defaultSuggestions, setMessages]);

  const selectMessage = useCallback((messageId) => {
    setActiveMessageId(messageId);
  }, []);

  return {
    messages,
    suggestions,
    isTyping,
    error,
    activeSources,
    activeMessageId: activeMessage?.id ?? null,
    send,
    clear,
    selectMessage,
    setError,
  };
}
