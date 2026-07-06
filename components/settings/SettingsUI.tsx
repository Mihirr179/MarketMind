"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { PropsWithChildren, useEffect, useId } from "react";


import React from "react";

export function SettingsPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm sm:text-base text-[var(--mm-muted)] max-w-2xl">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--mm-muted)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--mm-border)] bg-white/5 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-[var(--accent)]" />
            Live preferences
          </span>
        </div>
      </div>
    </div>
  );
}

export function SettingsCard({
  title,
  description,
  right,
  children,
  className = "",
}: PropsWithChildren<{
  title: string;
  description?: string;
  right?: React.ReactNode;
  className?: string;
}>) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={
        "rounded-2xl border border-[var(--mm-border)] bg-[color:var(--mm-card)]/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(250,204,21,0.0)] " +
        "transition-colors duration-300 hover:border-[var(--mm-accent-border)] " +
        className
      }
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--mm-muted)]">
              Settings
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-2 text-sm text-[var(--mm-muted)] leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
          {right ? <div className="sm:pt-1">{right}</div> : null}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </motion.section>
  );
}

export function SectionDivider() {
  return <div className="h-px bg-[var(--mm-border)]/70 my-5" />;
}

export function FieldLabel({ children }: PropsWithChildren) {
  return <div className="text-sm font-semibold text-[var(--mm-text)]">{children}</div>;
}

export function FieldHint({ children }: PropsWithChildren) {
  return <div className="mt-1 text-xs text-[var(--mm-muted)]">{children}</div>;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--mm-border)] bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--mm-accent)] focus:ring-2 focus:ring-[var(--mm-accent)]/30"
      />
    </div>
  );
}

export function SelectChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              "rounded-xl border px-4 py-2 text-sm font-semibold transition " +
              (active
                ? "border-[var(--mm-accent)] bg-[var(--mm-accent)] text-zinc-950"
                : "border-[var(--mm-border)] bg-white/5 text-[var(--mm-text)] hover:bg-white/10")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-[var(--mm-border)] bg-white/5 px-4 py-3 transition hover:border-[var(--mm-accent-border)]">
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {hint ? <span className="block mt-1 text-xs text-[var(--mm-muted)]">{hint}</span> : null}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={
          "relative h-6 w-11 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-[var(--mm-accent)]/30 " +
          (checked
            ? "border-[var(--mm-accent)] bg-[var(--mm-accent)]"
            : "border-[var(--mm-border)] bg-black/20")
        }
        aria-pressed={checked}
        aria-label={label}
      >
        <span
          className={
            "absolute top-1 left-1 size-4 rounded-full bg-zinc-900 transition-transform " +
            (checked ? "translate-x-5" : "translate-x-0")
          }
        />
      </button>
    </label>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}: PropsWithChildren<{
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
}>) {
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative mx-auto mt-20 w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-[var(--mm-border)] bg-[color:var(--mm-card)] p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id={`${id}-title`} className="text-lg font-semibold tracking-tight">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[var(--mm-border)] bg-white/5 p-2 hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4">{children}</div>
            {footer ? <div className="mt-5">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "danger",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "default";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--mm-border)] bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              "rounded-xl px-4 py-3 text-sm font-semibold transition " +
              (tone === "danger"
                ? "bg-red-500/15 border border-red-500/25 text-red-300 hover:bg-red-500/20"
                : "bg-[var(--mm-accent)] border border-[var(--mm-accent)] text-zinc-950")
            }
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-sm text-[var(--mm-muted)] leading-relaxed">{description}</p>
    </Modal>
  );
}

