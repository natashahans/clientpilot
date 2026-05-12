"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Sparkles,
  Users,
  UserPlus,
  Activity,
  Wallet,
  Clock3,
  TrendingUp,
  Repeat,
  Gauge,
  Layers3,
  Brain,
  Target,
  BadgeCheck,
} from "lucide-react";
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
import {
  getCurrentMonthRevenue,
  getMostBookedService,
  getRecentRevenueActivity,
  getTodaysAppointments,
  getTopServices,
  getTotalRevenue,
} from "@/lib/dashboard-metrics";

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

        if (!user) return;

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

          supabase.from("services").select("id, name").eq("user_id", user.id),
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
  const activeClients = clients.filter((client) => client.status === "Active").length;
  const newClients = clients.filter((client) => client.status === "New").length;
  const returningClients = clients.filter(
    (client) => client.status === "Returning"
  ).length;

  const recentClients = clients.slice(0, 4);

  const upcomingAppointments = [...appointments]
    .filter((appointment) => {
      if (!appointment.appointment_at) return false;
      return new Date(appointment.appointment_at).getTime() >= now.getTime();
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

  const totalRevenue = getTotalRevenue(appointments);
  const currentMonthRevenue = getCurrentMonthRevenue(appointments, now);
  const mostBookedService = getMostBookedService(appointments);
  const topServices = getTopServices(appointments, services);
  const recentRevenueActivity = getRecentRevenueActivity(appointments);
  const todaysAppointments = getTodaysAppointments(appointments, now);

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;

  const completionRate =
    appointments.length > 0
      ? Math.round((confirmedAppointments / appointments.length) * 100)
      : 0;

  const returningRate =
    totalClients > 0 ? Math.round((returningClients / totalClients) * 100) : 0;

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
      change: "live bookings",
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

  const insightCards = [
    {
      title: "Demand focus",
      value: mostBookedService,
      text: "This service is currently your strongest signal. Push it in bundles or repeat-booking offers.",
      icon: Target,
    },
    {
      title: "Retention signal",
      value: `${returningRate}%`,
      text:
        returningRate > 0
          ? "Returning clients are showing up in your client mix."
          : "No returning client pattern yet. Focus on follow-ups after appointments.",
      icon: Repeat,
    },
    {
      title: "Booking health",
      value: `${completionRate}%`,
      text:
        completionRate >= 60
          ? "Most bookings are moving toward confirmed status."
          : "A higher confirmed booking rate would make revenue more predictable.",
      icon: BadgeCheck,
    },
  ];

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="relative overflow-hidden rounded-[38px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="absolute right-[-80px] top-[-90px] h-[260px] w-[260px] rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="absolute bottom-[-110px] left-[30%] h-[260px] w-[260px] rounded-full bg-sky-100/60 blur-3xl" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4f46e5]">
                Business Overview
              </p>

              <h1 className="mt-4 max-w-2xl text-[36px] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[48px]">
                Run your service business from one calm workspace.
              </h1>

              <p className="mt-4 max-w-xl text-[14.5px] font-medium leading-7 text-slate-500">
                Track clients, appointments, service demand and revenue without
                jumping between messy tools.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Clients", value: totalClients, icon: Users },
                  { label: "Today", value: todaysAppointments, icon: Clock3 },
                  {
                    label: "Revenue",
                    value: formatPrice(
                      totalRevenue.toString(),
                      workspaceSettings?.currency
                    ),
                    icon: Wallet,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                      <Icon className="h-4 w-4 text-[#4f46e5]" />
                    </div>

                    <p className="text-[12px] font-semibold text-slate-400">
                      {label}
                    </p>

                    <p className="mt-1 text-[24px] font-extrabold tracking-[-0.05em] text-slate-950">
                      {loading ? "..." : value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-slate-50/80 p-5 shadow-sm backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-slate-950">
                    Revenue Pulse
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-slate-400">
                    This month snapshot
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#4f46e5] shadow-sm">
                  <Activity className="h-4 w-4" />
                </div>
              </div>

              <p className="text-[34px] font-extrabold tracking-[-0.06em] text-slate-950">
                {loading
                  ? "..."
                  : formatPrice(
                      currentMonthRevenue.toString(),
                      workspaceSettings?.currency
                    )}
              </p>

              <div className="mt-5 flex items-end gap-2">
                {[42, 58, 35, 74, 62, 88, 66, 92, 70, 84].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-full bg-indigo-100"
                      style={{ height: `${height}px` }}
                    >
                      <div
                        className="rounded-full bg-[#4f46e5]"
                        style={{ height: `${Math.max(height - 20, 18)}px` }}
                      />
                    </div>
                  )
                )}
              </div>

              <p className="mt-4 text-[12.5px] font-bold text-[#4f46e5]">
                From booked appointments
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#5652f4] via-[#4f46e5] to-[#4338ca] p-6 text-white shadow-[0_24px_70px_rgba(79,70,229,0.22)] sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(0,0,0,0.14),transparent_34%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/55">
                    Smart Signal
                  </p>

                  <h2 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-0.055em]">
                    {loading ? "Loading..." : mostBookedService}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>

              <div className="rounded-[28px] border border-white/15 bg-white/[0.12] p-5 backdrop-blur-xl">
                <p className="text-[13px] font-semibold text-white/65">
                  Suggested action
                </p>

                <p className="mt-2 text-[18px] font-bold leading-7 text-white">
                  Your most booked service is leading demand. Use it to create
                  bundles, upsells, or repeat booking offers.
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                ["Clients", totalClients],
                ["Bookings", appointments.length],
                ["Services", services.length],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                >
                  <p className="text-[11px] font-semibold text-white/55">
                    {label}
                  </p>

                  <p className="mt-2 text-[24px] font-extrabold tracking-[-0.05em]">
                    {loading ? "..." : value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StatsCards loading={loading} stats={stats} />

      <div className="grid gap-4 xl:grid-cols-[1.28fr_0.72fr]">
        <div className="grid gap-4">
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

          <RecentRevenueActivity
            loading={loading}
            appointments={recentRevenueActivity}
            timezone={workspaceSettings?.timezone}
            currency={workspaceSettings?.currency}
          />

          <ClientPipeline loading={loading} clients={recentClients} />
        </div>

        <div className="grid content-start gap-4">
          <UpcomingAppointments
            loading={loading}
            appointments={upcomingAppointments}
            timezone={workspaceSettings?.timezone}
          />

          <div className="relative overflow-hidden rounded-[30px] bg-slate-950 p-4 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
            <div className="absolute right-[-80px] top-[-80px] h-[200px] w-[200px] rounded-full bg-[#4f46e5]/40 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">
                    ClientPilot Insights
                  </p>

                  <h3 className="mt-1.5 text-[20px] font-extrabold tracking-[-0.045em]">
                    Smart recommendations
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Brain className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-2.5">
                {insightCards.map(({ title, value, text, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-[20px] border border-white/10 bg-white/[0.08] p-3.5 backdrop-blur-xl"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <p className="text-[12.5px] font-bold text-white/65">
                          {title}
                        </p>
                      </div>

                      <p className="max-w-[130px] truncate text-right text-[13px] font-extrabold text-white">
                        {loading ? "..." : value}
                      </p>
                    </div>

                    <p className="text-[12px] font-medium leading-5 text-white/55">
                      {loading ? "Analyzing workspace data..." : text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <TopServices
            loading={loading}
            services={topServices}
            currency={workspaceSettings?.currency}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-slate-950">
                    Booking Health
                  </p>

                  <p className="mt-1 text-[12px] font-medium text-slate-400">
                    Confirmed vs pending
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                  <Gauge className="h-4 w-4" />
                </div>
              </div>

              <p className="text-[30px] font-extrabold tracking-[-0.06em] text-slate-950">
                {loading ? "..." : `${completionRate}%`}
              </p>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#4f46e5]"
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[12px] font-semibold text-slate-400">
                <span>{confirmedAppointments} confirmed</span>
                <span>{pendingAppointments} pending</span>
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-slate-950">
                    Client Mix
                  </p>

                  <p className="mt-1 text-[12px] font-medium text-slate-400">
                    Returning client share
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                  <Repeat className="h-4 w-4" />
                </div>
              </div>

              <p className="text-[30px] font-extrabold tracking-[-0.06em] text-slate-950">
                {loading ? "..." : `${returningRate}%`}
              </p>

              <div className="mt-3 grid grid-cols-8 gap-1">
                {Array.from({ length: 24 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-5 rounded-full ${
                      index < Math.round((returningRate / 100) * 24)
                        ? "bg-[#4f46e5]"
                        : "bg-slate-100"
                    }`}
                  />
                ))}
              </div>

              <p className="mt-3 text-[12px] font-semibold text-slate-400">
                {returningClients} returning clients from {totalClients} total
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-slate-950">
                  Demand Snapshot
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-400">
                  Services and bookings overview
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                <Layers3 className="h-4 w-4" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                ["Services", services.length],
                ["Bookings", appointments.length],
                ["Top", topServices[0]?.bookings || 0],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </p>

                  <p className="mt-1.5 text-[22px] font-extrabold tracking-[-0.05em] text-slate-950">
                    {loading ? "..." : value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-[18px] bg-indigo-50 p-3 text-[#4f46e5]">
              <TrendingUp className="h-4 w-4" />

              <p className="text-[12.5px] font-bold">
                {loading
                  ? "Checking demand..."
                  : `${mostBookedService} is currently your strongest demand signal.`}
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-slate-950">
                  Workspace Summary
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-400">
                  Operational snapshot.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                ["Clients", totalClients],
                ["Active", activeClients],
                ["Bookings", appointments.length],
                ["Services", services.length],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </p>

                  <p className="mt-1.5 text-[22px] font-extrabold tracking-[-0.05em] text-slate-950">
                    {loading ? "..." : value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}