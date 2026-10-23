import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input, Select, Switch } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { LEARNING_ROLE_LABELS, ROLE_LABELS } from '@/constants/roles';
import { STORAGE_KEYS, THEMES } from '@/constants/storage';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences } from '@/hooks/usePreferences';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useUi';
import { clearAppStorage } from '@/utils/storage';
import { formatDateInTimeZone } from '@/utils/date';

const TIME_ZONES = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (Asia/Kolkata)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (Asia/Singapore)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (Asia/Dubai)' },
  { value: 'Europe/London', label: 'United Kingdom (Europe/London)' },
  { value: 'Europe/Berlin', label: 'Central European Time (Europe/Berlin)' },
  { value: 'America/New_York', label: 'Eastern Time (America/New_York)' },
  { value: 'America/Chicago', label: 'Central Time (America/Chicago)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (America/Los_Angeles)' },
];

const TABS = [
  { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" aria-hidden="true" /> },
  { id: 'profile', label: 'Profile', icon: <UserRound className="h-4 w-4" aria-hidden="true" /> },
  { id: 'workspace', label: 'Workspace', icon: <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> },
];

const DEMO_DATA_KEYS = [
  STORAGE_KEYS.moduleProgress,
  STORAGE_KEYS.bookmarks,
  STORAGE_KEYS.quizAttempts,
  STORAGE_KEYS.assistantConversations,
  STORAGE_KEYS.enrollmentOverrides,
  STORAGE_KEYS.documents,
  STORAGE_KEYS.notifications,
  STORAGE_KEYS.mockSeedVersion,
];

/** Organisation-provided identity fields, shown as read only. */
function OrgRecord({ user, timezone }) {
  const rows = [
    { label: 'Employee ID', value: user?.employeeId },
    { label: 'Work email', value: user?.email },
    { label: 'Job title', value: user?.title },
    { label: 'Department', value: user?.department },
    { label: 'Location', value: user?.location },
    { label: 'Reporting to', value: user?.managerName },
    { label: 'Project', value: user?.projectName },
    { label: 'Joined', value: formatDateInTimeZone(user?.joinedAt, timezone) },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Organisation record</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Managed by your organisation and read-only here.
          </p>
        </div>
        <Badge tone="neutral" size="sm">
          Read only
        </Badge>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-2xs uppercase tracking-wide text-ink-subtle">{row.label}</dt>
            <dd className="mt-0.5 truncate text-sm text-ink">{row.value ?? '—'}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-3">
        <Badge tone="brand" size="sm">
          {ROLE_LABELS[user?.role] ?? 'Member'}
        </Badge>
        {user?.learningRole ? (
          <Badge tone="accent" size="sm">
            {LEARNING_ROLE_LABELS[user.learningRole]}
          </Badge>
        ) : null}
      </div>
    </Card>
  );
}

/** Workspace preferences: appearance, personal details, notifications and session. */
export function SettingsPage() {
  const { user: sessionUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    profile,
    notifications,
    effectiveUser,
    updateProfile,
    updateNotifications,
    resetProfile,
    resetNotifications,
  } = usePreferences();

  const [tab, setTab] = useState('appearance');
  const [confirmReset, setConfirmReset] = useState(false);

  useDocumentTitle('Settings');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      displayName: profile.displayName,
      contactEmail: profile.contactEmail,
      department: profile.department,
      location: profile.location,
    },
  });

  useEffect(() => {
    reset({
      displayName: profile.displayName,
      contactEmail: profile.contactEmail,
      department: profile.department,
      location: profile.location,
    });
  }, [profile, reset]);

  const onSaveProfile = (values) => {
    updateProfile({
      displayName: values.displayName.trim(),
      contactEmail: values.contactEmail.trim(),
      department: values.department.trim(),
      location: values.location.trim(),
    });
    toast.success('Profile updated', 'Your preferences have been saved on this device.');
  };

  const onResetProfile = () => {
    resetProfile();
    toast.info('Profile reset', 'Your personal details are back to the organisation record.');
  };

  const onResetWorkspace = () => {
    resetNotifications();
    updateProfile({ timezone: 'Asia/Kolkata' });
    toast.info('Workspace reset', 'Notification and time zone preferences are back to default.');
  };

  const onResetDemoData = () => {
    clearAppStorage(DEMO_DATA_KEYS);
    setConfirmReset(false);
    toast.success('Demo data reset', 'Progress, attempts and uploads are back to their seeded state.');
    window.location.reload();
  };

  const onSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Personalise how the workspace looks and how you are addressed. Changes are stored on this device."
      />

      <Tabs
        tabs={TABS}
        value={tab}
        onChange={setTab}
        ariaLabel="Settings sections"
        variant="underline"
      />

      {tab === 'appearance' ? (
        <div
          id="panel-appearance"
          role="tabpanel"
          aria-labelledby="tab-appearance"
          className="space-y-5"
        >
          <Card className="p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-300">
                <Palette className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">Colour theme</h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Applies immediately across the whole platform.
                </p>
              </div>
            </div>

            <fieldset className="mt-5">
              <legend className="sr-only">Colour theme</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {THEMES.map((option) => {
                  const selected = theme === option;
                  const Icon = option === 'dark' ? Moon : Sun;
                  return (
                    <label
                      key={option}
                      className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 ${
                        selected
                          ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500 dark:bg-brand-600/10'
                          : 'border-line bg-card hover:border-line-strong hover:bg-elevated/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={option}
                        checked={selected}
                        onChange={() => setTheme(option)}
                        className="peer sr-only"
                      />
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          selected
                            ? 'bg-brand-600 text-white'
                            : 'bg-elevated text-ink-muted'
                        }`}
                        aria-hidden="true"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium capitalize text-ink">
                          {option}
                        </span>
                        <span className="block text-xs text-ink-muted">
                          {option === 'dark'
                            ? 'Comfortable in low light environments'
                            : 'Maximum contrast for bright rooms'}
                        </span>
                      </span>
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-line-strong'
                        }`}
                        aria-hidden="true"
                      >
                        {selected ? <Monitor className="h-2.5 w-2.5" /> : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </Card>
        </div>
      ) : null}

      {tab === 'profile' ? (
        <div
          id="panel-profile"
          role="tabpanel"
          aria-labelledby="tab-profile"
          className="grid gap-5 xl:grid-cols-2"
        >
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Personal details</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Used for greetings and in reports you share with your manager.
            </p>

            <form onSubmit={handleSubmit(onSaveProfile)} className="mt-5 space-y-4" noValidate>
              <Input
                label="Display name"
                hint="Leave blank to use your organisation name."
                error={errors.displayName?.message}
                {...register('displayName', { maxLength: 80 })}
              />
              <Input
                label="Contact email"
                type="email"
                placeholder="you@company.com"
                hint="Where readiness summaries are sent."
                error={errors.contactEmail?.message}
                {...register('contactEmail', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address.',
                  },
                })}
              />
              <Input
                label="Team or department"
                placeholder="Retail Banking"
                error={errors.department?.message}
                {...register('department', { maxLength: 80 })}
              />
              <Input
                label="Location"
                placeholder="Pune, India"
                error={errors.location?.message}
                {...register('location', { maxLength: 80 })}
              />

              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <Button type="submit" size="sm" disabled={!isDirty}>
                  Save changes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onResetProfile}
                  iconLeft={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
                >
                  Reset to record
                </Button>
              </div>
            </form>
          </Card>

          <OrgRecord user={sessionUser} timezone={profile.timezone} />
        </div>
      ) : null}

      {tab === 'workspace' ? (
        <div
          id="panel-workspace"
          role="tabpanel"
          aria-labelledby="tab-workspace"
          className="grid gap-5 xl:grid-cols-2"
        >
          <Card className="p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-300">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">Notifications</h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Choose which updates appear in your inbox.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Switch
                label="Deadline reminders"
                description="Assessment deadlines and expiring mandatory modules."
                checked={notifications.deadlineReminders}
                onChange={(value) => updateNotifications({ deadlineReminders: value })}
              />
              <Switch
                label="Assessment results"
                description="Quiz availability, pass marks and readiness report updates."
                checked={notifications.assessmentResults}
                onChange={(value) => updateNotifications({ assessmentResults: value })}
              />
              <Switch
                label="Content and enrolment updates"
                description="Newly indexed documents and changes to your project roster."
                checked={notifications.contentUpdates}
                onChange={(value) => updateNotifications({ contentUpdates: value })}
              />
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onResetWorkspace}
                iconLeft={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
              >
                Reset workspace preferences
              </Button>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink">Region and time</h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Dates and times are shown in the zone you choose.
              </p>
              <div className="mt-4">
                <Select
                  label="Time zone"
                  options={TIME_ZONES}
                  value={profile.timezone}
                  onChange={(event) => updateProfile({ timezone: event.target.value })}
                />
              </div>
              <p className="mt-3 text-2xs leading-5 text-ink-subtle">
                Joined {formatDateInTimeZone(sessionUser?.joinedAt, profile.timezone)} · Signed in as{' '}
                {effectiveUser?.email ?? '—'}
              </p>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink">Demo data</h2>
              <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                Restore module progress, quiz attempts and uploaded documents to their seeded
                state. You will stay signed in.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmReset(true)}
                  iconLeft={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
                >
                  Reset demo data
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={onSignOut}>
                  Sign out
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmReset}
        title="Reset all demo data?"
        description="Module progress, quiz attempts, assistant conversations and uploaded documents return to their seeded state. This cannot be undone."
        confirmLabel="Reset data"
        onConfirm={onResetDemoData}
        onClose={() => setConfirmReset(false)}
      />
    </div>
  );
}
