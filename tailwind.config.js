/**
 * Tailwind CSS v3.4 configuration.
 *
 * Design language: Microsoft Copilot / Microsoft Learn / Azure Portal inspired
 * enterprise SaaS. Semantic surface tokens are backed by CSS custom properties
 * (see src/index.css) so light and dark themes share a single component codebase.
 */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary - Microsoft Fluent blue
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Accent - Indigo
        accent: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Semantic surface tokens (CSS variables - see index.css)
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-hover': 'rgb(var(--card-hover) / <alpha-value>)',
        line: 'rgb(var(--border) / <alpha-value>)',
        'line-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        ink: 'rgb(var(--foreground) / <alpha-value>)',
        'ink-muted': 'rgb(var(--foreground-muted) / <alpha-value>)',
        'ink-subtle': 'rgb(var(--foreground-subtle) / <alpha-value>)',
        // Status
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Segoe UI Variable',
          'Segoe UI',
          'system-ui',
          '-apple-system',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['Cascadia Code', 'Consolas', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)',
        elevated: '0 4px 12px -2px rgb(15 23 42 / 0.10), 0 2px 6px -2px rgb(15 23 42 / 0.05)',
        overlay: '0 20px 45px -12px rgb(15 23 42 / 0.22), 0 8px 16px -8px rgb(15 23 42 / 0.12)',
        focus: '0 0 0 3px rgb(37 99 235 / 0.35)',
        'focus-danger': '0 0 0 3px rgb(220 38 38 / 0.30)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        sidebar: '17rem',
        'sidebar-collapsed': '4.75rem',
        header: '4rem',
      },
      maxWidth: {
        content: '96rem',
        prose: '46rem',
      },
      transitionTimingFunction: {
        swift: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { opacity: '0.25', transform: 'translateY(0)' },
          '30%': { opacity: '1', transform: 'translateY(-3px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.15)', opacity: '0' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-up': 'fade-in-up 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 160ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-left': 'slide-in-left 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slide-in-right 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        shimmer: 'shimmer 1.6s infinite',
        'typing-dot': 'typing-dot 1.2s infinite ease-in-out',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
