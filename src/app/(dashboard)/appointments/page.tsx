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

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
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

        <button className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black">
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
          </div>

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="grid grid-cols-[0.5fr_1.2fr_1.2fr_0.8fr] items-center rounded-[26px] border border-white/10 bg-[#0B0B0B] p-5"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}