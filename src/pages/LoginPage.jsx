import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { DEMO_ACCOUNTS } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useUi';
import { cn } from '@/utils/cn';

/** Microsoft four-square mark, drawn inline so no extra dependency is needed. */
function MicrosoftMark({ className }) {
  return (
    <svg viewBox="0 0 21 21" className={cn('h-4 w-4', className)} aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

/** Sign-in screen for the induction workspace. */
export function LoginPage() {
  const { login, loginWithMicrosoft } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const [microsoftPending, setMicrosoftPending] = useState(false);

  useDocumentTitle('Sign in');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const destination = location.state?.from?.pathname ?? ROUTES.dashboard;

  const onSubmit = async (values) => {
    setFormError('');
    try {
      await login(values);
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(error?.message ?? 'We could not sign you in. Please try again.');
    }
  };

  const onMicrosoftSignIn = async () => {
    setMicrosoftPending(true);
    setFormError('');
    try {
      await loginWithMicrosoft();
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(error?.message ?? 'Microsoft sign-in is unavailable right now.');
      setMicrosoftPending(false);
    }
  };

  const applyDemoAccount = (account) => {
    setValue('email', account.email, { shouldValidate: true });
    setValue('password', account.password, { shouldValidate: true });
    setFormError('');
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in to your workspace</h1>
        <p className="mt-1.5 text-sm leading-6 text-ink-muted">
          Use your organisation account to continue to the project induction workspace.
        </p>
      </div>

      <Card className="p-6">
        <Button
          size="lg"
          className="w-full justify-center"
          onClick={onMicrosoftSignIn}
          isLoading={microsoftPending}
          iconLeft={<MicrosoftMark />}
        >
          Sign in with Microsoft
        </Button>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          <span className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            or use email
          </span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            icon={<Mail className="h-4 w-4" aria-hidden="true" />}
            error={errors.email?.message}
            {...register('email', {
              required: 'Enter your work email.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address.',
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={<Lock className="h-4 w-4" aria-hidden="true" />}
            error={errors.password?.message}
            {...register('password', { required: 'Enter your password.' })}
          />

          {formError ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-xs font-medium text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-300"
            >
              <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full justify-center"
            isLoading={isSubmitting}
            iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          >
            Sign in
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
          Demo identities
        </p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          Choose an identity to prefill the form and explore both role experiences.
        </p>
        <div className="mt-4 space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => applyDemoAccount(account)}
              className="flex w-full items-center gap-3 rounded-xl border border-line bg-card p-3 text-left transition hover:border-line-strong hover:bg-elevated/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-600/15 dark:text-brand-300">
                {account.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink">{account.label}</span>
                <span className="block truncate text-xs text-ink-muted">{account.description}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <p className="text-center text-2xs leading-5 text-ink-subtle">
        Access is limited to approved project members. All activity is logged for compliance.
      </p>
    </div>
  );
}
