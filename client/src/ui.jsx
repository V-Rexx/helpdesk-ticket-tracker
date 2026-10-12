// Shared Tailwind class strings and small presentational components.

import { HiOutlineTicket } from "react-icons/hi2";

export const card = "rounded-xl border border-slate-200 bg-white shadow-xs";

const btnBase =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-50";
export const btn = `${btnBase} bg-indigo-600 text-white shadow-xs hover:bg-indigo-700`;
export const btnSecondary = `${btnBase} border border-slate-300 bg-white text-slate-700 shadow-xs hover:bg-slate-50`;
export const btnGhost = `${btnBase} text-slate-600 hover:bg-slate-100 hover:text-slate-900`;
export const link = "font-medium text-indigo-600 hover:text-indigo-700";

export const errorBox = "rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700";

export const STATUS_LABEL = { open: "Open", in_progress: "In progress", resolved: "Resolved" };

const badge = "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap";

const STATUS_STYLE = {
  open: ["bg-blue-50 text-blue-700 ring-blue-600/20", "bg-blue-500"],
  in_progress: ["bg-amber-50 text-amber-800 ring-amber-600/20", "bg-amber-500"],
  resolved: ["bg-emerald-50 text-emerald-700 ring-emerald-600/20", "bg-emerald-500"],
};

const PRIORITY_STYLE = {
  high: "bg-red-50 text-red-700 ring-red-600/15",
  medium: "bg-orange-50 text-orange-700 ring-orange-600/15",
  low: "bg-slate-50 text-slate-600 ring-slate-500/20",
};

const ROLE_STYLE = {
  agent: "bg-violet-50 text-violet-700 ring-violet-600/20",
  user: "bg-slate-50 text-slate-600 ring-slate-500/20",
};

export function StatusBadge({ status }) {
  const [style, dot] = STATUS_STYLE[status];
  return (
    <span className={`${badge} ${style}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return <span className={`${badge} ${PRIORITY_STYLE[priority]} capitalize`}>{priority}</span>;
}

export function RoleBadge({ role }) {
  if (!role) return null;
  return <span className={`${badge} ${ROLE_STYLE[role]} capitalize`}>{role}</span>;
}

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
];

export function Avatar({ name, size = "size-8 text-xs" }) {
  name = name || "?";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
  const color = AVATAR_COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${size} ${color}`}>
      {initials}
    </span>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
        <HiOutlineTicket className="size-[18px]" />
      </span>
      <span className="text-base font-semibold tracking-tight text-slate-900">Helpdesk</span>
    </span>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
      <span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      {label}
    </div>
  );
}
