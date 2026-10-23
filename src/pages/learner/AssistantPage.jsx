import { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquareText, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ChatComposer } from '@/components/assistant/ChatComposer';
import { ChatMessage } from '@/components/assistant/ChatMessage';
import { SourcesPanel } from '@/components/assistant/SourcesPanel';
import { SuggestedQuestions } from '@/components/assistant/SuggestedQuestions';
import { TypingIndicator } from '@/components/assistant/TypingIndicator';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useAssistantConversation } from '@/hooks/useAssistantConversation';
import { useDocumentTitle } from '@/hooks/useUi';
import { useToast } from '@/hooks/useToast';
import { LEARNING_ROLE_LABELS } from '@/constants/roles';

/** Grounded project assistant with persistent conversation and source evidence. */
export function AssistantPage() {
  useDocumentTitle('AI Assistant');
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);
  const scrollRef = useRef(null);
  const {
    messages,
    suggestions,
    isTyping,
    error,
    activeSources,
    send,
    clear,
    selectMessage,
    setError,
  } = useAssistantConversation(user);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [messages.length, isTyping]);

  const handleSend = (question) => {
    setError(null);
    send(question);
  };

  const handleClear = () => {
    clear();
    setConfirmClear(false);
    toast.success('Conversation cleared', 'Your saved assistant history for this session has been removed.');
  };

  const roleLabel = LEARNING_ROLE_LABELS[user?.learningRole] ?? 'Learner';

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        eyebrow="Grounded assistance"
        title="AI Assistant"
        description="Ask questions about access, security, the application, your delivery lifecycle or testing practice. Answers use approved project content only."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmClear(true)}
            disabled={!messages.length}
            iconLeft={<Trash2 className="h-4 w-4" aria-hidden="true" />}
          >
            Clear conversation
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <Card className="flex h-[calc(100dvh-17rem)] min-h-[34rem] flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-sm">
                <Bot className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success-500" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Induction Assistant</p>
                <p className="text-2xs text-ink-subtle">
                  {roleLabel} scope · {user?.projectName ?? 'Project workspace'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="success" size="sm" icon={<ShieldCheck className="h-3 w-3" />}>
                Grounded
              </Badge>
              <Badge tone="neutral" size="sm" className="hidden sm:inline-flex">
                {activeSources.length} sources
              </Badge>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-5 overflow-y-auto scrollbar-thin px-4 py-5 sm:px-5"
            aria-live="polite"
            aria-label="Conversation"
          >
            {messages.length === 0 ? (
              <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-elevated">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-ink">
                  What would you like to know?
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-ink-muted">
                  I can explain project processes, find approved setup guidance and point you to the
                  right module. Every answer includes its sources.
                </p>
                <div className="mt-5 grid w-full grid-cols-1 gap-2 text-left sm:grid-cols-3">
                  {[
                    { icon: ShieldCheck, text: 'How do I handle client data?' },
                    { icon: MessageSquareText, text: 'How do I request environment access?' },
                    { icon: Sparkles, text: 'What is expected in a pull request?' },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="rounded-xl border border-line bg-elevated/40 p-3"
                    >
                      <item.icon className="h-4 w-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                      <p className="mt-1.5 text-2xs leading-5 text-ink-muted">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  user={user}
                  onSelectSources={(selected) => selectMessage(selected.id)}
                />
              ))
            )}
            {isTyping ? <TypingIndicator /> : null}
            {error ? (
              <Callout variant="danger" title="The assistant could not answer">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="rounded font-semibold text-danger-700 underline-offset-2 hover:underline dark:text-danger-300"
                  >
                    Dismiss
                  </button>
                </div>
              </Callout>
            ) : null}
            <div />
          </div>

          <div className="border-t border-line bg-card px-4 py-3 sm:px-5">
            {suggestions.length ? (
              <SuggestedQuestions
                suggestions={suggestions.slice(0, 3)}
                onSelect={handleSend}
                disabled={isTyping}
                className="mb-2.5 hidden sm:flex"
              />
            ) : null}
            <ChatComposer onSubmit={handleSend} isTyping={isTyping} />
            <p className="mt-2 text-center text-2xs text-ink-subtle">
              The assistant does not guess. If approved content does not cover a topic, it will say so.
            </p>
          </div>
        </Card>

        <Card className="hidden h-[calc(100dvh-17rem)] min-h-[34rem] overflow-hidden xl:flex">
          <SourcesPanel sources={activeSources} className="w-full" />
        </Card>
      </div>

      <Card className="overflow-hidden xl:hidden">
        <SourcesPanel sources={activeSources} />
      </Card>

      <ConfirmDialog
        open={confirmClear}
        title="Clear this conversation?"
        description="The messages and source references for this user will be removed from this browser. This cannot be undone."
        confirmLabel="Clear conversation"
        onConfirm={handleClear}
        onClose={() => setConfirmClear(false)}
      />
    </div>
  );
}
