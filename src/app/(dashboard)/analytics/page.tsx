"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
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
};

type Service = {
  id: number;
  name: string;
  tag: string | null;
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
    { label: "Mon", bookings: 40 },
    { label: "Tue", bookings: 55 },
    { label: "Wed", bookings: 48 },
    { label: "Thu", bookings: 70 },
    { label: "Fri", bookings: 62 },
    { label: "Sat", bookings: 85 },
    { label: "Sun", bookings: 60 },
  ],
  "30days": [
    { label: "Week 1", bookings: 150 },
    { label: "Week 2", bookings: 178 },
    { label: "Week 3", bookings: 164 },
    { label: "Week 4", bookings: 205 },
  ],
};

const rangeLabels = {
  today: "Today",
  "7days": "Last 7 days",
  "30days": "Last 30 days",
};

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
        .select("*");
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

  const chartData = chartDataByRange[chartRange];

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
                Estimated appointment demand for {rangeLabels[chartRange].toLowerCase()}.
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

          <div className="h-72">
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

                <XAxis dataKey="label" stroke="var(--app-muted)" />

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
                  fill="url(#analyticsGlow)"
                  strokeWidth={3}
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