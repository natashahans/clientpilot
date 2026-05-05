const services = [
  ["Haircut Consultation", "$25", "30 min", "Popular"],
  ["Follow-up Session", "$40", "45 min", "Active"],
  ["Premium Service", "$80", "60 min", "High Value"],
  ["Service Package", "$120", "90 min", "Bundle"],
];

export default function ServicesPage() {
  return (
    <section className="space-y-7">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
            Catalogue
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
            Services
          </h1>
          <p className="mt-3 text-white/45">
            Manage service offers, pricing, duration and performance labels.
          </p>
        </div>

        <button className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black">
          Add Service
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {services.map(([name, price, duration, tag]) => (
          <div
            key={name}
            className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 transition hover:bg-white/[0.09]"
          >
            <div className="mb-10 flex items-center justify-between">
              <span className="rounded-full bg-[#D7FF5F] px-3 py-1 text-xs font-bold text-black">
                {tag}
              </span>
              <span className="text-sm text-white/35">{duration}</span>
            </div>

            <h2 className="text-2xl font-black tracking-[-0.04em]">{name}</h2>
            <p className="mt-3 text-5xl font-black tracking-[-0.06em] text-[#D7FF5F]">
              {price}
            </p>

            <button className="mt-8 w-full rounded-full border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10">
              Edit Service
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}