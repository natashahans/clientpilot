"use client";

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 55 },
  { day: "Wed", value: 48 },
  { day: "Thu", value: 70 },
  { day: "Fri", value: 62 },
  { day: "Sat", value: 85 },
  { day: "Sun", value: 60 },
];

export default function AnalyticsPage() {
  return (
    <section className="space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
          Insights
        </p>
        <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
          Analytics
        </h1>
        <p className="mt-3 text-white/45">
          Understand performance trends, booking demand and revenue growth.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Booking Performance</h2>
              <p className="text-sm text-white/40">
                Weekly demand and appointment trends.
              </p>
            </div>

            <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/40">
              Last 7 days
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D7FF5F" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#D7FF5F" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="day" stroke="#9CA3AF" />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#D7FF5F"
                  fill="url(#color)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#D7FF5F] p-6 text-black">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
              Revenue
            </p>
            <h2 className="mt-3 text-4xl font-black">$1,240</h2>
            <p className="mt-2 text-sm font-semibold">+18% this month</p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6">
            <p className="text-sm text-white/40">Top performing service</p>
            <h2 className="mt-3 text-2xl font-black">Premium Service</h2>
            <p className="mt-1 text-sm text-white/40">
              Generates highest revenue this week
            </p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6">
            <p className="text-sm text-white/40">Client retention</p>
            <h2 className="mt-3 text-2xl font-black">92%</h2>
            <p className="mt-1 text-sm text-white/40">
              Returning clients ratio
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}