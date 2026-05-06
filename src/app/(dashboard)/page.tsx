"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Sparkles, Users, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { supabase } from "@/lib/supabase";

type Client = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  status: string | null;
  last_visit: string | null;
};

type Appointment = {
  id: number;
  client_name: string;
  service: string;
  time: string;
  status: string | null;
};

type ChartRange = "today" | "7days" | "30days";

const chartDataByRange = {
  today: [
    { label: "9 AM", bookings: 1 },
    { label: "11 AM", bookings: 2 },
    { label: "1 PM", bookings: 1 },
    { label: "3 PM", bookings: 3 },
    { label: "5 PM", bookings: 2 },
    { label: "7 PM", bookings: 1 },
  ],
  "7days": [
    { label: "Mon", bookings: 28 },
    { label: "Tue", bookings: 44 },
    { label: "Wed", bookings: 38 },
    { label: "Thu", bookings: 62 },
    { label: "Fri", bookings: 55 },
    { label: "Sat", bookings: 74 },
    { label: "Sun", bookings: 49 },
  ],
  "30days": [
    { label: "Week 1", bookings: 120 },
    { label: "Week 2", bookings: 148 },
    { label: "Week 3", bookings: 132 },
    { label: "Week 4", bookings: 176 },
  ],
};

const rangeLabels = {
  today: "Today",
  "7days": "Last 7 days",
  "30days": "Last 30 days",
};

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chartRange, setChartRange] = useState<ChartRange>("7days");

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.log("DASHBOARD CLIENTS ERROR:", error);
        return;
      }

      setClients(data || []);
    }

    async function fetchAppointments() {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.log("APPOINTMENTS ERROR:", error);
        return;
      }

      setAppointments(data || []);
    }

    fetchClients();
    fetchAppointments();
  }, []);

  const totalClients = clients.length;
  const activeClients = clients.filter(
    (client) => client.status === "Active"
  ).length;
  const newClients = clients.filter((client) => client.status === "New").length;
  const recentClients = clients.slice(0, 4);

  const chartData = chartDataByRange[chartRange];

  const totalBookingsInChart = useMemo(
    () => chartData.reduce((sum, item) => sum + item.bookings, 0),
    [chartData]
  );

  const stats = [
    {
      label: "Total Clients",
      value: totalClients.toString(),
      change: `${activeClients} active`,
      icon: Users,
    },
    {
      label: "Today’s Appointments",
      value: appointments.length.toString(),
      change: "live from database",
      icon: CalendarDays,
    },
    {
      label: "New Clients",
      value: newClients.toString(),
      change: "from database",
      icon: Wallet,
    },
  ];

  return (
    <section className="space-y-7">
      <div className="grid gap-7 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="relative">
          <div className="mb-10 flex items-start justify-between gap-8">
            <div>
              <p className="app-kicker mb-3">Business Overview</p>

              <h1 className="app-page-title max-w-2xl">
                Today’s client operations, bookings and growth signals.
              </h1>

              <p className="app-muted mt-5 max-w-xl text-base leading-7">
                Monitor appointments, track client activity and spot the busiest parts
                of your service business from one focused workspace.
              </p>
            </div>

            <div className="app-card hidden shrink-0 rounded-[28px] p-5 xl:block">
              <p className="app-muted text-sm">Client database</p>
              <p className="mt-2 text-2xl font-black tracking-tight">
                {totalClients} records
              </p>
              <p className="mt-1 text-sm text-[var(--app-accent)]">
                Live from Supabase
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map(({ label, value, change, icon: Icon }) => (
              <div
                key={label}
                className="app-card rounded-[28px] p-5 transition hover:bg-white/[0.09]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-[var(--app-accent)]" />
                  </div>

                  <span className="app-muted text-xs">{change}</span>
                </div>

                <p className="app-muted text-sm">{label}</p>
                <h2 className="mt-2 text-4xl font-black tracking-tight">
                  {value}
                </h2>
              </div>
            ))}
          </div>
        </div>

        <div className="app-accent-card p-7 shadow-2xl shadow-black/30">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
                Smart Signal
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-[-0.05em]">
                {activeClients} active clients.
              </h2>
            </div>

            <Sparkles className="h-7 w-7" />
          </div>

          <div className="rounded-[28px] bg-black p-5 text-white">
            <p className="text-sm text-white/45">Suggested action</p>
            <p className="mt-2 text-xl font-bold">
              Follow up with returning clients and convert new clients into repeat bookings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="app-card p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="app-section-title">Booking Performance</h3>
              <p className="app-muted mt-1 text-sm">
                Estimated booking demand for {rangeLabels[chartRange].toLowerCase()}.
              </p>
              <p className="mt-2 text-sm font-bold text-[var(--app-accent)]">
                {totalBookingsInChart} total bookings shown
              </p>
            </div>

            <select
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value as ChartRange)}
              className="app-input rounded-full px-4 py-2 text-sm font-bold"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>
          </div>

          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--app-accent)"
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--app-accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  stroke="var(--app-muted)"
                />

                <Tooltip
                  cursor={{ stroke: "var(--app-accent)", strokeOpacity: 0.25 }}
                  formatter={(value) => [`${value} bookings`, "Bookings"]}
                  labelFormatter={(label) => `${rangeLabels[chartRange]} • ${label}`}
                  contentStyle={{
                    background: "var(--app-surface)",
                    border: "1px solid var(--app-border)",
                    borderRadius: "18px",
                    color: "var(--app-text)",
                    boxShadow: "0 18px 40px rgba(49, 37, 25, 0.12)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings"
                  stroke="var(--app-accent)"
                  strokeWidth={4}
                  fill="url(#areaGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="app-card p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="app-section-title">Today’s Timeline</h3>
              <p className="app-muted mt-1 text-sm">
                Live appointments from Supabase
              </p>
            </div>

            <Clock className="h-5 w-5 text-[var(--app-accent)]" />
          </div>

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="app-card-dark relative p-5">
                <div className="absolute left-0 top-6 h-8 w-1 rounded-full bg-[var(--app-accent)]" />

                <p className="text-sm font-bold text-[var(--app-accent)]">
                  {appointment.time}
                </p>

                <p className="mt-2 text-lg font-bold">{appointment.service}</p>

                <p className="app-muted text-sm">{appointment.client_name}</p>

                <p className="mt-2 text-xs text-white/50">
                  {appointment.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="app-card p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="app-section-title">Client Pipeline</h3>
            <p className="app-muted mt-1 text-sm">
              Recent clients and booking activity from Supabase.
            </p>
          </div>

          <button className="app-button-secondary px-4 py-2">
            View all clients
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recentClients.map((client) => (
            <div key={client.id} className="app-card-dark p-5">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-accent)] font-black text-[var(--app-accent-text)]">
                  {client.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">
                  {client.status}
                </span>
              </div>

              <p className="text-lg font-bold">{client.name}</p>
              <p className="app-muted mt-1 text-sm">{client.service}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}