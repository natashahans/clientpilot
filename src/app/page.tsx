const navItems = [
  "Dashboard",
  "Clients",
  "Appointments",
  "Services",
  "Analytics",
  "Settings",
];

const stats = [
  { label: "Total Clients", value: "124", change: "+12% this month" },
  { label: "Today's Appointments", value: "8", change: "3 completed" },
  { label: "Monthly Revenue", value: "$1,240", change: "+18% from last month" },
  { label: "Completed Bookings", value: "56", change: "92% completion rate" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F6F8] p-4 text-[#111827]">
      <div className="flex min-h-[calc(100vh-32px)] overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
        {/* Sidebar */}
        <aside className="w-72 bg-[#0B0F17] p-6 text-white">
          <div className="mb-10">
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#0B0F17]">
              CP
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ClientPilot</h1>
            <p className="mt-1 text-sm text-white/45">Business command center</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                  item === "Dashboard"
                    ? "bg-white text-[#0B0F17] shadow-sm"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-auto"></div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-hidden bg-[#F7F8FA]">
          {/* Topbar */}
          <header className="flex h-24 items-center justify-between border-b border-black/5 bg-white px-8">
            <div>
              <p className="text-sm font-medium text-gray-400">Overview</p>
              <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden w-80 rounded-full border border-black/10 bg-[#F7F8FA] px-5 py-3 text-sm text-gray-400 md:block">
                Search clients, bookings, services...
              </div>

              <button className="rounded-full bg-[#111827] px-5 py-3 text-sm font-medium text-white shadow-sm">
                + New Booking
              </button>

              <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-3 py-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300"></div>
                <div className="hidden leading-tight md:block">
                  <p className="text-sm font-semibold">Natasha</p>
                  <p className="text-xs text-gray-400">Owner</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <section className="p-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Welcome back 👋</h1>
                <p className="mt-2 text-gray-500">
                  Here’s what’s happening across your clients, bookings, and services today.
                </p>
              </div>

              <div className="hidden rounded-2xl bg-white px-5 py-4 text-sm shadow-sm ring-1 ring-black/5 lg:block">
                <p className="font-semibold">Smart Insight</p>
                <p className="mt-1 text-gray-500">Friday is your busiest booking day.</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`rounded-[28px] p-6 shadow-sm ring-1 ring-black/5 ${
                    index === 0
                      ? "bg-[#0F5132] text-white"
                      : "bg-white text-[#111827]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className={`text-sm ${
                          index === 0 ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {stat.label}
                      </p>
                      <h3 className="mt-4 text-4xl font-bold tracking-tight">
                        {stat.value}
                      </h3>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        index === 0
                          ? "bg-white/15 text-white"
                          : "bg-[#F5F6F8] text-gray-500"
                      }`}
                    >
                      ↗
                    </div>
                  </div>

                  <p
                    className={`mt-6 text-sm ${
                      index === 0 ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Booking Activity</h3>
                    <p className="text-sm text-gray-500">Weekly appointment overview</p>
                  </div>
                  <button className="rounded-full border border-black/10 px-4 py-2 text-sm">
                    View report
                  </button>
                </div>

                <div className="flex h-64 items-end gap-4">
                  {[45, 70, 52, 88, 65, 95, 58].map((height, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-3">
                      <div
                        className="w-full rounded-full bg-[#0F5132]"
                        style={{ height: `${height}%` }}
                      ></div>
                      <p className="text-xs text-gray-400">
                        {["M", "T", "W", "T", "F", "S", "S"][index]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] bg-[#111827] p-6 text-white shadow-sm">
                <h3 className="text-xl font-bold">Upcoming Appointments</h3>
                <p className="mt-1 text-sm text-white/50">Next bookings for today</p>

                <div className="mt-6 space-y-4">
                  {[
                    ["10:00 AM", "Haircut Consultation", "Ali Khan"],
                    ["12:30 PM", "Follow-up Session", "Sarah Ahmed"],
                    ["03:00 PM", "Service Booking", "Hamza Malik"],
                  ].map(([time, title, client]) => (
                    <div
                      key={time}
                      className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10"
                    >
                      <p className="text-sm text-emerald-300">{time}</p>
                      <p className="mt-1 font-semibold">{title}</p>
                      <p className="text-sm text-white/50">{client}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}