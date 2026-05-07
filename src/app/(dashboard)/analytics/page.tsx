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

type Client = {
  id: number;
  status: string | null;
};

type Appointment = {
  id: number;
  status: string | null;
  appointment_at: string | null;
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

  useEffect(() => {
    async function fetchAnalyticsData() {
      const { data: clientsData } = await supabase.from("clients").select("*");

      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("id, status, appointment_at");

      const { data: servicesData } = await supabase.from("services").select("*");

      setClients(clientsData || []);
      setAppointments(appointmentsData || []);
      setServices(servicesData || []);
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

  const topService =
    services.find((service) => service.tag === "High Value")?.name ||
    services[0]?.name ||
    "No service yet";

  const chartData: ChartPoint[] = useMemo(
    () => getChartData(appointments, chartRange),
    [appointments, chartRange]
  );

  const totalBookingsInChart = useMemo(
    () => chartData.reduce((sum, item) => sum + item.bookings, 0),
    [chartData]
  );

  return (
    <section className="space-y-7">
      <div>
        <p className="app-kicker">Insights</p>

        <h1 className="app-page-title mt-2">Analytics</h1>

        <p className="app-muted mt-3">
          Understand live client, service and appointment performance from your database.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="app-accent-card p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
            Clients
          </p>
          <h2 className="mt-3 text-5xl font-black">{clients.length}</h2>
          <p className="mt-2 text-sm font-semibold">{activeClients} active</p>
        </div>

        <div className="app-card p-6">
          <p className="app-muted text-sm">Appointments</p>
          <h2 className="mt-3 text-5xl font-black">{appointments.length}</h2>
          <p className="app-muted mt-2 text-sm">
            {confirmedAppointments} confirmed
          </p>
        </div>

        <div className="app-card p-6">
          <p className="app-muted text-sm">Services</p>
          <h2 className="mt-3 text-5xl font-black">{services.length}</h2>
          <p className="app-muted mt-2 text-sm">available offers</p>
        </div>

        <div className="app-card p-6">
          <p className="app-muted text-sm">Returning Clients</p>
          <h2 className="mt-3 text-5xl font-black">{returningClients}</h2>
          <p className="app-muted mt-2 text-sm">relationship strength</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="app-card p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
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
              Based on service catalogue data
            </p>
          </div>

          <div className="app-card p-6">
            <p className="app-muted text-sm">Client activity</p>
            <h2 className="mt-3 text-2xl font-black">
              {activeClients} active clients
            </h2>
            <p className="app-muted mt-1 text-sm">Pulled live from Supabase</p>
          </div>

          <div className="app-card p-6">
            <p className="app-muted text-sm">Booking status</p>
            <h2 className="mt-3 text-2xl font-black">
              {confirmedAppointments} confirmed
            </h2>
            <p className="app-muted mt-1 text-sm">
              Active appointment pipeline
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}