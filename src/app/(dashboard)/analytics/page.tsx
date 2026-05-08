"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/context/workspace-context";
import { formatPrice } from "@/lib/formatters";

type Client = {
  id: number;
  status: string | null;
};

type Appointment = {
  id: number;
  service: string;
  status: string | null;
  appointment_at: string | null;
  service_price: number | null;
};

type Service = {
  id: number;
  name: string;
  tag: string | null;
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

export default function AnalyticsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [chartRange, setChartRange] = useState<ChartRange>("7days");
  const [loading, setLoading] = useState(true);
  const { workspaceSettings } = useWorkspace();

  useEffect(() => {
    async function fetchAnalyticsData() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [clientsRes, appointmentsRes, servicesRes] = await Promise.all([
        supabase.from("clients").select("id, status").eq("user_id", user.id),

        supabase
          .from("appointments")
          .select("id, service, status, appointment_at, service_price")
          .eq("user_id", user.id),

        supabase.from("services").select("id, name, tag").eq("user_id", user.id),
      ]);

      if (clientsRes.error) {
        console.log("ANALYTICS CLIENTS ERROR:", clientsRes.error);
      } else {
        setClients(clientsRes.data || []);
      }

      if (appointmentsRes.error) {
        console.log("ANALYTICS APPOINTMENTS ERROR:", appointmentsRes.error);
      } else {
        setAppointments(appointmentsRes.data || []);
      }

      if (servicesRes.error) {
        console.log("ANALYTICS SERVICES ERROR:", servicesRes.error);
      } else {
        setServices(servicesRes.data || []);
      }

      setLoading(false);
    }

    fetchAnalyticsData();
  }, []);

  const activeClients = clients.filter(
    (client) => client.status === "Active"
  ).length;

  const returningClients = clients.filter(
    (client) => client.status === "Returning"
  ).length;

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;

  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "Cancelled"
  ).length;

  const totalRevenue = appointments.reduce((sum, appointment) => {
    return sum + (appointment.service_price || 0);
  }, 0);

  const confirmedRevenue = appointments
    .filter((appointment) => appointment.status === "Confirmed")
    .reduce((sum, appointment) => sum + (appointment.service_price || 0), 0);

  const serviceCounts = appointments.reduce<Record<string, number>>(
    (acc, appointment) => {
      if (!appointment.service) return acc;

      acc[appointment.service] = (acc[appointment.service] || 0) + 1;
      return acc;
    },
    {}
  );

  const mostPopularService =
    Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];

  const topService = mostPopularService?.[0] || services[0]?.name || "No service yet";
  const topServiceBookings = mostPopularService?.[1] || 0;

  const chartData: ChartPoint[] = useMemo(
    () => getChartData(appointments, chartRange),
    [appointments, chartRange]
  );

  const totalBookingsInChart = useMemo(
    () => chartData.reduce((sum, item) => sum + item.bookings, 0),
    [chartData]
  );

  const statusItems = [
    ["Confirmed", confirmedAppointments],
    ["Pending", pendingAppointments],
    ["Cancelled", cancelledAppointments],
  ];

  return (
    <section className="space-y-7">
      <div>
        <p className="app-kicker">Insights</p>

        <h1 className="app-page-title mt-2">Analytics</h1>

        <p className="app-muted mt-3">
          Understand live revenue, service demand, appointment status and client activity.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="app-accent-card p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
            Revenue
          </p>
          <h2 className="mt-3 text-5xl font-black">
            {loading
              ? "..."
              : formatPrice(totalRevenue.toString(), workspaceSettings?.currency)}
          </h2>
          <p className="mt-2 text-sm font-semibold">from all appointments</p>
        </div>

        <div className="app-card p-6">
          <p className="app-muted text-sm">Confirmed Revenue</p>
          <h2 className="mt-3 text-5xl font-black">
            {loading
              ? "..."
              : formatPrice(
                  confirmedRevenue.toString(),
                  workspaceSettings?.currency
                )}
          </h2>
          <p className="app-muted mt-2 text-sm">confirmed bookings only</p>
        </div>

        <div className="app-card p-6">
          <p className="app-muted text-sm">Appointments</p>
          <h2 className="mt-3 text-5xl font-black">
            {loading ? "..." : appointments.length}
          </h2>
          <p className="app-muted mt-2 text-sm">
            {confirmedAppointments} confirmed
          </p>
        </div>

        <div className="app-card p-6">
          <p className="app-muted text-sm">Clients</p>
          <h2 className="mt-3 text-5xl font-black">
            {loading ? "..." : clients.length}
          </h2>
          <p className="app-muted mt-2 text-sm">
            {activeClients} active / {returningClients} returning
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="app-card p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="app-section-title">Booking Performance</h2>
              <p className="app-muted text-sm">
                Real appointment demand from Supabase for{" "}
                {rangeLabels[chartRange].toLowerCase()}.
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
              <option value="24h">Last 24 hours</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>

          <div className="h-[260px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="analyticsGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--app-accent)"
                      stopOpacity={0.6}
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
                  cursor={{ stroke: "var(--app-accent)", strokeOpacity: 0.25 }}
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
                  fill="url(#analyticsGlow)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    stroke: "white",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="app-accent-card p-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
              Top Service
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">
              {topService}
            </h2>
            <p className="mt-2 text-sm font-semibold">
              {topServiceBookings} bookings from appointments
            </p>
          </div>

          <div className="app-card p-6">
            <p className="app-muted text-sm">Appointment Status</p>

            <div className="mt-5 space-y-4">
              {statusItems.map(([label, count]) => (
                <div key={label as string}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold">{label}</span>
                    <span className="app-muted">{count}</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[var(--app-accent)]"
                      style={{
                        width: `${
                          appointments.length
                            ? ((count as number) / appointments.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-card p-6">
            <p className="app-muted text-sm">Service Catalogue</p>
            <h2 className="mt-3 text-2xl font-black">
              {services.length} services
            </h2>
            <p className="app-muted mt-1 text-sm">available offers</p>
          </div>
        </div>
      </div>
    </section>
  );
}