import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/common/Callout';
import { Input } from '@/components/ui/Input';
import { DEMO_ACCOUNTS, ROLE_LABELS } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { validators } from '@/utils/validation';
import { cn } from '@/utils/cn';

function MicrosoftIcon() {
  return (
    <span className="grid h-4 w-4 grid-cols-2 gap-0.5" aria-hidden="true">
      <span className="bg-[#f25022]" />
      <span className="bg-[#7fba00]" />
      <span className="bg-[#00a4ef]" />
      <span className="bg-[#ffb900]" />
    </span>
  );
}

/** Sign-in screen with SSO, email credentials and one-click demo identities. */
export function LoginPage() {
  const { login, loginWithMicrosoft } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const [demoBusy, setDemoBusy] = useState(null);
  const [ssoBusy, setSsoBusy] = useState(false);

  const from = location.state?.from?.pathname ?? ROUTES.dashboard;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const finish = (session) => {
    toast.success(
      `Welcome back, ${session.user.name.split(' ')[0]}`,
      `${ROLE_LABELS[session.user.role]} workspace · ${session.user.projectName}`,
    );
    navigate(from, { replace: true });
  };

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      const session = await login(values);
      finish(session);
    } catch (error) {
      setFormError(error?.message ?? 'Unable to sign in. Please try again.');
    }
  };

  const handleDemo = async (account) => {
    setFormError(null);
    setDemoBusy(account.id);
    setValue('email', account.email);
    setValue('password', account.password);
    try {
      const session = await login({ email: account.email, password: account.password });
      finish(session);
    } catch (error) {
      setFormError(error?.message ?? 'Unable to sign in with the demo account.');
    } finally {
      setDemoBusy(null);
    }
  };

  const handleMicrosoft = async () => {
    setFormError(null);
    setSsoBusy(true);
    try {
      const session = await loginWithMicrosoft();
      finish(session);
    } catch (error) {
      setFormError(error?.message ?? 'Microsoft sign-in failed. Please try again.');
    } finally {
      setSsoBusy(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-7">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.12em] text-brand-700 dark:border-brand-500/20 dark:bg-brand-600/15 dark:text-brand-300">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Secure SSO workspace
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
          Sign in to your induction
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-ink-muted">
          Use your HCLTech identity to access your project-scoped learning path, assistant and
          readiness evidence.
        </p>
      </div>

      {formError ? (
        <Callout variant="danger" title="Sign-in failed" className="mb-5" icon={ShieldCheck}>
          {formError}
        </Callout>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full justify-center"
        onClick={handleMicrosoft}
        isLoading={ssoBusy}
        iconLeft={<MicrosoftIcon />}
      >
        Continue with Microsoft
      </Button>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
        <span className="text-2xs font-medium uppercase tracking-wide text-ink-subtle">
          or use project credentials
        </span>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="name@hcltech.com"
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          error={errors.email?.message}
          required
          {...register('email', { validate: validators.email() })}
        />

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              icon={<LockKeyhole className="h-4 w-4" aria-hidden="true" />}
              error={errors.password?.message}
              required
              className="pr-11"
              {...register('password', {
                validate: validators.required('Password is required'),
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-[1.9rem] rounded-md p-1.5 text-ink-subtle transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              defaultChecked
              className="h-3.5 w-3.5 rounded border-line-strong text-brand-600 accent-brand-600 focus:ring-brand-600"
            />
            Keep me signed in on this device
          </label>
          <span className="text-xs font-medium text-ink-subtle">SSO managed</span>
        </div>

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

      <div className="mt-7">
        <div className="flex items-center justify-between gap-2">
          <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            Demo access
          </p>
          <span className="text-2xs text-ink-subtle">One click · no password</span>
        </div>
        <div className="mt-2.5 grid gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => handleDemo(account)}
              disabled={Boolean(demoBusy) || ssoBusy}
              className={cn(
                'group flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-3.5 py-2.5 text-left shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:pointer-events-none disabled:opacity-60 dark:hover:border-brand-500/30 dark:hover:bg-brand-600/10',
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-2xs font-semibold text-ink-muted">
                  {account.initials}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-ink">
                    {account.label} · {ROLE_LABELS[account.id === 'manager' ? 'manager' : 'learner']}
                  </span>
                  <span className="block truncate text-2xs text-ink-subtle">
                    {account.email} · {account.description}
                  </span>
                </span>
              </span>
              <span
                className={cn(
                  'shrink-0 text-2xs font-semibold',
                  demoBusy === account.id ? 'text-brand-600' : 'text-ink-subtle group-hover:text-brand-600',
                )}
              >
                {demoBusy === account.id ? 'Signing in…' : 'Use account'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 flex items-start gap-2 text-2xs leading-5 text-ink-subtle">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-500" aria-hidden="true" />
        Access is project-scoped and audited. By signing in you accept the HCLTech information
        handling policy.
      </p>
    </div>
  );
}
