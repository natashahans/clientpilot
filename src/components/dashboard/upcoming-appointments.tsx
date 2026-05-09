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
    <div className="app-card p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="app-section-title">Upcoming Appointments</h3>
          <p className="app-muted mt-1 text-sm">
            Your next scheduled bookings from Supabase
          </p>
        </div>

        <Clock className="h-5 w-5 text-[var(--app-accent)]" />
      </div>

      <div className="max-h-[540px] space-y-4 overflow-y-auto pr-2">
        {loading ? (
          [1, 2, 3].map((item) => (
            <div
              key={item}
              className="app-card-dark h-[104px] animate-pulse"
            />
          ))
        ) : appointments.length === 0 ? (
          <div className="app-card-dark p-6 text-center">
            <p className="font-bold">No upcoming appointments</p>
            <p className="app-muted mt-1 text-sm">
              New bookings will appear here once you add them.
            </p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <Link
              key={appointment.id}
              href="/appointments"
              className="app-card-dark relative block p-5 transition hover:-translate-y-1 hover:bg-white/[0.06]"
            >
              <div className="absolute left-0 top-6 h-8 w-1 rounded-full bg-[var(--app-accent)]" />

              <p className="text-sm font-bold text-[var(--app-accent)]">
                {formatTimeWithTimezone(appointment.appointment_at, timezone)}
              </p>

              <p className="mt-2 text-lg font-bold">{appointment.service}</p>
              <p className="app-muted text-sm">{appointment.client_name}</p>

              <p className="mt-2 text-xs text-white/50">
                {appointment.status}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}