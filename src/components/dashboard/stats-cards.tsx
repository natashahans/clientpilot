import { LucideIcon } from "lucide-react";

type Stat = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
};

type StatsCardsProps = {
  loading: boolean;
  stats: Stat[];
};

export default function StatsCards({
  loading,
  stats,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {loading
        ? [1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="app-card h-[158px] rounded-[28px] animate-pulse"
            />
          ))
        : stats.map(({ label, value, change, icon: Icon }) => (
            <div
              key={label}
              className="app-card rounded-[28px] p-5 transition hover:-translate-y-1 hover:bg-white/[0.09]"
            >
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-accent)]/15 ring-1 ring-[var(--app-accent)]/20">
                  <Icon className="h-5 w-5 text-[var(--app-accent)]" />
                </div>

                <span className="app-muted max-w-[95px] text-right text-xs leading-4">
                  {change}
                </span>
              </div>

              <p className="app-muted text-sm">{label}</p>

              <h2 className="mt-2 text-4xl font-black tracking-tight">
                {value}
              </h2>
            </div>
          ))}
    </div>
  );
}