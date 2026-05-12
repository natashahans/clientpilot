import Link from "next/link";
import { Clock } from "lucide-react";
import { formatTimeWithTimezone } from "@/lib/formatters";

type Appointment = {
  id: number;
  client_name: string;
  service: string;
  status: string | null;
  appointment_at: string | null;
};

type UpcomingAppointmentsProps = {
  loading: boolean;
  appointments: Appointment[];
  timezone?: string | null;
};

export default function UpcomingAppointments({
  loading,
  appointments,
  timezone,
}: UpcomingAppointmentsProps) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-950">
            Upcoming Appointments
          </h3>

          <p className="mt-1 text-[13.5px] font-medium text-slate-500">
            Your next scheduled bookings.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
          <Clock className="h-5 w-5 text-[#4f46e5]" />
        </div>
      </div>

      <div className="max-h-[500px] space-y-2.5 overflow-y-auto pr-1">
        {loading ? (
          [1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[104px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-50"
            />
          ))
        ) : appointments.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="font-bold text-slate-950">No upcoming appointments</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              New bookings will appear here once you add them.
            </p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/appointments/${appointment.id}`}
              className="relative block rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_14px_34px_rgba(15,23,42,0.07)]"
            >
              <div className="absolute left-0 top-6 h-8 w-1 rounded-full bg-[#4f46e5]" />

              <p className="text-[13px] font-bold text-[#4f46e5]">
                {formatTimeWithTimezone(appointment.appointment_at, timezone)}
              </p>

              <p className="mt-1.5 text-[15px] font-bold text-slate-950">
                {appointment.service}
              </p>

              <p className="mt-1 text-[13px] font-medium text-slate-500">
                {appointment.client_name}
              </p>

              <p className="mt-3 w-fit rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-400 ring-1 ring-slate-200">
                {appointment.status}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}