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

type Appointment = {
  id: number;
  client_name: string;
  service: string;
  client_id: number | null;
  service_id: number | null;
  time: string;
  status: string | null;
  appointment_at: string | null;
  service_price: number | null;
};

export default function AppointmentDetailsPage() {
  const params = useParams();
  const appointmentId = Number(params.id);
  const { workspaceSettings } = useWorkspace();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointmentDetails() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !appointmentId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.log("APPOINTMENT DETAIL ERROR:", error);
      } else {
        setAppointment(data);
      }

      setLoading(false);
    }

    fetchAppointmentDetails();
  }, [appointmentId]);

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

  if (!appointment) {
    return (
      <section className="space-y-6">
        <Link href="/appointments" className="app-button-secondary px-4 py-2">
          Back to Appointments
        </Link>

        <div className="app-card p-8 text-center">
          <p className="text-xl font-black">Appointment not found</p>
          <p className="app-muted mt-2 text-sm">
            This appointment may not exist or may not belong to this workspace.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/appointments" className="app-muted text-sm hover:text-white">
            ← Back to Appointments
          </Link>

          <p className="app-kicker mt-6">Appointment Details</p>

          <h1 className="app-page-title mt-2">{appointment.client_name}</h1>

          <p className="app-muted mt-3">
            View booking time, service, revenue and linked records.
          </p>
        </div>

        <Link href="/appointments" className="app-button-primary px-5 py-3">
          Manage Appointment
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="app-accent-card p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
            Price
          </p>

          <h2 className="mt-3 text-5xl font-black">
            {appointment.service_price
              ? formatPrice(
                  appointment.service_price.toString(),
                  workspaceSettings?.currency
                )
              : "No price"}
          </h2>

          <p className="mt-2 text-sm font-semibold">for this booking</p>
        </div>

        <div className="app-card p-6">
          <p className="app-muted text-sm">Time</p>

          <h2 className="mt-3 text-4xl font-black">
            {formatTimeWithTimezone(
              appointment.appointment_at,
              workspaceSettings?.timezone
            )}
          </h2>

          <p className="app-muted mt-2 text-sm">
            {formatDateWithTimezone(
              appointment.appointment_at,
              workspaceSettings?.timezone
            )}
          </p>
        </div>

        <div className="app-card p-6">
          <p className="app-muted text-sm">Status</p>

          <h2 className="mt-3 text-4xl font-black">
            {appointment.status || "Not set"}
          </h2>

          <p className="app-muted mt-2 text-sm">{appointment.service}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="app-card p-6">
          <h2 className="app-section-title">Booking Details</h2>

          <div className="mt-6 space-y-3">
            {[
              ["Client", appointment.client_name],
              ["Service", appointment.service],
              [
                "Price",
                appointment.service_price
                  ? formatPrice(
                      appointment.service_price.toString(),
                      workspaceSettings?.currency
                    )
                  : "No price",
              ],
              [
                "Date",
                formatDateWithTimezone(
                  appointment.appointment_at,
                  workspaceSettings?.timezone
                ),
              ],
              [
                "Time",
                formatTimeWithTimezone(
                  appointment.appointment_at,
                  workspaceSettings?.timezone
                ),
              ],
              ["Status", appointment.status],
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
          <h2 className="app-section-title">Linked Records</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {appointment.client_id ? (
              <Link
                href={`/clients/${appointment.client_id}`}
                className="app-card-dark block p-5 transition hover:-translate-y-1 hover:bg-white/[0.06]"
              >
                <p className="app-muted text-sm">Linked Client</p>
                <p className="mt-2 text-xl font-black">
                  {appointment.client_name}
                </p>
                <p className="mt-4 text-sm font-bold text-[var(--app-accent)]">
                  View client →
                </p>
              </Link>
            ) : (
              <div className="app-card-dark p-5">
                <p className="app-muted text-sm">Linked Client</p>
                <p className="mt-2 font-bold">No linked client</p>
              </div>
            )}

            {appointment.service_id ? (
              <Link
                href={`/services/${appointment.service_id}`}
                className="app-card-dark block p-5 transition hover:-translate-y-1 hover:bg-white/[0.06]"
              >
                <p className="app-muted text-sm">Linked Service</p>
                <p className="mt-2 text-xl font-black">{appointment.service}</p>
                <p className="mt-4 text-sm font-bold text-[var(--app-accent)]">
                  View service →
                </p>
              </Link>
            ) : (
              <div className="app-card-dark p-5">
                <p className="app-muted text-sm">Linked Service</p>
                <p className="mt-2 font-bold">No linked service</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}