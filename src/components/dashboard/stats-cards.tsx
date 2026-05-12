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

export default function StatsCards({ loading, stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {loading
        ? [1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[150px] animate-pulse rounded-[28px] border border-slate-200 bg-slate-50"
            />
          ))
        : stats.map(({ label, value, change, icon: Icon }) => (
            <div
              key={label}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
            >
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                  <Icon className="h-5 w-5 text-[#4f46e5]" />
                </div>

                <span className="max-w-[95px] text-right text-[12px] font-semibold leading-4 text-slate-400">
                  {change}
                </span>
              </div>

              <p className="text-[13px] font-semibold text-slate-500">
                {label}
              </p>

              <h2 className="mt-2 text-[32px] font-extrabold tracking-[-0.05em] text-slate-950">
                {value}
              </h2>
            </div>
          ))}
    </div>
  );
}