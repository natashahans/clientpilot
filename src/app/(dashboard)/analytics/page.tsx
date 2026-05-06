"use client";

import { useEffect, useState } from "react";
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

const chartData = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 55 },
  { day: "Wed", value: 48 },
  { day: "Thu", value: 70 },
  { day: "Fri", value: 62 },
  { day: "Sat", value: 85 },
  { day: "Sun", value: 60 },
];

export default function AnalyticsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);

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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="app-section-title">Booking Performance</h2>
              <p className="app-muted text-sm">
                Visual trend placeholder for weekly appointment movement.
              </p>
            </div>

            <span className="app-button-secondary px-4 py-2">
              Last 7 days
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
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

                <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" />

                <Tooltip
                  cursor={{ stroke: "rgba(215,255,95,0.25)" }}
                  contentStyle={{
                    background: "var(--app-surface)",
                    border: "1px solid var(--app-border)",
                    borderRadius: "18px",
                    color: "var(--app-text)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--app-accent)"
                  fill="url(#color)"
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