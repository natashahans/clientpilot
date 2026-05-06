"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  BarChart3,
  Settings,
  Search,
  Bell,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Clients", icon: Users, path: "/clients" },
  { name: "Appointments", icon: Calendar, path: "/appointments" },
  { name: "Services", icon: Briefcase, path: "/services" },
  { name: "Analytics", icon: BarChart3, path: "/analytics" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

type SearchResult = {
  id: number;
  title: string;
  subtitle: string;
  type: "Client" | "Appointment" | "Service";
  path: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    async function runSearch() {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      const [clientsRes, appointmentsRes, servicesRes] = await Promise.all([
        supabase.from("clients").select("*"),
        supabase.from("appointments").select("*"),
        supabase.from("services").select("*"),
      ]);

      const term = searchTerm.toLowerCase();

      const clientResults =
        clientsRes.data
          ?.filter((client) =>
            `${client.name} ${client.email} ${client.service} ${client.status}`
              .toLowerCase()
              .includes(term)
          )
          .map((client) => ({
            id: client.id,
            title: client.name,
            subtitle: client.email || client.service || "Client record",
            type: "Client" as const,
            path: "/clients",
          })) || [];

      const appointmentResults =
        appointmentsRes.data
          ?.filter((appointment) =>
            `${appointment.client_name} ${appointment.service} ${appointment.time} ${appointment.status}`
              .toLowerCase()
              .includes(term)
          )
          .map((appointment) => ({
            id: appointment.id,
            title: appointment.client_name,
            subtitle: `${appointment.service} at ${appointment.time}`,
            type: "Appointment" as const,
            path: "/appointments",
          })) || [];

      const serviceResults =
        servicesRes.data
          ?.filter((service) =>
            `${service.name} ${service.price} ${service.duration} ${service.tag}`
              .toLowerCase()
              .includes(term)
          )
          .map((service) => ({
            id: service.id,
            title: service.name,
            subtitle: `${service.price} • ${service.duration}`,
            type: "Service" as const,
            path: "/services",
          })) || [];

      setResults([
        ...clientResults,
        ...appointmentResults,
        ...serviceResults,
      ]);
    }

    runSearch();
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex min-h-screen">
        <aside className="w-[280px] border-r border-white/10 bg-[#070707] px-6 py-7">
          <div className="mb-12">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D7FF5F] text-lg font-black text-black">
              CP
            </div>

            <h1 className="text-2xl font-black tracking-tight">ClientPilot</h1>
            <p className="mt-1 text-sm text-white/40">
              Service business command center
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ name, icon: Icon, path }) => {
              const isActive =
                path === "/" ? pathname === "/" : pathname.startsWith(path);

              return (
                <Link
                  key={name}
                  href={path}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-[#D7FF5F] text-black"
                      : "text-white/45 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_right,#2d1b69_0%,transparent_32%),radial-gradient(circle_at_top_left,#103d2d_0%,transparent_28%),#050505]">
          <div className="border-b border-white/10 px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="relative w-[420px]">
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-white/40">
                  <Search className="h-4 w-4" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search clients, bookings, services..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                  />
                </div>

                {searchTerm && (
                  <div className="absolute left-0 top-14 z-50 w-full rounded-[24px] border border-white/10 bg-[#101010] p-3 shadow-2xl shadow-black/50">
                    {results.length > 0 ? (
                      <div className="space-y-2">
                        {results.map((result) => (
                          <Link
                            key={`${result.type}-${result.id}`}
                            href={result.path}
                            onClick={() => setSearchTerm("")}
                            className="block rounded-2xl px-4 py-3 transition hover:bg-white/10"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold">{result.title}</p>
                                <p className="text-sm text-white/40">
                                  {result.subtitle}
                                </p>
                              </div>

                              <span className="rounded-full bg-[#D7FF5F] px-3 py-1 text-xs font-bold text-black">
                                {result.type}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-3 text-sm text-white/40">
                        No results found.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#c8f24f]">
                  New Booking
                </button>

                <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                  <Bell className="h-4 w-4 text-white/70" />
                </button>

                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#D7FF5F] to-[#9D7CFF]" />
                  <div>
                    <p className="text-sm font-semibold">Natasha</p>
                    <p className="text-xs text-white/40">Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}