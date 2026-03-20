"use client";

import { InputHTMLAttributes, forwardRef } from "react";

// ---- Input Field ----
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-surface-900/70"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-xl border px-3.5 py-2.5 text-sm text-surface-950 placeholder:text-surface-900/30 transition-all focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400"
              : "border-surface-200 bg-white focus:ring-brand-100 focus:border-brand-400"
          }`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
InputField.displayName = "InputField";

// ---- Textarea Field ----
interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-surface-900/70"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={`block w-full rounded-xl border px-3.5 py-2.5 text-sm text-surface-950 placeholder:text-surface-900/30 transition-all focus:outline-none focus:ring-2 resize-none ${
            error
              ? "border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400"
              : "border-surface-200 bg-white focus:ring-brand-100 focus:border-brand-400"
          }`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
TextareaField.displayName = "TextareaField";

// ---- Checkbox Field ----
interface CheckboxFieldProps {
  label: React.ReactNode;
  error?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

export function CheckboxField({ label, error, checked, onChange, id }: CheckboxFieldProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
        />
        <span className="text-sm text-surface-900/60 leading-relaxed">
          {label}
        </span>
      </label>
      {error && <p className="text-xs text-red-600 ml-7">{error}</p>}
    </div>
  );
}

// ---- Submit Button ----
interface SubmitButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function SubmitButton({ loading, children, loadingText = "Procesando..." }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-700/20 transition-all hover:bg-brand-800 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// ---- Alert ----
interface AlertProps {
  type: "error" | "success" | "info" | "warning";
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    info: "bg-brand-50 border-brand-200 text-brand-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
