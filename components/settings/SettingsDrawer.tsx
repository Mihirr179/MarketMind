"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function SettingsDrawer({
  open,
  title,
  subtitle,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}) {
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

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="absolute right-0 top-0 h-full w-[calc(100%-1rem)] sm:w-[420px] lg:w-[460px] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="h-full rounded-l-3xl border border-[var(--mm-border)] bg-[color:var(--mm-card)]/80 backdrop-blur-xl shadow-2xl">
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--mm-border)] bg-[color:var(--mm-card)]/85 p-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--mm-muted)]">
                    Settings
                  </div>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">
                    {title}
                  </h2>
                  {subtitle ? (
                    <p className="mt-1 text-sm text-[var(--mm-muted)]">{subtitle}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-1 inline-flex items-center justify-center rounded-xl border border-[var(--mm-border)] bg-white/5 p-2 hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4">{children}</div>
              {footer ? <div className="p-4 pt-0">{footer}</div> : null}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

