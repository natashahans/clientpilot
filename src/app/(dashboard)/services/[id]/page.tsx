"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/context/workspace-context";
import {
  formatDateWithTimezone,
  formatPrice,
  formatTimeWithTimezone,
} from "@/lib/formatters";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Clock,
  DollarSign,
  Sparkles,
  Tag,
  TrendingUp,
  User,
} from "lucide-react";

type Service = {
  id: number;
  name: string;
  price: string;
  duration: string | null;
  tag: string | null;
};

type Appointment = {
  id: number;
  client_name: string;
  service_price: number | null;
  status: string | null;
  appointment_at: string | null;
};

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceId = Number(params.id);
  const { workspaceSettings } = useWorkspace();

  const [service, setService] = useState<Service | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServiceDetails() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !serviceId) {
        setLoading(false);
        return;
      }

      const [serviceRes, appointmentsRes] = await Promise.all([
        supabase
          .from("services")
          .select("*")
          .eq("id", serviceId)
          .eq("user_id", user.id)
          .single(),

        supabase
          .from("appointments")
          .select("*")
          .eq("service_id", serviceId)
          .eq("user_id", user.id)
          .order("appointment_at", { ascending: false }),
      ]);

      if (!serviceRes.error) {
        setService(serviceRes.data);
      }

      if (!appointmentsRes.error) {
        setAppointments(appointmentsRes.data || []);
      }

      setLoading(false);
    }

    fetchServiceDetails();
  }, [serviceId]);

  const totalRevenue = appointments.reduce((sum, appointment) => {
    return sum + (appointment.service_price || 0);
  }, 0);

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  const upcomingAppointments = appointments.filter((appointment) => {
    if (!appointment.appointment_at) return false;
    return new Date(appointment.appointment_at).getTime() >= new Date().getTime();
  });

  const averageRevenue =
    appointments.length > 0 ? Math.round(totalRevenue / appointments.length) : 0;

  if (loading) {
    return (
      <section className="grid gap-4">
        <div className="h-[260px] animate-pulse rounded-[38px] border border-slate-200 bg-white" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-[150px] animate-pulse rounded-[28px] border border-slate-200 bg-white" />
          <div className="h-[150px] animate-pulse rounded-[28px] border border-slate-200 bg-white" />
          <div className="h-[150px] animate-pulse rounded-[28px] border border-slate-200 bg-white" />
        </div>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="grid gap-4">
        <Link
          href="/services"
          className="flex h-[44px] w-fit items-center gap-2 rounded-[16px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Link>

        <div className="rounded-[34px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-extrabold text-slate-950">
            Service not found
          </p>

          <p className="mt-2 text-sm font-medium text-slate-500">
            This service may not exist or may not belong to this workspace.
          </p>
        </div>
      </section>
    );
  }

  const basePrice = formatPrice(service.price, workspaceSettings?.currency);

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="relative overflow-hidden rounded-[38px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="absolute right-[-100px] top-[-110px] h-[300px] w-[300px] rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="absolute bottom-[-130px] left-[22%] h-[260px] w-[260px] rounded-full bg-sky-100/60 blur-3xl" />

          <div className="relative z-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-400 transition hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>

            <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.2em] text-[#4f46e5]">
              Service Profile
            </p>

            <h1 className="mt-4 max-w-2xl text-[38px] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[52px]">
              {service.name}
            </h1>

            <p className="mt-4 max-w-xl text-[14.5px] font-medium leading-7 text-slate-500">
              View service pricing, booking demand, revenue performance and
              appointment history in one focused profile.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-[48px] items-center gap-3 rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)]">
                <Briefcase className="h-4 w-4" />
                {service.tag || "No tag"}
              </div>

              <div className="flex h-[48px] items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm">
                <Clock className="h-4 w-4 text-[#4f46e5]" />
                {service.duration || "No duration"}
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#5652f4] via-[#4f46e5] to-[#4338ca] p-6 text-white shadow-[0_24px_70px_rgba(79,70,229,0.22)] sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(0,0,0,0.14),transparent_34%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/55">
                Service Revenue
              </p>

              <h2 className="mt-3 text-[42px] font-extrabold leading-tight tracking-[-0.06em]">
                {formatPrice(totalRevenue.toString(), workspaceSettings?.currency)}
              </h2>

              <p className="mt-4 text-[14px] font-medium leading-7 text-white/70">
                Total tracked appointment revenue generated by this service.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                ["Bookings", appointments.length],
                ["Confirmed", confirmedAppointments],
                ["Upcoming", upcomingAppointments.length],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                >
                  <p className="text-[11px] font-semibold text-white/55">
                    {label}
                  </p>

                  <p className="mt-2 text-[24px] font-extrabold tracking-[-0.05em]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Revenue",
            value: formatPrice(totalRevenue.toString(), workspaceSettings?.currency),
            caption: "generated by service",
            icon: DollarSign,
          },
          {
            label: "Bookings",
            value: appointments.length,
            caption: `${confirmedAppointments} confirmed`,
            icon: CalendarDays,
          },
          {
            label: "Base Price",
            value: basePrice,
            caption: service.duration || "No duration",
            icon: Tag,
          },
        ].map(({ label, value, icon: Icon, caption }) => (
          <div
            key={label}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                <Icon className="h-5 w-5" />
              </div>

              <p className="max-w-[130px] truncate text-right text-[12px] font-semibold text-slate-400">
                {caption}
              </p>
            </div>

            <p className="text-[13px] font-semibold text-slate-500">{label}</p>

            <p className="mt-2 truncate text-[30px] font-extrabold tracking-[-0.06em] text-slate-950">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="grid gap-4">
          <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-[24px] font-extrabold tracking-[-0.045em] text-slate-950">
                Service Details
              </h2>

              <p className="mt-1 text-[13px] font-medium text-slate-500">
                Pricing and catalogue information.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ["Name", service.name, Briefcase],
                ["Price", basePrice, DollarSign],
                ["Duration", service.duration || "Not set", Clock],
                ["Tag", service.tag || "Not set", Tag],
              ].map(([label, value, Icon]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#4f46e5] ring-1 ring-indigo-100">
                      <Icon className="h-4 w-4" />
                    </div>

                    <p className="text-[13px] font-bold text-slate-500">
                      {label as string}
                    </p>
                  </div>

                  <p className="max-w-[170px] truncate text-right text-[13.5px] font-extrabold text-slate-950">
                    {value as string}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[34px] bg-slate-950 p-5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
            <div className="absolute right-[-80px] top-[-80px] h-[200px] w-[200px] rounded-full bg-[#4f46e5]/40 blur-3xl" />

            <div className="relative z-10">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">
                Performance Signal
              </p>

              <h3 className="mt-2 text-[24px] font-extrabold tracking-[-0.05em]">
                {formatPrice(
                  averageRevenue.toString(),
                  workspaceSettings?.currency
                )}
              </h3>

              <p className="mt-2 text-[13px] font-medium leading-6 text-white/55">
                Average tracked value per appointment for this service.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                Appointment History
              </h2>

              <p className="mt-1 text-[13px] font-medium text-slate-500">
                All bookings linked to this service.
              </p>
            </div>

            <div className="flex h-[44px] items-center gap-2 rounded-[16px] border border-indigo-100 bg-indigo-50 px-4 text-[13px] font-bold text-[#4f46e5]">
              <TrendingUp className="h-4 w-4" />
              {appointments.length} bookings
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200">
            <div className="hidden grid-cols-[0.85fr_1.2fr_0.75fr] bg-slate-50 px-5 py-3 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-slate-400 md:grid">
              <p>Time</p>
              <p>Client</p>
              <p className="text-right">Value</p>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {appointments.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="font-bold text-slate-950">No bookings yet</p>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    New bookings linked to this service will appear here.
                  </p>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <Link
                    key={appointment.id}
                    href={`/appointments/${appointment.id}`}
                    className="grid gap-4 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[0.85fr_1.2fr_0.75fr] md:items-center"
                  >
                    <div>
                      <p className="text-[14px] font-extrabold text-[#4f46e5]">
                        {formatTimeWithTimezone(
                          appointment.appointment_at,
                          workspaceSettings?.timezone
                        )}
                      </p>

                      <p className="mt-1 text-[12px] font-medium text-slate-400">
                        {formatDateWithTimezone(
                          appointment.appointment_at,
                          workspaceSettings?.timezone
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[14px] font-extrabold text-slate-950">
                        {appointment.client_name}
                      </p>

                      <p className="mt-1 text-[12px] font-medium text-slate-400">
                        {appointment.status || "No status"}
                      </p>
                    </div>

                    <p className="text-[16px] font-extrabold text-[#4f46e5] md:text-right">
                      {appointment.service_price
                        ? formatPrice(
                            appointment.service_price.toString(),
                            workspaceSettings?.currency
                          )
                        : "No price"}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}