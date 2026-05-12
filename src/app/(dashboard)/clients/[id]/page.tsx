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

  function openNewAppointmentModal() {
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
    if (
      !client ||
      !appointmentForm.service_id ||
      !appointmentForm.appointment_at.trim()
    ) {
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
      <section className="space-y-6">
        <div className="app-card h-[160px] animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="app-card h-[120px] animate-pulse" />
          <div className="app-card h-[120px] animate-pulse" />
          <div className="app-card h-[120px] animate-pulse" />
        </div>
      </section>
    );
  }

  if (!client) {
    return (
      <section className="space-y-6">
        <Link href="/clients" className="app-button-secondary px-4 py-2">
          Back to Clients
        </Link>

        <div className="app-card p-8 text-center">
          <p className="text-xl font-black">Client not found</p>
          <p className="app-muted mt-2 text-sm">
            This client may not exist or may not belong to this workspace.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/clients" className="app-muted text-sm hover:text-white">
            ← Back to Clients
          </Link>

          <p className="app-kicker mt-6">Client Profile</p>

          <h1 className="app-page-title mt-2">{client.name}</h1>

          <p className="app-muted mt-3">
            View appointment history, revenue and relationship activity.
          </p>
        </div>

        <button
          onClick={openNewAppointmentModal}
          className="app-button-primary px-5 py-3"
        >
          New Appointment
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="app-accent-card p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
            Revenue
          </p>
          <h2 className="mt-3 text-5xl font-black">
            {formatPrice(totalRevenue.toString(), workspaceSettings?.currency)}
          </h2>
          <p className="mt-2 text-sm font-semibold">from this client</p>
        </div>

        <div className="app-card p-6">
          <p className="app-muted text-sm">Appointments</p>
          <h2 className="mt-3 text-5xl font-black">{appointments.length}</h2>
          <p className="app-muted mt-2 text-sm">
            {confirmedAppointments} confirmed
          </p>
        </div>

        <div className="app-card p-6">
          <p className="app-muted text-sm">Status</p>
          <h2 className="mt-3 text-4xl font-black">
            {client.status || "Not set"}
          </h2>
          <p className="app-muted mt-2 text-sm">
            {client.email || "No email saved"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="app-card p-6">
          <h2 className="app-section-title">Client Details</h2>

          <div className="mt-6 space-y-3">
            {[
              ["Name", client.name],
              ["Email", client.email],
              ["Phone", client.phone],
              ["Main Service", client.service],
              ["Last Visit", client.last_visit],
              ["Status", client.status],
            ].map(([label, value]) => (
              <div
                key={label}
                className="app-card-dark flex items-center justify-between gap-4 px-5 py-4"
              >
                <p className="app-muted text-sm">{label}</p>
                <p className="text-right font-bold">{value || "Not set"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card p-6">
          <div className="mb-6">
            <h2 className="app-section-title">Appointment History</h2>
            <p className="app-muted mt-1 text-sm">
              Bookings linked to this client.
            </p>
          </div>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="app-card-dark p-6 text-center">
                <p className="font-bold">No appointment history yet</p>
                <p className="app-muted mt-1 text-sm">
                  New appointments linked to this client will appear here.
                </p>
              </div>
            ) : (
              appointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/appointments/${appointment.id}`}
                  className="app-card-dark grid gap-4 px-5 py-4 transition hover:bg-white/[0.06] md:grid-cols-[0.9fr_1.2fr_0.8fr] md:items-center"
                >
                  <div>
                    <p className="font-black text-[var(--app-accent)]">
                      {formatTimeWithTimezone(
                        appointment.appointment_at,
                        workspaceSettings?.timezone
                      )}
                    </p>

                    <p className="app-muted mt-1 text-xs">
                      {formatDateWithTimezone(
                        appointment.appointment_at,
                        workspaceSettings?.timezone
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold">{appointment.service}</p>
                    <p className="app-muted mt-1 text-sm">
                      {appointment.status || "No status"}
                    </p>
                  </div>

                  <p className="font-black text-[var(--app-accent)] md:text-right">
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
    </section>

    {showAppointmentModal && client && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
        <div className="app-card max-h-[90vh] w-full max-w-xl overflow-y-auto p-5 sm:p-7">
          <div className="mb-6">
            <p className="app-kicker">New Booking</p>

            <h2 className="app-section-title mt-2">
              Add Appointment
            </h2>

            <p className="app-muted mt-2 text-sm">
              Create a new appointment for {client.name}.
            </p>
          </div>

          <div className="grid gap-4">
            <input
              value={client.name}
              disabled
              className="app-input px-4 py-3 opacity-70"
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
              className="app-input px-4 py-3"
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
              className="app-input px-4 py-3"
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
              className="app-input px-4 py-3"
            />

            <select
              value={appointmentForm.status}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  status: e.target.value,
                })
              }
              className="app-input px-4 py-3"
            >
              <option>Confirmed</option>
              <option>In Progress</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={() => setShowAppointmentModal(false)}
              disabled={savingAppointment}
              className="app-button-secondary w-full px-5 py-3 sm:w-auto"
            >
              Cancel
            </button>

            <button
              onClick={createAppointmentForClient}
              disabled={savingAppointment}
              className="app-button-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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