import * as React from "react";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------- Card ---------- */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "bg-surface border-token rounded-2xl border shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="border-token flex items-start justify-between gap-4 border-b px-5 py-4">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle ? (
          <p className="text-muted mt-0.5 text-sm">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cx("p-5", className)}>{children}</div>;
}

/* ---------- Button ---------- */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const base =
    "focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  };
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary:
      "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--border)]",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    ghost: "text-[var(--text-muted)] hover:bg-[var(--surface-2)]",
  };
  return (
    <button
      className={cx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

/* ---------- Form fields ---------- */
export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
      {children}
    </label>
  );
}

const fieldClass =
  "focus-ring border-token bg-surface-2 text-[var(--text)] w-full rounded-lg border px-3 py-2 text-sm placeholder:text-[var(--text-muted)]";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(fieldClass, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(fieldClass, props.className)} />;
}

/* ---------- Badge ---------- */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "brand" | "warning";
}) {
  const tones = {
    neutral:
      "bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    danger: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    brand: "bg-brand-500/15 text-brand-600 dark:text-brand-300",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Alert (flash) ---------- */
export function Alert({
  tone = "success",
  children,
}: {
  tone?: "success" | "danger";
  children: React.ReactNode;
}) {
  const tones = {
    success:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    danger: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  };
  return (
    <div className={cx("rounded-lg border px-4 py-3 text-sm", tones[tone])}>
      {children}
    </div>
  );
}

/* ---------- Table ---------- */
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cx(
        "text-muted border-token border-b px-4 py-3 text-left font-semibold whitespace-nowrap",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cx("border-token border-b px-4 py-3 align-middle", className)}
    >
      {children}
    </td>
  );
}

/* ---------- Stat tile ---------- */
export function Stat({
  label,
  value,
  hint,
  tone = "brand",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "brand" | "success" | "danger" | "warning";
}) {
  const bars = {
    brand: "bg-brand-500",
    success: "bg-emerald-500",
    danger: "bg-rose-500",
    warning: "bg-amber-500",
  };
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className={cx("w-1.5 shrink-0", bars[tone])} />
        <div className="px-5 py-4">
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
          {hint ? <p className="text-muted mt-0.5 text-xs">{hint}</p> : null}
        </div>
      </div>
    </Card>
  );
}

/* ---------- Page header ---------- */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-muted mt-1 text-sm">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted px-4 py-10 text-center text-sm">{children}</div>
  );
}

export { cx };
