import Link from "next/link";
import { formatPrice } from "@/lib/formatters";

type TopService = {
  id: number | null;
  name: string;
  bookings: number;
  revenue: number;
};

type TopServicesProps = {
  loading: boolean;
  services: TopService[];
  currency?: string | null;
};

export default function TopServices({
  loading,
  services,
  currency,
}: TopServicesProps) {
  return (
    <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[24px] font-extrabold tracking-[-0.04em] text-slate-950">
            Top Services
          </h3>

          <p className="mt-1 text-[13.5px] font-medium text-slate-500">
            Highest performing services.
          </p>
        </div>

        <Link
          href="/services"
          className="flex h-[42px] shrink-0 items-center justify-center rounded-[16px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
        >
          View
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[86px] animate-pulse rounded-[22px] border border-slate-200 bg-slate-50"
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="font-bold text-slate-950">No service performance yet</p>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Add appointments with services to see your top performers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service, index) => (
            <Link
              key={service.name}
              href={service.id ? `/services/${service.id}` : "/services"}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4f46e5] text-[12px] font-extrabold text-white">
                #{index + 1}
              </div>

              <div className="min-w-0">
                <p className="truncate text-[15px] font-extrabold tracking-[-0.035em] text-slate-950">
                  {service.name}
                </p>

                <p className="mt-1 text-[12px] font-medium text-slate-400">
                  {service.bookings} bookings
                </p>
              </div>

              <div className="text-right">
                <p className="text-[18px] font-extrabold tracking-[-0.04em] text-[#4f46e5]">
                  {formatPrice(service.revenue.toString(), currency)}
                </p>

                <p className="mt-1 text-[11px] font-bold text-slate-400 transition group-hover:text-[#4f46e5]">
                  View →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}