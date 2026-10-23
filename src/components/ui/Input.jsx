import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

const FIELD_BASE =
  'w-full rounded-xl border bg-card text-sm text-ink shadow-sm transition duration-150 placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-600/25 disabled:cursor-not-allowed disabled:bg-elevated disabled:text-ink-muted';

function fieldClasses(error, className) {
  return cn(
    FIELD_BASE,
    error
      ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20'
      : 'border-line-strong hover:border-ink-subtle focus:border-brand-500',
    className,
  );
}

function FieldShell({ label, htmlFor, required, hint, error, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-medium text-ink">
          {label}
          {required ? (
            <span className="text-danger-500" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs font-medium text-danger-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { label, error, hint, icon, id, className, containerClassName, required, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <FieldShell
      label={label}
      htmlFor={inputId}
      required={required}
      hint={hint}
      error={error}
      className={containerClassName}
    >
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-subtle">
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={fieldClasses(error, cn('h-10 px-3.5', icon && 'pl-10', className))}
          {...props}
        />
      </div>
    </FieldShell>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, id, className, containerClassName, required, rows = 4, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <FieldShell
      label={label}
      htmlFor={inputId}
      required={required}
      hint={hint}
      error={error}
      className={containerClassName}
    >
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={fieldClasses(error, cn('resize-y px-3.5 py-2.5', className))}
        {...props}
      />
    </FieldShell>
  );
});

export const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    id,
    className,
    containerClassName,
    required,
    options = [],
    placeholder,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <FieldShell
      label={label}
      htmlFor={inputId}
      required={required}
      hint={hint}
      error={error}
      className={containerClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={fieldClasses(
            error,
            cn('h-10 appearance-none px-3.5 pr-9', className),
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  );
});

export function Checkbox({ label, description, id, className, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-3.5 transition hover:bg-elevated/60',
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong text-brand-600 accent-brand-600 focus:ring-brand-600"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-5 text-ink-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

export function Switch({ checked, onChange, label, description, id, disabled = false }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={inputId} className="block text-sm font-medium text-ink">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs leading-5 text-ink-muted">{description}</p>
        ) : null}
      </div>
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50',
          checked ? 'bg-brand-600' : 'bg-line-strong',
        )}
      >
        <span
          className={cn(
            'inline-block transform rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-[1.4rem]' : 'translate-x-1',
          )}
          style={{ height: '1.125rem', width: '1.125rem' }}
        />
      </button>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  label = 'Search',
  onClear,
}) {
  return (
    <div className={cn('relative', className)}>
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={fieldClasses(false, 'h-10 px-9 text-sm [&::-webkit-search-cancel-button]:hidden')}
      />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-subtle transition hover:bg-elevated hover:text-ink"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
