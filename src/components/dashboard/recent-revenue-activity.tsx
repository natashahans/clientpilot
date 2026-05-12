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
    <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-[24px] font-extrabold tracking-[-0.04em] text-slate-950">
            Recent Revenue Activity
          </h3>

          <p className="mt-1 text-[13.5px] font-medium text-slate-500">
            Latest appointments generating revenue.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
          <Clock className="h-5 w-5 text-[#4f46e5]" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[88px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-50"
            />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="font-bold text-slate-950">No revenue activity yet</p>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Priced appointments will appear here once added.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/appointments/${appointment.id}`}
              className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:grid-cols-[1.2fr_1fr_0.8fr] md:items-center"
            >
              <div>
                <p className="text-[14px] font-bold text-slate-950">
                  {appointment.client_name}
                </p>

                <p className="mt-1 text-[13px] font-medium text-slate-500">
                  {appointment.service}
                </p>
              </div>

              <div>
                <p className="text-[13px] font-bold text-[#4f46e5]">
                  {formatTimeWithTimezone(appointment.appointment_at, timezone)}
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-400">
                  {formatDateWithTimezone(appointment.appointment_at, timezone)}
                </p>
              </div>

              <p className="text-[20px] font-extrabold tracking-[-0.04em] text-[#4f46e5] md:text-right">
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