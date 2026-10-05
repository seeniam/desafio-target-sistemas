interface BadgeProps {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "green" | "red" | "amber";
}

const tones = {
  neutral: "bg-slate-100 text-slate-700",
  blue: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-800",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
