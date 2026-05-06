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
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
              Schedule
            </p>
            <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
              Appointments
            </h1>
            <p className="mt-3 text-white/45">
              Track today’s bookings, session status and client schedule.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black"
          >
            New Appointment
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
          <div className="rounded-[36px] border border-white/10 bg-[#D7FF5F] p-7 text-black">
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

          <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
            <div className="mb-6">
              <h2 className="text-2xl font-black">Today’s Timeline</h2>
              <p className="mt-1 text-sm text-white/40">
                Live overview of upcoming and active appointments.
              </p>

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search appointments..."
                className="mt-4 w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none placeholder:text-white/40"
              />
            </div>

            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="grid grid-cols-[0.5fr_1.1fr_1.1fr_0.8fr_0.7fr] items-center rounded-[26px] border border-white/10 bg-[#0B0B0B] p-5"
                >
                  <p className="font-black text-[#D7FF5F]">
                    {appointment.time}
                  </p>

                  <div>
                    <p className="font-bold">{appointment.client_name}</p>
                    <p className="text-sm text-white/40">Client</p>
                  </div>

                  <p className="text-white/70">{appointment.service}</p>

                  <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                    {appointment.status}
                  </span>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => openEdit(appointment)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      className="text-xs text-red-400 hover:text-red-300"
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
          <div className="w-full max-w-xl rounded-[36px] border border-white/10 bg-[#111111] p-7 shadow-2xl shadow-black/50">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
                {editingAppointment ? "Edit Booking" : "New Booking"}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
                {editingAppointment ? "Edit Appointment" : "Add Appointment"}
              </h2>
              <p className="mt-2 text-sm text-white/40">
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
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <input
                value={form.service}
                onChange={(e) =>
                  setForm({ ...form, service: e.target.value })
                }
                placeholder="Service"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <input
                value={form.time}
                onChange={(e) =>
                  setForm({ ...form, time: e.target.value })
                }
                placeholder="Time e.g. 14:30"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
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
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white/60"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateAppointment}
                className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black"
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