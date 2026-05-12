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
    <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[23px] font-extrabold tracking-[-0.04em] text-slate-950">
            Client Pipeline
          </h3>

          <p className="mt-1 text-[13px] font-medium text-slate-500">
            Recent clients and relationship status.
          </p>
        </div>

        <Link
          href="/clients"
          className="flex h-[42px] w-full items-center justify-center rounded-[16px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 sm:w-auto"
        >
          View all clients
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[150px] animate-pulse rounded-[26px] border border-slate-200 bg-slate-50"
            />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="font-bold text-slate-950">No clients yet</p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            New clients will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
            >
              <div className="absolute right-[-40px] top-[-40px] h-28 w-28 rounded-full bg-indigo-100/70 blur-2xl" />

              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[14px] font-extrabold text-[#4f46e5] ring-1 ring-indigo-100">
                    {client.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
                    {client.status || "No status"}
                  </span>
                </div>

                <p className="truncate text-[16px] font-extrabold tracking-[-0.035em] text-slate-950">
                  {client.name}
                </p>

                <p className="mt-1 truncate text-[13px] font-medium text-slate-500">
                  {client.service || "No preferred service"}
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                  <div className="h-full w-2/3 rounded-full bg-[#4f46e5]" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-slate-400">
                    Relationship
                  </p>

                  <p className="text-[12px] font-bold text-[#4f46e5] transition group-hover:translate-x-1">
                    View →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}