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
    <div className="flex min-h-screen bg-[#020617] text-white">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#020617] border-r border-white/10 p-6 flex flex-col">
        
        {/* LOGO */}
        <div className="mb-10">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#020617]">
            CP
          </div>
          <h1 className="text-2xl font-bold">ClientPilot</h1>
          <p className="text-sm text-white/50">Business command center</p>
        </div>

        {/* NAV */}
        <nav className="space-y-2">
          {navItems.map(({ name, icon: Icon, path }) => {
            const isActive =
              path === "/"
                ? pathname === "/"
                : pathname.startsWith(path);

            return (
              <Link
                key={name}
                href={path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-white text-[#020617] shadow-md"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {name}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER SPACE */}
        <div className="mt-auto" />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-[#0F172A] text-white p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}