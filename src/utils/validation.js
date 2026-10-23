/**
 * Lightweight validation rules used with react-hook-form's `validate` option.
 * A dedicated rule library keeps form definitions declarative and avoids a
 * schema-validation dependency.
 */

/** Corporate email pattern (HCL identities use an `@hcltech.com` address). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Employee identifiers are 4-10 uppercase alphanumerics, optionally dashed. */
const EMPLOYEE_ID_PATTERN = /^[A-Za-z0-9-]{4,10}$/;

export const validators = {
  required(message = 'This field is required') {
    return (value) => {
      if (value === null || value === undefined) return message;
      if (typeof value === 'string' && value.trim().length === 0) return message;
      if (Array.isArray(value) && value.length === 0) return message;
      return true;
    };
  },

  email(message = 'Enter a valid email address') {
    return (value) => {
      if (!value || value.trim().length === 0) return 'Email address is required';
      if (!EMAIL_PATTERN.test(value.trim())) return message;
      return true;
    };
  },

  corporateEmail(message = 'Use your HCL email address') {
    return (value) => {
      const basic = validators.email(message)(value);
      if (basic !== true) return basic;
      if (!value.trim().toLowerCase().endsWith('@hcltech.com')) return message;
      return true;
    };
  },

  employeeId(message = 'Enter a valid employee ID') {
    return (value) => {
      if (!value || value.trim().length === 0) return 'Employee ID is required';
      if (!EMPLOYEE_ID_PATTERN.test(value.trim())) return message;
      return true;
    };
  },

  minLength(min, message) {
    return (value) => {
      if (!value) return true;
      if (value.trim().length < min) return message ?? `Use at least ${min} characters`;
      return true;
    };
  },

  maxLength(max, message) {
    return (value) => {
      if (!value) return true;
      if (value.trim().length > max) return message ?? `Use at most ${max} characters`;
      return true;
    };
  },

  password(message = 'Password must be at least 8 characters') {
    return (value) => {
      if (!value || value.trim().length === 0) return 'Password is required';
      if (value.length < 8) return message;
      if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
        return 'Include at least one letter and one number';
      }
      return true;
    };
  },

  /** Rejects an email that is already present in a list of taken addresses. */
  uniqueEmail(taken) {
    return (value) => {
      if (!value) return true;
      const normalised = value.trim().toLowerCase();
      if (taken.some((email) => email.toLowerCase() === normalised)) {
        return 'This email is already enrolled';
      }
      return true;
    };
  },

  /** Ensures the end date is not before the start date. */
  dateOrder(startField, _endField) {
    return (value, values) => {
      if (!value || !values[startField]) return true;
      const start = new Date(String(values[startField]));
      const end = new Date(value);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true;
      return end >= start ? true : 'End date cannot be before the start date';
    };
  },
};
