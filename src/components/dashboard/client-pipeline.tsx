import Link from "next/link";

type Client = {
  id: number;
  name: string;
  service: string | null;
  status: string | null;
};

type ClientPipelineProps = {
  loading: boolean;
  clients: Client[];
};

export default function ClientPipeline({
  loading,
  clients,
}: ClientPipelineProps) {
  return (
    <div className="app-card p-5 sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="app-section-title">Client Pipeline</h3>

          <p className="app-muted mt-1 text-sm">
            Recent clients and booking activity from Supabase.
          </p>
        </div>

        <Link
          href="/clients"
          className="app-button-secondary w-full px-4 py-2 text-center sm:w-auto"
        >
          View all clients
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="app-card-dark h-[150px] animate-pulse"
              />
            ))
          : clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="app-card-dark block p-5 transition hover:-translate-y-1 hover:bg-white/[0.06]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-accent)] font-black text-[var(--app-accent-text)]">
                    {client.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </div>

                  <span className="rounded-full bg-[var(--app-accent)]/12 px-3 py-1 text-xs font-bold text-[var(--app-accent)] ring-1 ring-[var(--app-accent)]/20">
                    {client.status}
                  </span>
                </div>

                <p className="text-lg font-bold">{client.name}</p>

                <p className="app-muted mt-1 text-sm">
                  {client.service}
                </p>
              </Link>
            ))}
      </div>
    </div>
  );
}