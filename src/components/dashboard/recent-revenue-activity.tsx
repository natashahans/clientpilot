import Link from "next/link";
import { Clock } from "lucide-react";
import {
  formatDateWithTimezone,
  formatPrice,
  formatTimeWithTimezone,
} from "@/lib/formatters";

type Appointment = {
  id: number;
  client_name: string;
  service: string;
  appointment_at: string | null;
  service_price: number | null;
};

type RecentRevenueActivityProps = {
  loading: boolean;
  appointments: Appointment[];
  timezone?: string | null;
  currency?: string | null;
};

export default function RecentRevenueActivity({
  loading,
  appointments,
  timezone,
  currency,
}: RecentRevenueActivityProps) {
  return (
    <div className="app-card p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="app-section-title">Recent Revenue Activity</h3>

          <p className="app-muted mt-1 text-sm">
            Latest appointments generating revenue.
          </p>
        </div>

        <Clock className="h-5 w-5 text-[var(--app-accent)]" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="app-card-dark h-[88px] animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="app-card-dark p-6 text-center">
          <p className="font-bold">No revenue activity yet</p>

          <p className="app-muted mt-1 text-sm">
            Priced appointments will appear here once added.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/appointments/${appointment.id}`}
              className="app-card-dark grid gap-4 px-5 py-4 transition hover:-translate-y-1 hover:bg-white/[0.06] md:grid-cols-[1.2fr_1fr_0.8fr] md:items-center"
            >
              <div>
                <p className="font-bold">{appointment.client_name}</p>
                <p className="app-muted mt-1 text-sm">{appointment.service}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-[var(--app-accent)]">
                  {formatTimeWithTimezone(appointment.appointment_at, timezone)}
                </p>

                <p className="app-muted mt-1 text-xs">
                  {formatDateWithTimezone(appointment.appointment_at, timezone)}
                </p>
              </div>

              <p className="text-xl font-black text-[var(--app-accent)] md:text-right">
                {formatPrice(
                  appointment.service_price?.toString() || "0",
                  currency
                )}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}