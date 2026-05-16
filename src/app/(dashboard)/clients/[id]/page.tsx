"use client";

// Same functionality, redesigned UI to match the new system.
// Replace your full file with this.

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
  CalendarDays,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Plus,
  User,
  Briefcase,
  Sparkles,
  X,
} from "lucide-react";

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
  service_price: number | null;
  status: string | null;
  appointment_at: string | null;
};

type Service = {
  id: number;
  name: string;
  price: string;
  duration: string | null;
};

export default function ClientDetailsPage() {
  const params = useParams();
  const clientId = Number(params.id);
  const { workspaceSettings } = useWorkspace();

  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [savingAppointment, setSavingAppointment] = useState(false);
  const [appointmentError, setAppointmentError] = useState("");

  const [appointmentForm, setAppointmentForm] = useState({
    service_id: "",
    service: "",
    service_price: "",
    appointment_at: "",
    status: "Confirmed",
  });

  useEffect(() => {
    async function fetchClientDetails() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !clientId) {
        setLoading(false);
        return;
      }

      const [clientRes, appointmentsRes, servicesRes] = await Promise.all([
        supabase
          .from("clients")
          .select("*")
          .eq("id", clientId)
          .eq("user_id", user.id)
          .single(),

        supabase
          .from("appointments")
          .select("*")
          .eq("client_id", clientId)
          .eq("user_id", user.id)
          .order("appointment_at", { ascending: false }),

        supabase
          .from("services")
          .select("*")
          .eq("user_id", user.id)
          .order("name", { ascending: true }),
      ]);

      if (clientRes.error) {
        console.log("CLIENT DETAIL ERROR:", clientRes.error);
      } else {
        setClient(clientRes.data);
      }

      if (appointmentsRes.error) {
        console.log("CLIENT APPOINTMENTS ERROR:", appointmentsRes.error);
      } else {
        setAppointments(appointmentsRes.data || []);
      }

      if (servicesRes.error) {
        console.log("CLIENT DETAIL SERVICES ERROR:", servicesRes.error);
      } else {
        setServices(servicesRes.data || []);
      }

      setLoading(false);
    }

    fetchClientDetails();
  }, [clientId]);

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

  function openNewAppointmentModal() {
    setAppointmentError("");

    setAppointmentForm({
      service_id: "",
      service: "",
      service_price: "",
      appointment_at: "",
      status: "Confirmed",
    });

    setShowAppointmentModal(true);
  }

  async function createAppointmentForClient() {
    setAppointmentError("");

    if (!client) return;

    if (!appointmentForm.service_id) {
      setAppointmentError("Please select a service.");
      return;
    }

    if (!appointmentForm.appointment_at.trim()) {
      setAppointmentError("Please select appointment date and time.");
      return;
    }

    setSavingAppointment(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavingAppointment(false);
      return;
    }

    const appointmentIso = new Date(appointmentForm.appointment_at).toISOString();

    const appointmentTime = formatTimeWithTimezone(
      appointmentIso,
      workspaceSettings?.timezone
    );

    const { error } = await supabase.from("appointments").insert([
      {
        client_id: client.id,
        client_name: client.name,
        service_id: Number(appointmentForm.service_id),
        service: appointmentForm.service,
        service_price: appointmentForm.service_price
          ? parseFloat(appointmentForm.service_price)
          : null,
        time: appointmentTime,
        appointment_at: appointmentIso,
        status: appointmentForm.status,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.log("CREATE CLIENT APPOINTMENT ERROR:", error);
      setSavingAppointment(false);
      return;
    }

    setSavingAppointment(false);
    setShowAppointmentModal(false);

    setAppointmentForm({
      service_id: "",
      service: "",
      service_price: "",
      appointment_at: "",
      status: "Confirmed",
    });

    const { data: newAppointments } = await supabase
      .from("appointments")
      .select("*")
      .eq("client_id", client.id)
      .eq("user_id", user.id)
      .order("appointment_at", { ascending: false });

    setAppointments(newAppointments || []);
  }

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

  if (!client) {
    return (
      <section className="grid gap-4">
        <Link
          href="/clients"
          className="flex h-[44px] w-fit items-center gap-2 rounded-[16px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>

        <div className="rounded-[34px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-extrabold text-slate-950">
            Client not found
          </p>

          <p className="mt-2 text-sm font-medium text-slate-500">
            This client may not exist or may not belong to this workspace.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="grid gap-4">
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="relative overflow-hidden rounded-[38px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute right-[-100px] top-[-110px] h-[300px] w-[300px] rounded-full bg-indigo-100/70 blur-3xl" />
            <div className="absolute bottom-[-130px] left-[22%] h-[260px] w-[260px] rounded-full bg-sky-100/60 blur-3xl" />

            <div className="relative z-10">
              <Link
                href="/clients"
                className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-400 transition hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Clients
              </Link>

              <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.2em] text-[#4f46e5]">
                Client Profile
              </p>

              <h1 className="mt-4 max-w-2xl text-[38px] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[52px]">
                {client.name}
              </h1>

              <p className="mt-4 max-w-xl text-[14.5px] font-medium leading-7 text-slate-500">
                View client details, appointment history, revenue and booking
                activity from one focused profile.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={openNewAppointmentModal}
                  className="flex h-[48px] items-center justify-center gap-2 rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
                >
                  <Plus className="h-4 w-4" />
                  New Appointment
                </button>

                <div className="flex h-[48px] items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm">
                  <User className="h-4 w-4 text-[#4f46e5]" />
                  {client.status || "No status"}
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#5652f4] via-[#4f46e5] to-[#4338ca] p-6 text-white shadow-[0_24px_70px_rgba(79,70,229,0.22)] sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(0,0,0,0.14),transparent_34%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/55">
                  Client Value
                </p>

                <h2 className="mt-3 text-[42px] font-extrabold leading-tight tracking-[-0.06em]">
                  {formatPrice(
                    totalRevenue.toString(),
                    workspaceSettings?.currency
                  )}
                </h2>

                <p className="mt-4 text-[14px] font-medium leading-7 text-white/70">
                  Total tracked appointment value from this client.
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
              value: formatPrice(
                totalRevenue.toString(),
                workspaceSettings?.currency
              ),
              caption: "from this client",
              icon: DollarSign,
            },
            {
              label: "Appointments",
              value: appointments.length,
              caption: `${confirmedAppointments} confirmed`,
              icon: CalendarDays,
            },
            {
              label: "Preferred Service",
              value: client.service || "Not set",
              caption: "client preference",
              icon: Briefcase,
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

                <p className="text-right text-[12px] font-semibold text-slate-400">
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
                  Client Details
                </h2>

                <p className="mt-1 text-[13px] font-medium text-slate-500">
                  Contact and relationship information.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  ["Name", client.name, User],
                  ["Email", client.email || "Not set", Mail],
                  ["Phone", client.phone || "Not set", Phone],
                  ["Preferred Service", client.service || "Not set", Briefcase],
                  ["Last Visit", client.last_visit || "Not set", Clock],
                  ["Status", client.status || "Not set", Sparkles],
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
                  Relationship Signal
                </p>

                <h3 className="mt-2 text-[24px] font-extrabold tracking-[-0.05em]">
                  {client.status || "No status"}
                </h3>

                <p className="mt-2 text-[13px] font-medium leading-6 text-white/55">
                  This profile helps you understand client activity, booking
                  value and service preference.
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
                  Bookings linked to this client.
                </p>
              </div>

              <button
                onClick={openNewAppointmentModal}
                className="flex h-[44px] items-center justify-center gap-2 rounded-[16px] bg-[#4f46e5] px-4 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca]"
              >
                <Plus className="h-4 w-4" />
                Add Booking
              </button>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-200">
              <div className="hidden grid-cols-[0.85fr_1.2fr_0.75fr] bg-slate-50 px-5 py-3 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-slate-400 md:grid">
                <p>Time</p>
                <p>Service</p>
                <p className="text-right">Value</p>
              </div>

              <div className="divide-y divide-slate-100 bg-white">
                {appointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="font-bold text-slate-950">
                      No appointment history yet
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      New appointments linked to this client will appear here.
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
                          {appointment.service}
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

      {showAppointmentModal && client && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[34px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
                  New Booking
                </p>

                <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                  Add Appointment
                </h2>

                <p className="mt-2 text-[13px] font-medium leading-6 text-slate-500">
                  Create a new appointment for {client.name}.
                </p>
              </div>

              <button
                onClick={() => setShowAppointmentModal(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4">
              <input
                value={client.name}
                disabled
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium text-slate-400 outline-none"
              />

              <select
                value={appointmentForm.service_id}
                onChange={(e) => {
                  const selectedService = services.find(
                    (service) => service.id.toString() === e.target.value
                  );

                  setAppointmentForm({
                    ...appointmentForm,
                    service_id: selectedService?.id.toString() || "",
                    service: selectedService?.name || "",
                    service_price: selectedService?.price || "",
                  });
                }}
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">Select service</option>

                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                value={appointmentForm.service_price}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    service_price: e.target.value,
                  })
                }
                placeholder="Service price"
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <input
                type="datetime-local"
                value={appointmentForm.appointment_at}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    appointment_at: e.target.value,
                  })
                }
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <select
                value={appointmentForm.status}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    status: e.target.value,
                  })
                }
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option>Confirmed</option>
                <option>In Progress</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>

            {appointmentError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {appointmentError}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowAppointmentModal(false)}
                disabled={savingAppointment}
                className="h-[48px] rounded-[18px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={createAppointmentForClient}
                disabled={savingAppointment}
                className="h-[48px] rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingAppointment ? "Saving..." : "Save Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}