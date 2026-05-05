"use client";

import {
  CalendarDays,
  Clock,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

const revenueData = [
  { day: "Mon", value: 28 },
  { day: "Tue", value: 44 },
  { day: "Wed", value: 38 },
  { day: "Thu", value: 62 },
  { day: "Fri", value: 55 },
  { day: "Sat", value: 74 },
  { day: "Sun", value: 49 },
];

const stats = [
  {
    label: "Active Clients",
    value: "124",
    change: "+12.4%",
    icon: Users,
  },
  {
    label: "Today’s Bookings",
    value: "8",
    change: "3 completed",
    icon: CalendarDays,
  },
  {
    label: "Revenue",
    value: "$1,240",
    change: "+18.2%",
    icon: Wallet,
  },
];

export default function DashboardPage() {
  useEffect(() => {

  async function test() {

    const { data, error } = await supabase

      .from("test")

      .select("*");

    console.log("DATA:", data);

    console.log("ERROR:", error);

  }

  test();

}, []);
  return (
    <section className="space-y-7">
      <div className="grid gap-7 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="relative">
          <div className="mb-10 flex items-start justify-between gap-8">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
                Business Overview
              </p>

              <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.055em]">
                Today’s client operations, bookings and growth signals.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/45">
                Monitor appointments, track client activity and spot the busiest parts
                of your service business from one focused workspace.
              </p>
            </div>

            <div className="hidden shrink-0 rounded-[28px] border border-white/10 bg-white/[0.06] p-5 xl:block">
              <p className="text-sm text-white/40">Today’s focus</p>
              <p className="mt-2 text-2xl font-black tracking-tight">8 bookings</p>
              <p className="mt-1 text-sm text-[#D7FF5F]">3 already completed</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map(({ label, value, change, icon: Icon }) => (
              <div
                key={label}
                className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition hover:bg-white/[0.09]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-[#D7FF5F]" />
                  </div>
                  <span className="text-xs text-white/40">{change}</span>
                </div>

                <p className="text-sm text-white/40">{label}</p>
                <h2 className="mt-2 text-4xl font-black tracking-tight">{value}</h2>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[36px] border border-white/10 bg-[#D7FF5F] p-7 text-black shadow-2xl shadow-black/30">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
                Smart Signal
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.05em]">
                Friday is your busiest day.
              </h2>
            </div>
            <Sparkles className="h-7 w-7" />
          </div>

          <div className="rounded-[28px] bg-black p-5 text-white">
            <p className="text-sm text-white/45">Suggested action</p>
            <p className="mt-2 text-xl font-bold">
              Add 2 more available booking slots between 4 PM and 7 PM.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-black tracking-[-0.04em]">
                Booking Performance
              </h3>
              <p className="mt-1 text-sm text-white/40">
                Weekly client demand and appointment movement.
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
              Last 7 days
            </div>
          </div>

          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D7FF5F" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#D7FF5F" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  stroke="rgba(255,255,255,0.35)"
                />

                <Tooltip
                  cursor={{ stroke: "rgba(215,255,95,0.25)" }}
                  contentStyle={{
                    background: "#0A0A0A",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "18px",
                    color: "#fff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#D7FF5F"
                  strokeWidth={4}
                  fill="url(#areaGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[36px] border border-white/10 bg-[#101010] p-7 shadow-2xl shadow-black/30">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-black tracking-[-0.04em]">
                Today’s Timeline
              </h3>
              <p className="mt-1 text-sm text-white/40">Upcoming appointments</p>
            </div>
            <Clock className="h-5 w-5 text-[#D7FF5F]" />
          </div>

          <div className="space-y-4">
            {[
              ["10:00", "Haircut Consultation", "Ali Khan"],
              ["12:30", "Follow-up Session", "Sarah Ahmed"],
              ["15:00", "Premium Service", "Hamza Malik"],
            ].map(([time, title, client]) => (
              <div
                key={time}
                className="relative rounded-[26px] border border-white/10 bg-white/[0.05] p-5"
              >
                <div className="absolute left-0 top-6 h-8 w-1 rounded-full bg-[#D7FF5F]" />
                <p className="text-sm font-bold text-[#D7FF5F]">{time}</p>
                <p className="mt-2 text-lg font-bold">{title}</p>
                <p className="text-sm text-white/40">{client}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black tracking-[-0.04em]">
              Client Pipeline
            </h3>
            <p className="mt-1 text-sm text-white/40">
              Recent clients and booking activity.
            </p>
          </div>

          <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            View all clients
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["AK", "Ali Khan", "Consultation", "Active"],
            ["SA", "Sarah Ahmed", "Follow-up", "Returning"],
            ["HM", "Hamza Malik", "Service Booking", "New"],
            ["AN", "Ayesha Noor", "Premium Package", "Active"],
          ].map(([initials, name, service, status]) => (
            <div
              key={name}
              className="rounded-[28px] border border-white/10 bg-[#0B0B0B] p-5"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D7FF5F] font-black text-black">
                  {initials}
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">
                  {status}
                </span>
              </div>

              <p className="text-lg font-bold">{name}</p>
              <p className="mt-1 text-sm text-white/40">{service}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}