"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex min-h-screen">
        <aside className="w-[280px] border-r border-white/10 bg-[#070707] px-6 py-7">
          <div className="mb-12">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D7FF5F] text-lg font-black text-black">
              CP
            </div>

            <h1 className="text-2xl font-black tracking-tight">ClientPilot</h1>
            <p className="mt-1 text-sm text-white/40">Service business command center</p>
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
              <div className="flex w-[420px] items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-white/40">
                <Search className="h-4 w-4" />
                <span className="text-sm">Search clients, bookings, services...</span>
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