"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

/** Tombol submit yang otomatis menampilkan status pending form induk. */
export function SubmitButton({
  children,
  pendingText = "Menyimpan…",
  variant = "primary",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
    >
      {pending ? pendingText : children}
    </Button>
  );
}

/** Tombol hapus: minta konfirmasi sebelum submit form. */
export function DeleteSubmit({
  confirmText = "Yakin ingin menghapus data ini?",
  label = "Hapus",
}: {
  confirmText?: string;
  label?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="focus-ring rounded-md px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 disabled:opacity-50 dark:text-rose-400"
    >
      {pending ? "…" : label}
    </button>
  );
}
