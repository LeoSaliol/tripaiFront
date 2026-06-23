"use client";

import { useEffect, type ReactNode } from "react";

interface ToastProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  duration?: number;
}

export default function Toast({ open, onClose, children, duration = 2500 }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, onClose, duration]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 transition-opacity duration-200">
      <div className="rounded-lg border border-brand-gold/30 bg-brand-surface px-5 py-3 text-sm text-brand-light shadow-xl">
        {children}
      </div>
    </div>
  );
}
