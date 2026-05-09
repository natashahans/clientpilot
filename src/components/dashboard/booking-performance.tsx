import {
  Area,
  AreaChart,
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
  return (
    <div className="app-card p-5 sm:p-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h3 className="app-section-title">Booking Performance</h3>

            <p className="app-muted mt-1 text-sm">
            Real appointment demand from Supabase for{" "}
            {rangeLabels[chartRange].toLowerCase()}.
            </p>

            <p className="mt-2 text-sm font-bold text-[var(--app-accent)]">
            {loading
                ? "Loading performance..."
                : chartMode === "bookings"
                ? `${totalBookingsInChart} total bookings shown`
                : `${currency || "$"}${totalRevenueInChart} revenue shown`}
            </p>
        </div>

        <div className="flex rounded-full border app-border bg-white/50 p-1">
            <button
            type="button"
            onClick={() => onChartModeChange("bookings")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                chartMode === "bookings"
                ? "bg-[var(--app-accent)] text-[var(--app-accent-text)]"
                : "app-muted"
            }`}
            >
            Bookings
            </button>

            <button
            type="button"
            onClick={() => onChartModeChange("revenue")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                chartMode === "revenue"
                ? "bg-[var(--app-accent)] text-[var(--app-accent-text)]"
                : "app-muted"
            }`}
            >
            Revenue
            </button>
        </div>

        <select
            value={chartRange}
            onChange={(e) =>
            onChartRangeChange(e.target.value as ChartRange)
            }
            className="app-input w-full rounded-full px-4 py-2 text-sm font-bold sm:w-auto"
            disabled={loading}
        >
            <option value="24h">Last 24 hours</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
        </select>
        </div>

        <div className="h-[260px] min-w-0">
        {loading ? (
            <div className="app-card-dark h-full animate-pulse" />
        ) : hasChartData ? (
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
                <defs>
                <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop
                    offset="0%"
                    stopColor="var(--app-accent)"
                    stopOpacity={0.7}
                    />
                    <stop
                    offset="100%"
                    stopColor="var(--app-accent)"
                    stopOpacity={0}
                    />
                </linearGradient>
                </defs>

                <CartesianGrid
                vertical={false}
                stroke="var(--app-border)"
                strokeDasharray="4 8"
                />

                <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                stroke="var(--app-muted)"
                />

                <YAxis
                axisLine={false}
                tickLine={false}
                stroke="var(--app-muted)"
                width={32}
                allowDecimals={false}
                />

                <Tooltip
                animationDuration={200}
                cursor={{
                    stroke: "var(--app-accent)",
                    strokeOpacity: 0.25,
                }}
                />

                <Area
                type="monotone"
                dataKey={chartMode}
                stroke="var(--app-accent)"
                strokeWidth={4}
                fill="url(#areaGlow)"
                dot={false}
                activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    stroke: "white",
                }}
                />
            </AreaChart>
            </ResponsiveContainer>
        ) : (
            <div className="app-card-dark flex h-full items-center justify-center rounded-[28px]">
            <div className="text-center">
                <p className="font-bold">No booking analytics yet</p>

                <p className="app-muted mt-1 text-sm">
                Appointment trends will appear once bookings are added.
                </p>
            </div>
            </div>
        )}
        </div>
    </div>
  );
}