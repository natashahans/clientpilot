import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Clients", icon: Users, href: "/clients" },
  { name: "Appointments", icon: Calendar, href: "/appointments" },
  { name: "Services", icon: Briefcase, href: "/services" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F5F6F8] text-[#111827]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0B0F17] p-6 text-white flex flex-col">
        <div className="mb-10">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#0B0F17]">
            CP
          </div>
          <h1 className="text-2xl font-bold">ClientPilot</h1>
          <p className="text-sm text-white/50">Business command center</p>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ name, icon: Icon, href }) => (
            <Link
              key={name}
              href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}