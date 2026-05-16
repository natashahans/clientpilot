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
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Clock,
  DollarSign,
  Edit3,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";

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

  if (!appointment) {
    return (
      <section className="grid gap-4">
        <Link
          href="/appointments"
          className="flex h-[44px] w-fit items-center gap-2 rounded-[16px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Appointments
        </Link>

        <div className="rounded-[34px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-extrabold text-slate-950">
            Appointment not found
          </p>

          <p className="mt-2 text-sm font-medium text-slate-500">
            This appointment may not exist or may not belong to this workspace.
          </p>
        </div>
      </section>
    );
  }

  const appointmentPrice = appointment.service_price
    ? formatPrice(
        appointment.service_price.toString(),
        workspaceSettings?.currency
      )
    : "No price";

  const appointmentTime = formatTimeWithTimezone(
    appointment.appointment_at,
    workspaceSettings?.timezone
  );

  const appointmentDate = formatDateWithTimezone(
    appointment.appointment_at,
    workspaceSettings?.timezone
  );

  return (
    <>
      <section className="grid gap-4">
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="relative overflow-hidden rounded-[38px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute right-[-100px] top-[-110px] h-[300px] w-[300px] rounded-full bg-indigo-100/70 blur-3xl" />
            <div className="absolute bottom-[-130px] left-[22%] h-[260px] w-[260px] rounded-full bg-sky-100/60 blur-3xl" />

            <div className="relative z-10">
              <Link
                href="/appointments"
                className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-400 transition hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Appointments
              </Link>

              <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.2em] text-[#4f46e5]">
                Appointment Details
              </p>

              <h1 className="mt-4 max-w-2xl text-[38px] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[52px]">
                {appointment.client_name}
              </h1>

              <p className="mt-4 max-w-xl text-[14.5px] font-medium leading-7 text-slate-500">
                View booking time, service value, status and linked client or
                service profiles.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={openEditModal}
                  className="flex h-[48px] items-center justify-center gap-2 rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Appointment
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                  className="flex h-[48px] items-center justify-center gap-2 rounded-[18px] bg-red-50 px-5 text-[13px] font-bold text-red-500 ring-1 ring-red-100 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#5652f4] via-[#4f46e5] to-[#4338ca] p-6 text-white shadow-[0_24px_70px_rgba(79,70,229,0.22)] sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(0,0,0,0.14),transparent_34%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/55">
                  Booking Value
                </p>

                <h2 className="mt-3 text-[42px] font-extrabold leading-tight tracking-[-0.06em]">
                  {appointmentPrice}
                </h2>

                <p className="mt-4 text-[14px] font-medium leading-7 text-white/70">
                  Current tracked value for this appointment.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {[
                  ["Status", appointment.status || "None"],
                  ["Time", appointmentTime],
                  ["Service", appointment.service],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                  >
                    <p className="text-[11px] font-semibold text-white/55">
                      {label}
                    </p>

                    <p className="mt-2 truncate text-[20px] font-extrabold tracking-[-0.05em]">
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
              label: "Price",
              value: appointmentPrice,
              caption: "for this booking",
              icon: DollarSign,
            },
            {
              label: "Time",
              value: appointmentTime,
              caption: appointmentDate,
              icon: Clock,
            },
            {
              label: "Status",
              value: appointment.status || "Not set",
              caption: appointment.service,
              icon: CalendarDays,
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
                  Booking Details
                </h2>

                <p className="mt-1 text-[13px] font-medium text-slate-500">
                  Appointment record information.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  ["Client", appointment.client_name, User],
                  ["Service", appointment.service, Briefcase],
                  ["Price", appointmentPrice, DollarSign],
                  ["Date", appointmentDate, CalendarDays],
                  ["Time", appointmentTime, Clock],
                  ["Status", appointment.status || "Not set", Sparkles],
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
                  Booking Signal
                </p>

                <h3 className="mt-2 text-[24px] font-extrabold tracking-[-0.05em]">
                  {appointment.status || "No status"}
                </h3>

                <p className="mt-2 text-[13px] font-medium leading-6 text-white/55">
                  This appointment connects one client, one service and one
                  scheduled business action.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                Related Profiles
              </h2>

              <p className="mt-1 text-[13px] font-medium text-slate-500">
                Jump to the connected client or service.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href={
                  appointment.client_id
                    ? `/clients/${appointment.client_id}`
                    : "/clients"
                }
                className="group rounded-[28px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#4f46e5] ring-1 ring-indigo-100">
                  <User className="h-5 w-5" />
                </div>

                <p className="text-[13px] font-semibold text-slate-500">
                  Client Profile
                </p>

                <p className="mt-2 text-[22px] font-extrabold tracking-[-0.045em] text-slate-950">
                  {appointment.client_name}
                </p>

                <p className="mt-5 text-[13px] font-bold text-[#4f46e5]">
                  View client →
                </p>
              </Link>

              <Link
                href={
                  appointment.service_id
                    ? `/services/${appointment.service_id}`
                    : "/services"
                }
                className="group rounded-[28px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#4f46e5] ring-1 ring-indigo-100">
                  <Briefcase className="h-5 w-5" />
                </div>

                <p className="text-[13px] font-semibold text-slate-500">
                  Service Profile
                </p>

                <p className="mt-2 text-[22px] font-extrabold tracking-[-0.045em] text-slate-950">
                  {appointment.service}
                </p>

                <p className="mt-5 text-[13px] font-bold text-[#4f46e5]">
                  View service →
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[34px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
                  Edit Booking
                </p>

                <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                  Edit Appointment
                </h2>

                <p className="mt-2 text-[13px] font-medium leading-6 text-slate-500">
                  Update the appointment time, price and status.
                </p>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4">
              <input
                type="datetime-local"
                value={editForm.appointment_at}
                onChange={(e) =>
                  setEditForm({ ...editForm, appointment_at: e.target.value })
                }
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <input
                type="number"
                min="0"
                value={editForm.service_price}
                onChange={(e) =>
                  setEditForm({ ...editForm, service_price: e.target.value })
                }
                placeholder="Service price"
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
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
                className="h-[48px] rounded-[18px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={saveAppointmentChanges}
                disabled={saving}
                className="h-[48px] rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">
              Delete Appointment
            </p>

            <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
              Delete this appointment?
            </h2>

            <p className="mt-3 text-[13px] font-medium leading-6 text-slate-500">
              This will permanently delete the booking for{" "}
              <span className="font-bold text-slate-950">
                {appointment.client_name}
              </span>
              .
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="h-[48px] rounded-[18px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={deleteAppointment}
                disabled={deleting}
                className="h-[48px] rounded-[18px] bg-red-500 px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(239,68,68,0.18)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
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