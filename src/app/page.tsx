"use client";

import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  BarChart3,
  Settings,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Clients", icon: Users },
  { name: "Appointments", icon: Calendar },
  { name: "Services", icon: Briefcase },
  { name: "Analytics", icon: BarChart3 },
  { name: "Settings", icon: Settings },
];

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

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#111827]">
      <div className="flex min-h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-[#0B0F17] p-6 text-white flex flex-col">
          <div className="mb-10">
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#0B0F17]">
              CP
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ClientPilot</h1>
            <p className="mt-1 text-sm text-white/45">Business command center</p>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ name, icon: Icon }) => (
              <button
                key={name}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  name === "Dashboard"
                    ? "bg-white text-[#0B0F17] shadow-sm"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {name}
              </button>
            ))}
          </nav>

          <div className="mt-auto"></div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-hidden bg-[#F7F8FA]">
          {/* Topbar */}
          <header className="flex h-24 items-center justify-between border-b border-black/5 bg-white px-8">
            <div>
              <p className="text-sm font-medium text-gray-400">Overview</p>
              <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden w-80 rounded-full border border-black/10 bg-[#F7F8FA] px-5 py-3 text-sm text-gray-400 md:block">
                Search clients, bookings, services...
              </div>

              <button className="rounded-full bg-[#111827] px-5 py-3 text-sm font-medium text-white shadow-sm">
                + New Booking
              </button>

              <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-3 py-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300"></div>
                <div className="hidden leading-tight md:block">
                  <p className="text-sm font-semibold">Natasha</p>
                  <p className="text-xs text-gray-400">Owner</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <section className="p-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Welcome back 👋</h1>
                <p className="mt-2 text-gray-500">
                  Here’s what’s happening across your clients, bookings, and services today.
                </p>
              </div>

              <div className="hidden rounded-2xl bg-white px-5 py-4 text-sm shadow-sm ring-1 ring-black/5 lg:block">
                <p className="font-semibold">Smart Insight</p>
                <p className="mt-1 text-gray-500">Friday is your busiest booking day.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`group relative overflow-hidden rounded-[28px] p-6 transition-all duration-300 ${
                    index === 0
                      ? "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-lg"
                      : "bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md"
                  }`}
                >
                  {/* subtle glow effect */}
                  {index === 0 && (
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className={`text-sm ${
                          index === 0 ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {stat.label}
                      </p>

                      <h3 className="mt-4 text-4xl font-bold tracking-tight">
                        {stat.value}
                      </h3>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                        index === 0
                          ? "bg-white/20"
                          : "bg-[#F3F4F6] group-hover:bg-[#E5E7EB]"
                      }`}
                    >
                      ↗
                    </div>
                  </div>

                  <p
                    className={`mt-6 text-sm ${
                      index === 0 ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Booking Activity</h3>
                    <p className="text-sm text-gray-500">Weekly appointment overview</p>
                  </div>
                  <button className="rounded-full border border-black/10 px-4 py-2 text-sm">
                    View report
                  </button>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#059669" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#111827] p-6 text-white shadow-sm">
                <h3 className="text-xl font-bold">Upcoming Appointments</h3>
                <p className="mt-1 text-sm text-white/50">Next bookings for today</p>

                <div className="mt-6 space-y-4">
                  {[
                    ["10:00 AM", "Haircut Consultation", "Ali Khan"],
                    ["12:30 PM", "Follow-up Session", "Sarah Ahmed"],
                    ["03:00 PM", "Service Booking", "Hamza Malik"],
                  ].map(([time, title, client]) => (
                    <div
                      key={time}
                      className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10"
                    >
                      <p className="text-sm text-emerald-300">{time}</p>
                      <p className="mt-1 font-semibold">{title}</p>
                      <p className="text-sm text-white/50">{client}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Recent Clients</h3>
                  <p className="text-sm text-gray-500">Latest client activity and booking history</p>
                </div>

                <button className="rounded-full border border-black/10 px-4 py-2 text-sm">
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
                    className="flex items-center justify-between rounded-2xl border border-black/5 bg-[#F9FAFB] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                        {name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </div>

                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-sm text-gray-500">{service}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-black/5">
                        {status}
                      </span>
                      <p className="w-24 text-right text-sm text-gray-400">{date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}