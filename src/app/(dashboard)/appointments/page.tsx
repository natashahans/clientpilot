"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Appointment = {
  id: number;
  client_name: string;
  service: string;
  time: string;
  status: string | null;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [form, setForm] = useState({
    client_name: "",
    service: "",
    time: "",
    status: "Confirmed",
  });

  async function fetchAppointments() {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("APPOINTMENTS ERROR:", error);
      return;
    }

    setAppointments(data || []);
  }

  async function addOrUpdateAppointment() {
    if (!form.client_name.trim() || !form.service.trim() || !form.time.trim()) {
      return;
    }

    if (editingAppointment) {
      const { error } = await supabase
        .from("appointments")
        .update({
          client_name: form.client_name,
          service: form.service,
          time: form.time,
          status: form.status,
        })
        .eq("id", editingAppointment.id);

      if (error) {
        console.log("UPDATE APPOINTMENT ERROR:", error);
        return;
      }
    } else {
      const { error } = await supabase.from("appointments").insert([
        {
          client_name: form.client_name,
          service: form.service,
          time: form.time,
          status: form.status,
        },
      ]);

      if (error) {
        console.log("INSERT APPOINTMENT ERROR:", error);
        return;
      }
    }

    setForm({
      client_name: "",
      service: "",
      time: "",
      status: "Confirmed",
    });

    setEditingAppointment(null);
    setShowModal(false);
    fetchAppointments();
  }

  async function deleteAppointment(id: number) {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("DELETE APPOINTMENT ERROR:", error);
      return;
    }

    fetchAppointments();
  }

  function openEdit(appointment: Appointment) {
    setEditingAppointment(appointment);
    setForm({
      client_name: appointment.client_name,
      service: appointment.service,
      time: appointment.time,
      status: appointment.status || "Confirmed",
    });
    setShowModal(true);
  }

  function openAdd() {
    setEditingAppointment(null);
    setForm({
      client_name: "",
      service: "",
      time: "",
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

  return (
    <>
      <section className="space-y-7">
        <div className="flex items-end justify-between">
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
              Today
            </p>

            <h2 className="mt-3 text-6xl font-black tracking-[-0.06em]">
              {appointments.length}
            </h2>

            <p className="mt-2 text-lg font-bold">appointments scheduled</p>

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
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="app-card-dark grid grid-cols-[0.5fr_1.1fr_1.1fr_0.8fr_0.7fr] items-center px-5 py-4"
                >
                  <p className="font-black text-[var(--app-accent)]">
                    {appointment.time}
                  </p>

                  <div>
                    <p className="font-bold">{appointment.client_name}</p>
                    <p className="app-muted text-sm">Client</p>
                  </div>

                  <p className="app-muted">{appointment.service}</p>

                  <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                    {appointment.status}
                  </span>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => openEdit(appointment)}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      className="text-xs font-semibold text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="app-card w-full max-w-xl p-7">
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
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="Time e.g. 14:30"
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

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAppointment(null);
                }}
                className="app-button-secondary px-5 py-3"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateAppointment}
                className="app-button-primary px-5 py-3"
              >
                {editingAppointment ? "Update Appointment" : "Save Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}