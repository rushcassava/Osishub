"use client";

import React from "react";

/* ─── Formatters ─────────────────────────────────────────── */

export function formatRupiah(n: number | string | { toString(): string }) {
  const num = typeof n === "number" ? n : parseFloat(n.toString());
  if (Number.isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID", { minimumFractionDigits: 0 });
}

export function formatTanggal(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatWaktu(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─── Badge ──────────────────────────────────────────────── */

export type BadgeVariant = "green" | "blue" | "amber" | "red" | "gray" | "gold" | "navy";

const badgeStyles: Record<BadgeVariant, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blueSoft text-blue border-blue/10",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-600 border-red-200",
  gray: "bg-bgAlt text-inkSoft border-line",
  gold: "bg-goldSoft text-gold border-gold/20",
  navy: "bg-navy text-white border-navy",
};

export function Badge({
  children,
  variant = "gray",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em] ${badgeStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ─── Kartu ──────────────────────────────────────────────── */

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[14px] border border-[#E8EAF0] bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {children}
    </div>
  );
}

export function StatBox({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "green" | "red" | "blue" | "gold" | "amber";
}) {
  const toneMap: Record<string, string> = {
    default: "text-navy",
    green: "text-emerald-600",
    red: "text-red-600",
    blue: "text-blue",
    gold: "text-gold",
    amber: "text-amber-600",
  };
  return (
    <Card className="flex flex-col gap-1">
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-inkFaint">
        {label}
      </div>
      <div className={`font-display text-[24px] font-bold leading-tight ${toneMap[tone]}`}>
        {value}
      </div>
      {hint && <div className="text-[12.5px] text-inkSoft">{hint}</div>}
    </Card>
  );
}

/* ─── Form Controls ──────────────────────────────────────── */

const inputCls =
  "w-full rounded-[9px] border border-[#E8EAF0] bg-[#F8F9FC] px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-blueBright focus:bg-white focus:shadow-sm";

export function TextInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>}
      <input className={inputCls} {...props} />
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>}
      <textarea className={`${inputCls} min-h-[90px] resize-y`} {...props} />
    </label>
  );
}

export function SelectInput({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>}
      <select className={inputCls} {...props}>
        {children}
      </select>
    </label>
  );
}

/* ─── Tombol ─────────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-navy text-white hover:bg-blueBright shadow-sm",
    secondary: "border border-[#E8EAF0] bg-white text-ink hover:border-inkSoft hover:text-ink",
    ghost: "text-inkSoft hover:bg-bgAlt hover:text-ink",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[9px] px-4 py-2.5 text-[13.5px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ─── Form Panel ─────────────────────────────────────────── */

export function FormPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <h3 className="mb-1 font-display text-[16px] font-bold text-navy">{title}</h3>
      {subtitle && <p className="mb-4 text-[13px] text-inkSoft">{subtitle}</p>}
      <div className="flex flex-col gap-4">{children}</div>
    </Card>
  );
}

/* ─── Tabel ──────────────────────────────────────────────── */

export function Table({
  head,
  children,
}: {
  head: React.ReactNode[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-[#E8EAF0] bg-white shadow-sm">
      <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-[#E8EAF0] bg-[#F8F9FC]">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.08em] text-inkFaint"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8EAF0]">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-[#E8EAF0] bg-white/50 px-6 py-12 text-center">
      <div className="mb-2 text-[28px]">🗂️</div>
      <p className="text-[14px] font-medium text-ink">{message}</p>
      <p className="text-[12.5px] text-inkFaint">Data yang kamu tambahkan akan muncul di sini.</p>
    </div>
  );
}

/* ─── Modal Sederhana ────────────────────────────────────── */

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-[16px] border border-[#E8EAF0] bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[17px] font-bold text-navy">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-inkFaint transition hover:bg-bgAlt hover:text-ink"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
