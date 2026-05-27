"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Info, X } from "lucide-react";

type ToastType = "success" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

let toastId = 0;
const listeners: Set<(item: ToastItem) => void> = new Set();

export function showToast(message: string, type: ToastType = "success") {
  const item: ToastItem = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(item));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: ToastItem) => {
    setToasts((prev) => [...prev, item]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== item.id));
    }, 3000);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg animate-toast-in ${
            toast.type === "success"
              ? "border-sea/20 bg-panel text-sea"
              : "border-ink/10 bg-panel text-ink"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <Info className="size-4 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            className="ml-2 opacity-40 hover:opacity-100 transition-opacity"
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            type="button"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
