const settings = [
  ["Business Name", "ClientPilot Studio"],
  ["Business Type", "Service Business"],
  ["Owner", "Natasha"],
  ["Currency", "USD"],
  ["Timezone", "Asia/Karachi"],
];

export default function SettingsPage() {
  return (
    <section className="space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
          Workspace
        </p>
        <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
          Settings
        </h1>
        <p className="mt-3 text-white/45">
          Manage business details, workspace preferences and account configuration.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[36px] border border-white/10 bg-[#D7FF5F] p-7 text-black">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
            Workspace
          </p>

          <h2 className="mt-4 text-5xl font-black tracking-[-0.06em]">
            ClientPilot Studio
          </h2>

          <p className="mt-4 text-sm font-semibold text-black/60">
            Your active business workspace for clients, bookings and service operations.
          </p>
        </div>

        <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
          <div className="mb-6">
            <h2 className="text-2xl font-black">Business Profile</h2>
            <p className="mt-1 text-sm text-white/40">
              These details will later connect to your Supabase profile table.
            </p>
          </div>

          <div className="space-y-4">
            {settings.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-[24px] border border-white/10 bg-[#0B0B0B] p-5"
              >
                <p className="text-sm text-white/40">{label}</p>
                <p className="font-bold">{value}</p>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full rounded-full bg-[#D7FF5F] py-3 text-sm font-bold text-black">
            Edit Workspace
          </button>
        </div>
      </div>
    </section>
  );
}