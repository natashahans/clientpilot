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
    <div className="app-card p-5 sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="app-section-title">Top Services</h3>

          <p className="app-muted mt-1 text-sm">
            Your strongest services by bookings and revenue.
          </p>
        </div>

        <Link
          href="/services"
          className="app-button-secondary w-full px-4 py-2 text-center sm:w-auto"
        >
          View services
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="app-card-dark h-[180px] animate-pulse"
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="app-card-dark p-6 text-center">
          <p className="font-bold">No service performance yet</p>

          <p className="app-muted mt-1 text-sm">
            Add appointments with services to see your top performers.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service, index) => (
            <Link
              key={service.name}
              href={service.id ? `/services/${service.id}` : "/services"}
              className="app-card-dark block p-5 transition hover:-translate-y-1 hover:bg-white/[0.06]"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full bg-[var(--app-accent)] px-3 py-1 text-xs font-black text-[var(--app-accent-text)]">
                  #{index + 1}
                </span>

                <p className="app-muted text-xs">
                  {service.bookings} bookings
                </p>
              </div>

              <h4 className="text-xl font-black tracking-[-0.04em]">
                {service.name}
              </h4>

              <p className="mt-3 text-3xl font-black text-[var(--app-accent)]">
                {formatPrice(service.revenue.toString(), currency)}
              </p>

              <p className="app-muted mt-1 text-sm">
                total revenue
              </p>

              <p className="mt-5 text-sm font-bold text-[var(--app-accent)]">
                View details →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}