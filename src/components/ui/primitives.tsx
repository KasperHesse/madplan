import { useEffect, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type BtnVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  variant = "secondary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const base =
    "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles: Record<BtnVariant, string> = {
    primary: "bg-teal-700 text-white hover:bg-teal-800",
    secondary: "bg-white border border-slate-300 hover:bg-slate-100",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300",
    ghost: "hover:bg-slate-100",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...rest} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 " +
        (props.className ?? "")
      }
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 " +
        (props.className ?? "")
      }
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 " +
        (props.className ?? "")
      }
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-slate-600 mb-0.5">
      {children}
    </label>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center text-slate-500 py-8 border border-dashed border-slate-300 rounded-lg">
      {children}
    </div>
  );
}

/**
 * Number field that keeps its own raw text while focused, so the user can
 * clear it completely (including a leading "0") instead of fighting a
 * controlled value that snaps back. Emits `undefined` when empty/invalid.
 */
export function NumberInput({
  value,
  onChange,
  placeholder,
  className = "",
  min,
  step,
  title,
  disabled,
}: {
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  step?: number | string;
  title?: string;
  disabled?: boolean;
}) {
  const [raw, setRaw] = useState(value == null ? "" : String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setRaw(value == null ? "" : String(value));
  }, [value, focused]);

  return (
    <Input
      type="number"
      inputMode="decimal"
      value={raw}
      min={min}
      step={step}
      title={title}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      onFocus={(e) => {
        setFocused(true);
        e.currentTarget.select();
      }}
      onBlur={() => {
        setFocused(false);
        setRaw(value == null ? "" : String(value));
      }}
      onChange={(e) => {
        const text = e.target.value;
        setRaw(text);
        if (text.trim() === "") {
          onChange(undefined);
          return;
        }
        const n = parseFloat(text);
        onChange(Number.isFinite(n) ? n : undefined);
      }}
    />
  );
}

/** Small chevron used by collapsible sections. */
export function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-block transition-transform text-slate-500 ${open ? "rotate-90" : ""}`}
      aria-hidden
    >
      ▶
    </span>
  );
}

export function IconButton({
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`px-1.5 py-0.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent ${className}`}
      {...rest}
    />
  );
}
