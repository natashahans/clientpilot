"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Appointment = {
  id: number;
  client_name: string;
  service: string;
  time: string;
  status: string | null;
  appointment_at: string | null;
};

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [form, setForm] = useState({
    client_name: "",
    service: "",
    appointment_at: "",
    status: "Confirmed",
  });

  function showToast(message: string, type: Toast["type"] = "success") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  function formatTime(dateTime: string) {
    if (!dateTime) return "";

    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function formatDate(dateTime: string | null) {
    if (!dateTime) return "No date";

    return new Date(dateTime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatDateTimeForInput(dateTime: string | null) {
    if (!dateTime) return "";

    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  }

  async function fetchAppointments() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("appointment_at", { ascending: true, nullsFirst: false });

    if (error) {
      console.log("APPOINTMENTS ERROR:", error);
      setLoading(false);
      showToast("Could not load appointments", "error");
      return;
    }

    setAppointments(data || []);
    setLoading(false);
  }

  async function addOrUpdateAppointment() {
    if (
      !form.client_name.trim() ||
      !form.service.trim() ||
      !form.appointment_at.trim()
    ) {
      showToast("Please fill all appointment fields", "error");
      return;
    }

    setSaving(true);

    const appointmentTime = formatTime(form.appointment_at);

    if (editingAppointment) {
      const { error } = await supabase
        .from("appointments")
        .update({
          client_name: form.client_name,
          service: form.service,
          time: appointmentTime,
          appointment_at: new Date(form.appointment_at).toISOString(),
          status: form.status,
        })
        .eq("id", editingAppointment.id);

      if (error) {
        console.log("UPDATE APPOINTMENT ERROR:", error);
        setSaving(false);
        showToast("Could not update appointment", "error");
        return;
      }

      showToast("Appointment updated");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaving(false);
        showToast("You must be logged in", "error");
        return;
      }

      const { error } = await supabase.from("appointments").insert([
        {
          client_name: form.client_name,
          service: form.service,
          time: appointmentTime,
          appointment_at: new Date(form.appointment_at).toISOString(),
          status: form.status,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.log("INSERT APPOINTMENT ERROR:", error);
        setSaving(false);
        showToast("Could not save appointment", "error");
        return;
      }

      showToast("Appointment saved");
    }

    setForm({
      client_name: "",
      service: "",
      appointment_at: "",
      status: "Confirmed",
    });

    setEditingAppointment(null);
    setShowModal(false);
    setSaving(false);
    fetchAppointments();
  }

  async function deleteAppointment(id: number) {
    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      console.log("DELETE APPOINTMENT ERROR:", error);
      showToast("Could not delete appointment", "error");
      return;
    }

    showToast("Appointment deleted");
    fetchAppointments();
  }

  function openEdit(appointment: Appointment) {
    setEditingAppointment(appointment);
    setForm({
      client_name: appointment.client_name,
      service: appointment.service,
      appointment_at: formatDateTimeForInput(appointment.appointment_at),
      status: appointment.status || "Confirmed",
    });
    setShowModal(true);
  }

  function openAdd() {
    setEditingAppointment(null);
    setForm({
      client_name: "",
      service: "",
      appointment_at: "",
      status: "Confirmed",
    });
    setShowModal(true);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) =>
    `${appointment.client_name} ${appointment.service} ${appointment.time} ${appointment.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * appointmentsPerPage,
    currentPage * appointmentsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <>
      {toast && (
        <div className="fixed left-4 right-4 top-6 z-[80] flex justify-center sm:left-auto sm:right-6 sm:justify-end">
          <div
            className={`rounded-full px-5 py-3 text-sm font-bold shadow-2xl ${
              toast.type === "success"
                ? "bg-[var(--app-accent)] text-[var(--app-accent-text)]"
                : "bg-[var(--app-danger)] text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <section className="space-y-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="app-kicker">Schedule</p>
            <h1 className="app-page-title mt-2">Appointments</h1>
            <p className="app-muted mt-3">
              Track today’s bookings, session status and client schedule.
            </p>
          </div>

          <button onClick={openAdd} className="app-button-primary px-5 py-3">
            New Appointment
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
          <div className="app-accent-card p-7">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
              Total
            </p>

            <h2 className="mt-3 text-6xl font-black tracking-[-0.06em]">
              {appointments.length}
            </h2>

            <p className="mt-2 text-lg font-bold">appointments in database</p>

            <div className="mt-8 rounded-[28px] bg-black p-5 text-white">
              <p className="text-sm text-white/45">Data source</p>
              <p className="mt-2 text-2xl font-black">Live from Supabase</p>
            </div>
          </div>

          <div className="app-card p-6">
            <div className="mb-6">
              <h2 className="app-section-title">Today’s Timeline</h2>
              <p className="app-muted mt-1 text-sm">
                Live overview of upcoming and active appointments.
              </p>

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search appointments..."
                className="app-input mt-4 w-full rounded-full px-5 py-3 text-sm"
              />
            </div>

            <div className="space-y-4">
              {loading ? (
                <>
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="app-card-dark h-24 animate-pulse"
                    />
                  ))}
                </>
              ) : filteredAppointments.length === 0 ? (
                <div className="app-card-dark p-6 text-center">
                  <p className="font-bold">No appointments found</p>
                  <p className="app-muted mt-1 text-sm">
                    Create a new appointment or adjust your search.
                  </p>
                </div>
              ) : (
                paginatedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="app-card-dark grid gap-4 px-5 py-4 lg:grid-cols-[0.8fr_1.1fr_1.1fr_0.8fr_0.7fr] lg:items-center"
                  >
                    <div>
                      <p className="font-black text-[var(--app-accent)]">
                        {appointment.time}
                      </p>
                      <p className="app-muted mt-1 text-xs">
                        {formatDate(appointment.appointment_at)}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold">{appointment.client_name}</p>
                      <p className="app-muted text-sm">Client</p>
                    </div>

                    <p className="app-muted text-sm lg:text-base">
                      {appointment.service}
                    </p>

                    <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                      {appointment.status}
                    </span>

                    <div className="flex justify-start gap-3 lg:justify-end">
                      <button
                        onClick={() => openEdit(appointment)}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          const confirmed = window.confirm(
                            "Delete this appointment permanently?"
                          );

                          if (confirmed) {
                            deleteAppointment(appointment.id);
                          }
                        }}
                        className="text-xs font-semibold text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!loading && filteredAppointments.length > appointmentsPerPage && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  className="app-button-secondary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <p className="app-muted text-sm">
                  Showing {(currentPage - 1) * appointmentsPerPage + 1}-
                  {Math.min(currentPage * appointmentsPerPage, filteredAppointments.length)} of{" "}
                  {filteredAppointments.length} appointments
                </p>

                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="app-button-secondary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="app-card max-h-[90vh] w-full max-w-xl overflow-y-auto p-5 sm:p-7">
            <div className="mb-6">
              <p className="app-kicker">
                {editingAppointment ? "Edit Booking" : "New Booking"}
              </p>

              <h2 className="app-section-title mt-2">
                {editingAppointment ? "Edit Appointment" : "Add Appointment"}
              </h2>

              <p className="app-muted mt-2 text-sm">
                {editingAppointment
                  ? "Update this appointment record in Supabase."
                  : "Create a new appointment in your Supabase database."}
              </p>
            </div>

            <div className="grid gap-4">
              <input
                value={form.client_name}
                onChange={(e) =>
                  setForm({ ...form, client_name: e.target.value })
                }
                placeholder="Client name"
                className="app-input px-4 py-3"
              />

              <input
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                placeholder="Service"
                className="app-input px-4 py-3"
              />

              <input
                type="datetime-local"
                value={form.appointment_at}
                onChange={(e) =>
                  setForm({ ...form, appointment_at: e.target.value })
                }
                className="app-input px-4 py-3"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
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
                onClick={() => {
                  setShowModal(false);
                  setEditingAppointment(null);
                }}
                disabled={saving}
                className="app-button-secondary w-full px-5 py-3 sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateAppointment}
                disabled={saving}
                className="app-button-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving
                  ? "Saving..."
                  : editingAppointment
                  ? "Update Appointment"
                  : "Save Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}