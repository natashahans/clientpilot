"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Sparkles, Users, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/formatters";
import { useWorkspace } from "@/context/workspace-context";
import StatsCards from "@/components/dashboard/stats-cards";
import UpcomingAppointments from "@/components/dashboard/upcoming-appointments";
import TopServices from "@/components/dashboard/top-services";
import RecentRevenueActivity from "@/components/dashboard/recent-revenue-activity";
import ClientPipeline from "@/components/dashboard/client-pipeline";
import BookingPerformance from "@/components/dashboard/booking-performance";
import {
  ChartPoint,
  ChartRange,
  getChartData,
} from "@/lib/dashboard-chart";

type Client = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  status: string | null;
  last_visit: string | null;
};

type Service = {
  id: number;
  name: string;
};

type Appointment = {
  id: number;
  client_name: string;
  service: string;
  service_id: number | null;
  time: string;
  status: string | null;
  appointment_at: string | null;
  service_price: number | null;
};

type ChartMode = "bookings" | "revenue";

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [chartRange, setChartRange] = useState<ChartRange>("7days");
  const [chartMode, setChartMode] = useState<ChartMode>("bookings");
  const [loading, setLoading] = useState(true);
  const { workspaceSettings } = useWorkspace();
  const now = new Date();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const [clientsRes, appointmentsRes, servicesRes] = await Promise.all([
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

          supabase
            .from("services")
            .select("id, name")
            .eq("user_id", user.id),
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

        if (servicesRes.error) {
          console.log("DASHBOARD SERVICES ERROR:", servicesRes.error);
        } else {
          setServices(servicesRes.data || []);
        }
      } catch (error) {
        console.log("DASHBOARD FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
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
    .filter((appointment) => {
      if (!appointment.appointment_at) return false;

      return (
        new Date(appointment.appointment_at).getTime() >= now.getTime()
      );
    })
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

  const totalRevenueInChart = useMemo(
    () => chartData.reduce((sum, item) => sum + item.revenue, 0),
    [chartData]
  );

  const hasChartData = chartData.some((item) =>
    chartMode === "bookings" ? item.bookings > 0 : item.revenue > 0
  );
  const totalRevenue = appointments.reduce((sum, appointment) => {
    return sum + (appointment.service_price || 0);
  }, 0);

  const currentMonthRevenue = appointments.reduce((sum, appointment) => {
    if (!appointment.appointment_at) return sum;

    const appointmentDate = new Date(appointment.appointment_at);

    const isCurrentMonth =
      appointmentDate.getMonth() === now.getMonth() &&
      appointmentDate.getFullYear() === now.getFullYear()

    return isCurrentMonth ? sum + (appointment.service_price || 0) : sum;
  }, 0);

  const serviceBookingCounts = appointments.reduce<Record<string, number>>(
    (acc, appointment) => {
      if (!appointment.service) return acc;

      acc[appointment.service] = (acc[appointment.service] || 0) + 1;
      return acc;
    },
    {}
  );

  const mostBookedService =
    Object.entries(serviceBookingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "No service yet";

  const serviceRevenueMap = appointments.reduce<Record<string, number>>(
    (acc, appointment) => {
      if (!appointment.service) return acc;

      acc[appointment.service] =
        (acc[appointment.service] || 0) +
        (appointment.service_price || 0);

      return acc;
    },
    {}
  );

  const topServices = Object.entries(serviceBookingCounts)
    .map(([serviceName, bookings]) => {
      const matchingService = services.find(
        (service) => service.name === serviceName
      );

      return {
        id: matchingService?.id || null,
        name: serviceName,
        bookings,
        revenue: serviceRevenueMap[serviceName] || 0,
      };
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 3);


  const recentRevenueActivity = [...appointments]
    .filter((appointment) => appointment.service_price && appointment.appointment_at)
    .sort(
      (a, b) =>
        new Date(b.appointment_at || "").getTime() -
        new Date(a.appointment_at || "").getTime()
    )
    .slice(0, 5);
  
  
  const todaysAppointments = appointments.filter((appointment) => {
    if (!appointment.appointment_at) return false;

    const appointmentDate = new Date(appointment.appointment_at);

    return (
      appointmentDate.toDateString() === now.toDateString()
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
      label: "Total Revenue",
      value: formatPrice(totalRevenue.toString(), workspaceSettings?.currency),
      change: "from appointments",
      icon: Sparkles,
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
              <p className="app-muted text-sm">This month revenue</p>
              <p className="mt-2 text-2xl font-black tracking-tight">
                {loading
                  ? "..."
                  : formatPrice(currentMonthRevenue.toString(), workspaceSettings?.currency)}
              </p>
              <p className="mt-1 text-sm text-[var(--app-accent)]">
                From booked appointments
              </p>
            </div>
          </div>
          <StatsCards
            loading={loading}
            stats={stats}
          />
        </div>

        <div className="app-accent-card p-6 shadow-2xl shadow-black/30">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
                Smart Signal
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                {loading ? "Loading..." : mostBookedService}
              </h2>
            </div>

            <Sparkles className="h-7 w-7" />
          </div>

          <div className="rounded-[28px] border border-white/35 bg-white/35 p-5 text-black/80 backdrop-blur-xl">
            <p className="text-sm font-semibold text-black/55">Suggested action</p>
            <p className="mt-2 text-xl font-bold text-black/80">
              Your most booked service is leading demand. Use it to create bundles, upsells, or repeat booking offers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.25fr_0.75fr]">
        <BookingPerformance
          loading={loading}
          chartData={chartData}
          chartMode={chartMode}
          chartRange={chartRange}
          hasChartData={hasChartData}
          totalBookingsInChart={totalBookingsInChart}
          totalRevenueInChart={totalRevenueInChart}
          currency={workspaceSettings?.currency}
          onChartModeChange={setChartMode}
          onChartRangeChange={setChartRange}
        />

        <UpcomingAppointments
          loading={loading}
          appointments={upcomingAppointments}
          timezone={workspaceSettings?.timezone}
        />
      </div>

      <TopServices
        loading={loading}
        services={topServices}
        currency={workspaceSettings?.currency}
      />

      <RecentRevenueActivity
        loading={loading}
        appointments={recentRevenueActivity}
        timezone={workspaceSettings?.timezone}
        currency={workspaceSettings?.currency}
      />

      <ClientPipeline
        loading={loading}
        clients={recentClients}
      />
    </section>
  );
}