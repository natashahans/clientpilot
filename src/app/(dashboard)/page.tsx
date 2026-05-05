"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stats = [
  { label: "Total Clients", value: "124", change: "+12% this month" },
  { label: "Today's Appointments", value: "8", change: "3 completed" },
  { label: "Monthly Revenue", value: "$1,240", change: "+18% from last month" },
  { label: "Completed Bookings", value: "56", change: "92% completion rate" },
];

const chartData = [
  { day: "M", value: 45 },
  { day: "T", value: 70 },
  { day: "W", value: 52 },
  { day: "T", value: 88 },
  { day: "F", value: 65 },
  { day: "S", value: 95 },
  { day: "S", value: 58 },
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Overview</p>
          <h1 className="mt-2 text-5xl font-bold tracking-tight text-white">
            Welcome back 👋
          </h1>
          <p className="mt-3 max-w-2xl text-white/55">
            Here’s what’s happening across your clients, bookings, and services today.
          </p>
        </div>

        <div className="hidden rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm shadow-2xl shadow-black/20 backdrop-blur-xl lg:block">
          <p className="font-semibold text-white">Smart Insight</p>
          <p className="mt-1 text-white/50">Friday is your busiest booking day.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`group relative overflow-hidden rounded-[30px] p-6 transition-all duration-300 ${
              index === 0
                ? "border border-emerald-400/30 bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-950 text-white shadow-2xl shadow-emerald-950/40"
                : "border border-white/10 bg-white/[0.06] text-white shadow-2xl shadow-black/20 backdrop-blur-xl hover:bg-white/[0.09]"
            }`}
          >
            {index === 0 && (
              <>
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-black/20 to-transparent" />
              </>
            )}

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-white/55">{stat.label}</p>
                <h3 className="mt-4 text-4xl font-bold tracking-tight">
                  {stat.value}
                </h3>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                  index === 0
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/70 group-hover:bg-white/15"
                }`}
              >
                ↗
              </div>
            </div>

            <p className="relative mt-7 text-sm text-white/55">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        {/* Chart */}
        <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Booking Activity</h3>
              <p className="mt-1 text-sm text-white/45">
                Weekly appointment overview
              </p>
            </div>

            <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">
              View report
            </button>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="day"
                  stroke="#94A3B8"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.06)" }}
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#10B981"
                  radius={[12, 12, 12, 12]}
                  barSize={58}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="rounded-[32px] border border-white/10 bg-[#020617] p-6 text-white shadow-2xl shadow-black/30">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">Upcoming Appointments</h3>
              <p className="mt-1 text-sm text-white/45">Next bookings for today</p>
            </div>

            <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Today
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              ["10:00 AM", "Haircut Consultation", "Ali Khan"],
              ["12:30 PM", "Follow-up Session", "Sarah Ahmed"],
              ["03:00 PM", "Service Booking", "Hamza Malik"],
            ].map(([time, title, client]) => (
              <div
                key={time}
                className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 transition hover:bg-white/[0.1]"
              >
                <p className="text-sm font-medium text-emerald-300">{time}</p>
                <p className="mt-2 font-semibold text-white">{title}</p>
                <p className="text-sm text-white/45">{client}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Recent Clients</h3>
            <p className="mt-1 text-sm text-white/45">
              Latest client activity and booking history
            </p>
          </div>

          <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">
            View all
          </button>
        </div>

        <div className="space-y-4">
          {[
            ["Ali Khan", "Haircut Consultation", "Active", "Today"],
            ["Sarah Ahmed", "Follow-up Session", "Returning", "Yesterday"],
            ["Hamza Malik", "Service Booking", "New", "2 days ago"],
            ["Ayesha Noor", "Premium Package", "Active", "3 days ago"],
          ].map(([name, service, status, date]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.05] p-4 transition hover:bg-white/[0.08]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-sm font-bold text-emerald-300 ring-1 ring-emerald-300/20">
                  {name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </div>

                <div>
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-sm text-white/45">{service}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                  {status}
                </span>
                <p className="w-24 text-right text-sm text-white/40">{date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}