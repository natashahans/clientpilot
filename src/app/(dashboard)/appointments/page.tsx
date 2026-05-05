const appointments = [
  ["10:00", "Ali Khan", "Haircut Consultation", "Confirmed"],
  ["12:30", "Sarah Ahmed", "Follow-up Session", "In Progress"],
  ["15:00", "Hamza Malik", "Premium Service", "Pending"],
  ["17:30", "Ayesha Noor", "Service Package", "Confirmed"],
];

export default function AppointmentsPage() {
  return (
    <section className="space-y-7">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
            Schedule
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
            Appointments
          </h1>
          <p className="mt-3 text-white/45">
            Track today’s bookings, session status and client schedule.
          </p>
        </div>

        <button className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black">
          New Appointment
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <div className="rounded-[36px] border border-white/10 bg-[#D7FF5F] p-7 text-black">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
            Today
          </p>
          <h2 className="mt-3 text-6xl font-black tracking-[-0.06em]">8</h2>
          <p className="mt-2 text-lg font-bold">appointments scheduled</p>

          <div className="mt-8 rounded-[28px] bg-black p-5 text-white">
            <p className="text-sm text-white/45">Peak window</p>
            <p className="mt-2 text-2xl font-black">4 PM — 7 PM</p>
          </div>
        </div>

        <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
          <div className="mb-6">
            <h2 className="text-2xl font-black">Today’s Timeline</h2>
            <p className="mt-1 text-sm text-white/40">
              Live overview of upcoming and active appointments.
            </p>
          </div>

          <div className="space-y-4">
            {appointments.map(([time, client, service, status]) => (
              <div
                key={`${time}-${client}`}
                className="grid grid-cols-[0.5fr_1.2fr_1.2fr_0.8fr] items-center rounded-[26px] border border-white/10 bg-[#0B0B0B] p-5"
              >
                <p className="font-black text-[#D7FF5F]">{time}</p>

                <div>
                  <p className="font-bold">{client}</p>
                  <p className="text-sm text-white/40">Client</p>
                </div>

                <p className="text-white/70">{service}</p>

                <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}