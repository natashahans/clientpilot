import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  label: string;
  bookings: number;
  revenue: number;
};

type ChartRange = "24h" | "7days" | "30days" | "90days";
type ChartMode = "bookings" | "revenue";

type BookingPerformanceProps = {
  loading: boolean;
  chartData: ChartPoint[];
  chartMode: ChartMode;
  chartRange: ChartRange;
  hasChartData: boolean;
  totalBookingsInChart: number;
  totalRevenueInChart: number;
  currency?: string | null;
  onChartModeChange: (mode: ChartMode) => void;
  onChartRangeChange: (range: ChartRange) => void;
};

const rangeLabels = {
  "24h": "Last 24 hours",
  "7days": "Last 7 days",
  "30days": "Last 30 days",
  "90days": "Last 90 days",
};

export default function BookingPerformance({
  loading,
  chartData,
  chartMode,
  chartRange,
  hasChartData,
  totalBookingsInChart,
  totalRevenueInChart,
  currency,
  onChartModeChange,
  onChartRangeChange,
}: BookingPerformanceProps) {
  const peakPoint = chartData.reduce(
    (best, item) =>
      item.bookings > best.bookings || item.revenue > best.revenue ? item : best,
    chartData[0] || { label: "-", bookings: 0, revenue: 0 }
  );

  const averageRevenue =
    chartData.length > 0 ? Math.round(totalRevenueInChart / chartData.length) : 0;

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="absolute right-[-120px] top-[-130px] h-[320px] w-[320px] rounded-full bg-indigo-100/70 blur-3xl" />
      <div className="absolute bottom-[-150px] left-[20%] h-[280px] w-[280px] rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
              Performance Center
            </p>

            <h3 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
              Booking Performance
            </h3>

            <p className="mt-1 max-w-md text-[13px] font-medium leading-6 text-slate-500">
              Real appointment demand for {rangeLabels[chartRange].toLowerCase()}.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-[18px] border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur-xl">
              <button
                type="button"
                onClick={() => onChartModeChange("bookings")}
                className={`rounded-[14px] px-4 py-2 text-[13px] font-bold transition ${
                  chartMode === "bookings"
                    ? "bg-[#4f46e5] text-white shadow-[0_8px_24px_rgba(79,70,229,0.22)]"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Bookings
              </button>

              <button
                type="button"
                onClick={() => onChartModeChange("revenue")}
                className={`rounded-[14px] px-4 py-2 text-[13px] font-bold transition ${
                  chartMode === "revenue"
                    ? "bg-[#4f46e5] text-white shadow-[0_8px_24px_rgba(79,70,229,0.22)]"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Revenue
              </button>
            </div>

            <select
              value={chartRange}
              onChange={(e) => onChartRangeChange(e.target.value as ChartRange)}
              className="h-[42px] rounded-[16px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              disabled={loading}
            >
              <option value="24h">Last 24 hours</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          {[
            ["Bookings", loading ? "..." : totalBookingsInChart],
            ["Revenue", loading ? "..." : `${currency || "$"}${totalRevenueInChart}`],
            ["Peak", loading ? "..." : peakPoint.label],
            ["Avg / point", loading ? "..." : `${currency || "$"}${averageRevenue}`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[22px] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl"
            >
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {label}
              </p>

              <p className="mt-2 truncate text-[20px] font-extrabold tracking-[-0.045em] text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_160px]">
          <div className="h-[205px] min-w-0 rounded-[24px] border border-slate-200 bg-white/75 p-3 shadow-sm backdrop-blur-xl">
            {loading ? (
              <div className="h-full animate-pulse rounded-[22px] bg-slate-50" />
            ) : hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(15,23,42,0.08)"
                    strokeDasharray="4 8"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    stroke="rgba(15,23,42,0.42)"
                    fontSize={12}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    stroke="rgba(15,23,42,0.42)"
                    fontSize={12}
                    width={32}
                    allowDecimals={false}
                  />

                  <Tooltip
                    animationDuration={200}
                    contentStyle={{
                      border: "1px solid rgba(15,23,42,0.08)",
                      borderRadius: "18px",
                      boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                    cursor={{
                      stroke: "#4f46e5",
                      strokeOpacity: 0.2,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey={chartMode}
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fill="url(#areaGlow)"
                    dot={false}
                    activeDot={{
                      r: 6,
                      strokeWidth: 2,
                      stroke: "white",
                      fill: "#4f46e5",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[22px] bg-slate-50">
                <div className="text-center">
                  <p className="font-bold text-slate-950">No booking analytics yet</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Appointment trends will appear once bookings are added.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-3 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">
                Mini demand
              </p>

              <p className="mt-1 text-[18px] font-extrabold tracking-[-0.04em]">
                Activity bars
              </p>
            </div>

            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.06)" }}
                    contentStyle={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "#020617",
                      color: "white",
                      borderRadius: "14px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  />
                  <Bar
                    dataKey={chartMode}
                    fill="#8b5cf6"
                    radius={[10, 10, 10, 10]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-4 text-[12px] font-semibold leading-5 text-white/55">
              Peak activity is currently shown around{" "}
              <span className="text-white">{peakPoint.label}</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}