const clients = [
  ["AK", "Ali Khan", "ali.khan@email.com", "Haircut Consultation", "Active", "Today"],
  ["SA", "Sarah Ahmed", "sarah@email.com", "Follow-up Session", "Returning", "Yesterday"],
  ["HM", "Hamza Malik", "hamza@email.com", "Premium Service", "New", "2 days ago"],
  ["AN", "Ayesha Noor", "ayesha@email.com", "Service Package", "Active", "3 days ago"],
];

export default function ClientsPage() {
  return (
    <section className="space-y-7">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
            CRM
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
            Clients
          </h1>
          <p className="mt-3 text-white/45">
            Manage client records, booking history and relationship status.
          </p>
        </div>

        <button className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black">
          Add Client
        </button>
      </div>

      <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Client Directory</h2>
            <p className="mt-1 text-sm text-white/40">
              Latest client activity across your business.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/40">
            Search clients...
          </div>
        </div>

        <div className="space-y-3">
          {clients.map(([initials, name, email, service, status, lastVisit]) => (
            <div
              key={email}
              className="grid grid-cols-[1.5fr_1.5fr_1fr_0.8fr] items-center rounded-[26px] border border-white/10 bg-[#0B0B0B] p-5 transition hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D7FF5F] font-black text-black">
                  {initials}
                </div>
                <div>
                  <p className="font-bold">{name}</p>
                  <p className="text-sm text-white/40">{email}</p>
                </div>
              </div>

              <p className="text-white/70">{service}</p>

              <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                {status}
              </span>

              <p className="text-right text-sm text-white/40">{lastVisit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}