"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Sparkles, Users, UserPlus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { formatTimeWithTimezone } from "@/lib/formatters";
import { useWorkspace } from "@/context/workspace-context";
import Link from "next/link";

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
  appointment_at: string | null;
};

type ChartRange = "24h" | "7days" | "30days" | "90days";

type ChartPoint = {
  label: string;
  bookings: number;
};

const rangeLabels = {
  "24h": "Last 24 hours",
  "7days": "Last 7 days",
  "30days": "Last 30 days",
  "90days": "Last 90 days",
};

function startOfDay(date: Date) {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

function getChartData(appointments: Appointment[], range: ChartRange) {
  const validAppointments = appointments.filter(
    (appointment) => appointment.appointment_at
  );

  const now = new Date();

  if (range === "24h") {
    const hours = [0, 4, 8, 12, 16, 20];

    return hours.map((hour) => {
      const start = new Date(now);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(start);
      end.setHours(hour + 4, 0, 0, 0);

      const bookings = validAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_at as string);
        return appointmentDate >= start && appointmentDate < end;
      }).length;

      return {
        label: `${hour.toString().padStart(2, "0")}:00`,
        bookings,
      };
    });
  }

  if (range === "7days") {
    const today = startOfDay(now);

    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const bookings = validAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_at as string);
        return appointmentDate >= day && appointmentDate < nextDay;
      }).length;

      return {
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        bookings,
      };
    });
  }

  if (range === "30days") {
    const today = startOfDay(now);

    return Array.from({ length: 4 }).map((_, index) => {
      const start = new Date(today);
      start.setDate(today.getDate() - (28 - index * 7));

      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      const bookings = validAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_at as string);
        return appointmentDate >= start && appointmentDate < end;
      }).length;

      return {
        label: `Week ${index + 1}`,
        bookings,
      };
    });
  }

  const today = startOfDay(now);

  return Array.from({ length: 3 }).map((_, index) => {
    const start = new Date(today);
    start.setDate(today.getDate() - (90 - index * 30));

    const end = new Date(start);
    end.setDate(start.getDate() + 30);

    const bookings = validAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointment_at as string);
      return appointmentDate >= start && appointmentDate < end;
    }).length;

    return {
      label: `Month ${index + 1}`,
      bookings,
    };
  });
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chartRange, setChartRange] = useState<ChartRange>("7days");
  const [loading, setLoading] = useState(true);
  const { workspaceSettings } = useWorkspace();

  useEffect(() => {
    async function fetchDashboardData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const [clientsRes, appointmentsRes] = await Promise.all([
        supabase
          .from("clients")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: false }),

        supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user.id)
          .order("appointment_at", {
            ascending: true,
            nullsFirst: false,
          }),
      ]);

      if (clientsRes.error) {
        console.log("DASHBOARD CLIENTS ERROR:", clientsRes.error);
      } else {
        setClients(clientsRes.data || []);
      }

      if (appointmentsRes.error) {
        console.log("APPOINTMENTS ERROR:", appointmentsRes.error);
      } else {
        setAppointments(appointmentsRes.data || []);
      }

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  const totalClients = clients.length;

  const activeClients = clients.filter(
    (client) => client.status === "Active"
  ).length;

  const newClients = clients.filter((client) => client.status === "New").length;

  const recentClients = clients.slice(0, 4);

  const upcomingAppointments = [...appointments]
    .sort(
      (a, b) =>
        new Date(a.appointment_at || "").getTime() -
        new Date(b.appointment_at || "").getTime()
    )
    .slice(0, 8);

  const chartData: ChartPoint[] = useMemo(
    () => getChartData(appointments, chartRange),
    [appointments, chartRange]
  );

  const totalBookingsInChart = useMemo(
    () => chartData.reduce((sum, item) => sum + item.bookings, 0),
    [chartData]
  );

  const hasChartData = chartData.some((item) => item.bookings > 0);

  const todaysAppointments = appointments.filter((appointment) => {
    if (!appointment.appointment_at) return false;

    const today = new Date();
    const appointmentDate = new Date(appointment.appointment_at);

    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const stats = [
    {
      label: "Total Clients",
      value: totalClients.toString(),
      change: `${activeClients} active`,
      icon: Users,
    },
    {
      label: "Today’s Appointments",
      value: todaysAppointments.toString(),
      change: "live from database",
      icon: CalendarDays,
    },
    {
      label: "New Clients",
      value: newClients.toString(),
      change: "from database",
      icon: UserPlus,
    },
  ];

  return (
    <section className="space-y-7">
      <div className="grid gap-7 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="relative">
          <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
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
                {loading ? "..." : `${totalClients} records`}
              </p>
              <p className="mt-1 text-sm text-[var(--app-accent)]">
                Live from Supabase
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {loading
              ? [1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="app-card h-[158px] rounded-[28px] animate-pulse"
                  />
                ))
              : stats.map(({ label, value, change, icon: Icon }) => (
                  <div
                    key={label}
                    className="app-card rounded-[28px] p-5 transition hover:bg-white/[0.09]"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-accent)]/15 ring-1 ring-[var(--app-accent)]/20">
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

        <div className="app-accent-card p-6 shadow-2xl shadow-black/30">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
                Smart Signal
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                {loading ? "Loading..." : `${activeClients} active clients.`}
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
        <div className="app-card p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="app-section-title">Booking Performance</h3>

              <p className="app-muted mt-1 text-sm">
                Real appointment demand from Supabase for{" "}
                {rangeLabels[chartRange].toLowerCase()}.
              </p>

              <p className="mt-2 text-sm font-bold text-[var(--app-accent)]">
                {loading ? "Loading bookings..." : `${totalBookingsInChart} total bookings shown`}
              </p>
            </div>

            <select
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value as ChartRange)}
              className="app-input w-full rounded-full px-4 py-2 text-sm font-bold sm:w-auto"
              disabled={loading}
            >
              <option value="24h">Last 24 hours</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>

          <div className="h-[260px] min-w-0">
            {loading ? (
              <div className="app-card-dark h-full animate-pulse" />
            ) : hasChartData ? (
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

                  <CartesianGrid
                    vertical={false}
                    stroke="var(--app-border)"
                    strokeDasharray="4 8"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    stroke="var(--app-muted)"
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    stroke="var(--app-muted)"
                    width={32}
                    allowDecimals={false}
                  />

                  <Tooltip
                    animationDuration={200}
                    cursor={{
                      stroke: "var(--app-accent)",
                      strokeOpacity: 0.25,
                    }}
                    formatter={(value) => [`${value} bookings`, "Bookings"]}
                    labelFormatter={(label) =>
                      `${rangeLabels[chartRange]} • ${label}`
                    }
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
                    dot={false}
                    activeDot={{
                      r: 6,
                      strokeWidth: 2,
                      stroke: "white",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="app-card-dark flex h-full items-center justify-center rounded-[28px]">
                <div className="text-center">
                  <p className="font-bold">No booking analytics yet</p>
                  <p className="app-muted mt-1 text-sm">
                    Appointment trends will appear once bookings are added.
                  </p>
                </div>
              </div>
              )}
          </div>
        </div>

        <div className="app-card p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="app-section-title">Today’s Timeline</h3>

              <p className="app-muted mt-1 text-sm">
                Live appointments from Supabase
              </p>
            </div>

            <Clock className="h-5 w-5 text-[var(--app-accent)]" />
          </div>

          <div className="max-h-[540px] space-y-4 overflow-y-auto pr-2">
            {loading ? (
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="app-card-dark h-[104px] animate-pulse"
                />
              ))
            ) : appointments.length === 0 ? (
              <div className="app-card-dark p-6 text-center">
                <p className="font-bold">No appointments yet</p>
                <p className="app-muted mt-1 text-sm">
                  New bookings will appear here once you add them.
                </p>
              </div>
            ) : (
              upcomingAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href="/appointments"
                  className="app-card-dark relative block p-5 transition hover:bg-white/[0.06]"
                >
                  <div className="absolute left-0 top-6 h-8 w-1 rounded-full bg-[var(--app-accent)]" />

                  <p className="text-sm font-bold text-[var(--app-accent)]">
                    {formatTimeWithTimezone(
                      appointment.appointment_at,
                      workspaceSettings?.timezone
                    )}
                  </p>

                  <p className="mt-2 text-lg font-bold">
                    {appointment.service}
                  </p>

                  <p className="app-muted text-sm">
                    {appointment.client_name}
                  </p>

                  <p className="mt-2 text-xs text-white/50">
                    {appointment.status}
                  </p>
                </Link>
              ))
            )}

            {appointments.length > 8 && (
              <p className="pt-2 text-center text-xs text-white/40">
                Showing first 8 appointments
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="app-card p-5 sm:p-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="app-section-title">Client Pipeline</h3>

            <p className="app-muted mt-1 text-sm">
              Recent clients and booking activity from Supabase.
            </p>
          </div>

          <Link 
            href="/clients"
            className="app-button-secondary w-full px-4 py-2 text-center sm:w-auto"
          >
            View all clients
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {loading
            ? [1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="app-card-dark h-[150px] animate-pulse"
                />
              ))
            : recentClients.map((client) => (
                <Link
                  key={client.id}
                  href="/clients"
                  className="app-card-dark block p-5 transition hover:bg-white/[0.06]"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-accent)] font-black text-[var(--app-accent-text)]">
                      {client.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")}
                    </div>

                    <span className="rounded-full bg-[var(--app-accent)]/12 px-3 py-1 text-xs font-bold text-[var(--app-accent)] ring-1 ring-[var(--app-accent)]/20">
                      {client.status}
                    </span>
                  </div>

                  <p className="text-lg font-bold">{client.name}</p>
                  <p className="app-muted mt-1 text-sm">{client.service}</p>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}