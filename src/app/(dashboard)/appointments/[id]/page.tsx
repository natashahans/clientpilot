"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const appointmentId = Number(params.id);
  const { workspaceSettings } = useWorkspace();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editForm, setEditForm] = useState({
    appointment_at: "",
    service_price: "",
    status: "Confirmed",
  });

  function formatDateTimeForInput(dateTime: string | null) {
    if (!dateTime) return "";

    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  }

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

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  function openEditModal() {
    if (!appointment) return;

    setEditForm({
      appointment_at: formatDateTimeForInput(appointment.appointment_at),
      service_price: appointment.service_price?.toString() || "",
      status: appointment.status || "Confirmed",
    });

    setShowEditModal(true);
  }

  async function saveAppointmentChanges() {
    if (!appointment || !editForm.appointment_at.trim()) return;

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const appointmentIso = new Date(editForm.appointment_at).toISOString();

    const appointmentTime = formatTimeWithTimezone(
      appointmentIso,
      workspaceSettings?.timezone
    );

    const { error } = await supabase
      .from("appointments")
      .update({
        appointment_at: appointmentIso,
        time: appointmentTime,
        service_price: editForm.service_price
          ? parseFloat(editForm.service_price)
          : null,
        status: editForm.status,
      })
      .eq("id", appointment.id)
      .eq("user_id", user.id);

    if (error) {
      console.log("UPDATE APPOINTMENT DETAIL ERROR:", error);
      setSaving(false);
      return;
    }

    setShowEditModal(false);
    setSaving(false);
    fetchAppointmentDetails();
  }

  async function deleteAppointment() {
    if (!appointment) return;

    setDeleting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setDeleting(false);
      return;
    }

    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointment.id)
      .eq("user_id", user.id);

    if (error) {
      console.log("DELETE APPOINTMENT ERROR:", error);
      setDeleting(false);
      return;
    }

    setShowDeleteModal(false);
    router.push("/appointments");
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
    <>
      <section className="space-y-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/appointments" className="app-muted text-sm hover:text-white">
              ← Back to Appointments
            </Link>

            <p className="app-kicker mt-6">Appointment Details</p>

            <h1 className="app-page-title mt-2">{appointment.client_name}</h1>

            <p className="app-muted mt-3">
              View booking time, service, revenue and related profiles.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openEditModal}
              className="app-button-secondary px-5 py-3"
            >
              Edit Appointment
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="rounded-full border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete
            </button>
          </div>
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
            <h2 className="app-section-title">Related Profiles</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                href={`/clients/${appointment.client_id}`}
                className="app-card-dark block p-5 transition hover:-translate-y-1 hover:bg-white/[0.06]"
              >
                <p className="app-muted text-sm">Client Profile</p>

                <p className="mt-2 text-xl font-black">
                  {appointment.client_name}
                </p>

                <p className="mt-4 text-sm font-bold text-[var(--app-accent)]">
                  View client →
                </p>
              </Link>

              <Link
                href={`/services/${appointment.service_id}`}
                className="app-card-dark block p-5 transition hover:-translate-y-1 hover:bg-white/[0.06]"
              >
                <p className="app-muted text-sm">Service Profile</p>

                <p className="mt-2 text-xl font-black">
                  {appointment.service}
                </p>

                <p className="mt-4 text-sm font-bold text-[var(--app-accent)]">
                  View service →
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="app-card w-full max-w-xl p-5 sm:p-7">
            <div className="mb-6">
              <p className="app-kicker">Edit Booking</p>

              <h2 className="app-section-title mt-2">Edit Appointment</h2>

              <p className="app-muted mt-2 text-sm">
                Update the appointment time, price and status.
              </p>
            </div>

            <div className="grid gap-4">
              <input
                type="datetime-local"
                value={editForm.appointment_at}
                onChange={(e) =>
                  setEditForm({ ...editForm, appointment_at: e.target.value })
                }
                className="app-input px-4 py-3"
              />

              <input
                type="number"
                min="0"
                value={editForm.service_price}
                onChange={(e) =>
                  setEditForm({ ...editForm, service_price: e.target.value })
                }
                placeholder="Service price"
                className="app-input px-4 py-3"
              />

              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
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
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                className="app-button-secondary w-full px-5 py-3 sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={saveAppointmentChanges}
                disabled={saving}
                className="app-button-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="app-card w-full max-w-md p-6">
            <p className="app-kicker">Delete Appointment</p>

            <h2 className="app-section-title mt-2">
              Delete this appointment?
            </h2>

            <p className="app-muted mt-3 text-sm">
              This will permanently delete the booking for{" "}
              <span className="font-bold text-[var(--app-text)]">
                {appointment.client_name}
              </span>
              .
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="app-button-secondary w-full px-5 py-3 sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={deleteAppointment}
                disabled={deleting}
                className="w-full rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {deleting ? "Deleting..." : "Delete Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}