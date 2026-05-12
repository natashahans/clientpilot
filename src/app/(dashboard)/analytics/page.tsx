"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/context/workspace-context";
import { formatPrice } from "@/lib/formatters";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers3,
  Repeat,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

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

  const topService =
    mostPopularService?.[0] || services[0]?.name || "No service yet";

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

  const confirmationRate =
    appointments.length > 0
      ? Math.round((confirmedAppointments / appointments.length) * 100)
      : 0;

  const returningRate =
    clients.length > 0 ? Math.round((returningClients / clients.length) * 100) : 0;

  const averageBookingValue =
    appointments.length > 0 ? Math.round(totalRevenue / appointments.length) : 0;

  const stats = [
    {
      label: "Revenue",
      value: formatPrice(totalRevenue.toString(), workspaceSettings?.currency),
      caption: "from appointments",
      icon: DollarSign,
    },
    {
      label: "Confirmed revenue",
      value: formatPrice(
        confirmedRevenue.toString(),
        workspaceSettings?.currency
      ),
      caption: "secure booking value",
      icon: CheckCircle2,
    },
    {
      label: "Appointments",
      value: appointments.length,
      caption: `${confirmedAppointments} confirmed`,
      icon: CalendarDays,
    },
    {
      label: "Clients",
      value: clients.length,
      caption: `${activeClients} active`,
      icon: Users,
    },
  ];

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="relative overflow-hidden rounded-[38px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="absolute right-[-100px] top-[-110px] h-[300px] w-[300px] rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="absolute bottom-[-130px] left-[22%] h-[260px] w-[260px] rounded-full bg-sky-100/60 blur-3xl" />

          <div className="relative z-10">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4f46e5]">
              Analytics
            </p>

            <h1 className="mt-4 max-w-2xl text-[38px] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[52px]">
              Read your business signals before they get messy.
            </h1>

            <p className="mt-4 max-w-xl text-[14.5px] font-medium leading-7 text-slate-500">
              Understand revenue, booking demand, client movement and service
              performance from live Supabase data.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-[48px] items-center gap-3 rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)]">
                <BarChart3 className="h-4 w-4" />
                Live analytics
              </div>

              <div className="flex h-[48px] items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm">
                <Activity className="h-4 w-4 text-[#4f46e5]" />
                {appointments.length} data points
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#5652f4] via-[#4f46e5] to-[#4338ca] p-6 text-white shadow-[0_24px_70px_rgba(79,70,229,0.22)] sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(0,0,0,0.14),transparent_34%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/55">
                Demand Signal
              </p>

              <h2 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-0.055em]">
                {loading ? "Loading..." : topService}
              </h2>

              <p className="mt-4 text-[14px] font-medium leading-7 text-white/70">
                Your strongest booking signal helps identify what clients are
                choosing most.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                ["Bookings", topServiceBookings],
                ["Rate", `${confirmationRate}%`],
                ["Services", services.length],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                >
                  <p className="text-[11px] font-semibold text-white/55">
                    {label}
                  </p>

                  <p className="mt-2 truncate text-[22px] font-extrabold tracking-[-0.05em]">
                    {loading ? "..." : value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, caption }) => (
          <div
            key={label}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                <Icon className="h-5 w-5" />
              </div>

              <p className="text-right text-[12px] font-semibold text-slate-400">
                {caption}
              </p>
            </div>

            <p className="text-[13px] font-semibold text-slate-500">{label}</p>

            <p className="mt-2 truncate text-[34px] font-extrabold tracking-[-0.06em] text-slate-950">
              {loading ? "..." : value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="absolute right-[-120px] top-[-130px] h-[320px] w-[320px] rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="absolute bottom-[-150px] left-[20%] h-[280px] w-[280px] rounded-full bg-sky-100/50 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
                  Performance Center
                </p>

                <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                  Booking Performance
                </h2>

                <p className="mt-1 max-w-md text-[13px] font-medium leading-6 text-slate-500">
                  Real appointment demand for{" "}
                  {rangeLabels[chartRange].toLowerCase()}.
                </p>
              </div>

              <select
                value={chartRange}
                onChange={(e) => setChartRange(e.target.value as ChartRange)}
                className="h-[42px] rounded-[16px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
              </select>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-4">
              {[
                ["Bookings", totalBookingsInChart],
                ["Avg value", formatPrice(averageBookingValue.toString(), workspaceSettings?.currency)],
                ["Confirmed", `${confirmationRate}%`],
                ["Returning", `${returningRate}%`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl"
                >
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {label}
                  </p>

                  <p className="mt-2 truncate text-[20px] font-extrabold tracking-[-0.045em] text-slate-950">
                    {loading ? "..." : value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_180px]">
              <div className="h-[300px] min-w-0 rounded-[28px] border border-slate-200 bg-white/75 p-3 shadow-sm backdrop-blur-xl">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="analyticsGlow"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(15,23,42,0.08)"
                      strokeDasharray="4 8"
                    />

                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      stroke="rgba(15,23,42,0.42)"
                      fontSize={12}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      stroke="rgba(15,23,42,0.42)"
                      fontSize={12}
                      width={32}
                      allowDecimals={false}
                    />

                    <Tooltip
                      animationDuration={200}
                      formatter={(value) => [`${value} bookings`, "Bookings"]}
                      labelFormatter={(label) =>
                        `${rangeLabels[chartRange]} • ${label}`
                      }
                      contentStyle={{
                        border: "1px solid rgba(15,23,42,0.08)",
                        borderRadius: "18px",
                        boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                      cursor={{
                        stroke: "#4f46e5",
                        strokeOpacity: 0.2,
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="bookings"
                      name="Bookings"
                      stroke="#4f46e5"
                      fill="url(#analyticsGlow)"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        stroke: "white",
                        fill: "#4f46e5",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">
                    Demand bars
                  </p>

                  <p className="mt-1 text-[18px] font-extrabold tracking-[-0.04em]">
                    Activity
                  </p>
                </div>

                <div className="h-[185px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.06)" }}
                        contentStyle={{
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "#020617",
                          color: "white",
                          borderRadius: "14px",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      />

                      <Bar
                        dataKey="bookings"
                        fill="#8b5cf6"
                        radius={[10, 10, 10, 10]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="mt-4 text-[12px] font-semibold leading-5 text-white/55">
                  {totalBookingsInChart} bookings shown for this selected range.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="relative overflow-hidden rounded-[34px] bg-slate-950 p-5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
            <div className="absolute right-[-80px] top-[-80px] h-[200px] w-[200px] rounded-full bg-[#4f46e5]/40 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">
                    ClientPilot Insight
                  </p>

                  <h3 className="mt-1.5 text-[22px] font-extrabold tracking-[-0.045em]">
                    Top service
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl">
                <p className="text-[24px] font-extrabold tracking-[-0.05em]">
                  {loading ? "..." : topService}
                </p>

                <p className="mt-2 text-[13px] font-medium leading-6 text-white/55">
                  {loading
                    ? "Analyzing appointment demand..."
                    : `${topServiceBookings} bookings from appointment records.`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-950">
                  Status Split
                </h3>

                <p className="mt-1 text-[13px] font-medium text-slate-500">
                  Appointment status health.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-4">
              {statusItems.map(([label, count]) => (
                <div key={label as string}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-600">
                      {label}
                    </span>

                    <span className="text-[13px] font-extrabold text-slate-950">
                      {count}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#4f46e5]"
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-extrabold tracking-[-0.04em] text-slate-950">
                    Client Mix
                  </h3>

                  <p className="mt-1 text-[12px] font-medium text-slate-500">
                    Returning share
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                  <Repeat className="h-4 w-4" />
                </div>
              </div>

              <p className="text-[34px] font-extrabold tracking-[-0.06em] text-slate-950">
                {loading ? "..." : `${returningRate}%`}
              </p>

              <div className="mt-4 grid grid-cols-8 gap-1">
                {Array.from({ length: 24 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-6 rounded-full ${
                      index < Math.round((returningRate / 100) * 24)
                        ? "bg-[#4f46e5]"
                        : "bg-slate-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-extrabold tracking-[-0.04em] text-slate-950">
                    Catalogue
                  </h3>

                  <p className="mt-1 text-[12px] font-medium text-slate-500">
                    Available offers
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                  <Layers3 className="h-4 w-4" />
                </div>
              </div>

              <p className="text-[34px] font-extrabold tracking-[-0.06em] text-slate-950">
                {loading ? "..." : services.length}
              </p>

              <p className="mt-3 text-[13px] font-semibold text-slate-400">
                services available in your workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}