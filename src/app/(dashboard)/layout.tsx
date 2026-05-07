"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Menu,
  X,
  ChevronDown,
  LogOut,
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserEmail(user.email || "");
      setUser(user);

      setCheckingAuth(false);
    }

    checkUser();
  }, [router]);

  useEffect(() => {
    async function runSearch() {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setResults([]);
        return;
      }

      const [clientsRes, appointmentsRes, servicesRes] = await Promise.all([
        supabase.from("clients").select("*").eq("user_id", user.id),
        supabase.from("appointments").select("*").eq("user_id", user.id),
        supabase.from("services").select("*").eq("user_id", user.id),
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

      setResults([...clientResults, ...appointmentResults, ...serviceResults]);
    }

    runSearch();
  }, [searchTerm]);

  if (checkingAuth) {
    return (
      <div className="app-bg flex min-h-screen items-center justify-center">
        <div className="app-card px-6 py-4 text-sm font-bold">
          Loading workspace...
        </div>
      </div>
    );
  }

  const SidebarContent = (
    <>
      <div className="mb-12">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-accent)] text-lg font-black text-[var(--app-accent-text)]">
          CP
        </div>

        <h1 className="text-2xl font-black tracking-tight">ClientPilot</h1>
        <p className="mt-1 text-sm app-muted">
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
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                isActive
                  ? "!bg-[var(--app-accent)] !text-[var(--app-accent-text)] hover:!bg-[var(--app-accent)] hover:!text-[var(--app-accent-text)] focus:!bg-[var(--app-accent)] focus:!text-[var(--app-accent-text)]"
                  : "text-white/45 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.3} />
              {name}
            </Link>
          );
        })}
      </nav>
    </>
  );
  
  return (
    <div className="app-bg min-h-screen">
      <div className="flex min-h-screen">
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-50 h-full w-[280px] border-r app-border bg-[var(--app-card)] px-6 py-7 transition-transform duration-300 lg:hidden ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <p className="text-lg font-black">ClientPilot</p>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border app-border bg-white/[0.06]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {SidebarContent}
        </aside>

        <aside className="hidden w-[280px] shrink-0 border-r app-border bg-[var(--app-card)] px-6 py-7 lg:block">
          {SidebarContent}
        </aside>

        <main className="app-shell-bg min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center justify-between border-b app-border px-4 py-4 lg:hidden">
            <div>
              <p className="text-lg font-black">ClientPilot</p>
              <p className="text-xs app-muted">Workspace dashboard</p>
            </div>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 rounded-2xl border app-border bg-white/[0.06] px-4 py-2 text-sm font-bold"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
          <div className="border-b app-border px-4 py-5 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-[420px]">
                <div className="flex items-center gap-3 rounded-full border app-border bg-white/[0.06] px-5 py-3 text-white/40 transition-all duration-200 focus-within:border-[var(--app-accent)]/40 focus-within:shadow-lg focus-within:shadow-[var(--app-accent)]/10">
                  <Search className="h-4 w-4" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search clients, bookings, services..."
                    className="w-full bg-transparent text-sm text-[var(--app-text)] outline-none placeholder:text-white/40"
                  />
                </div>

                {searchTerm && (
                  <div className="absolute left-0 top-14 z-50 w-full rounded-[24px] border app-border bg-[var(--app-surface)] p-3 shadow-2xl shadow-black/50">
                    {results.length > 0 ? (
                      <div className="space-y-2">
                        {results.map((result) => (
                          <Link
                            key={`${result.type}-${result.id}`}
                            href={result.path}
                            onClick={() => {
                              setSearchTerm("");
                              setMobileMenuOpen(false);
                            }}
                            className="block rounded-2xl px-4 py-3 transition hover:bg-white/10"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold">{result.title}</p>
                                <p className="text-sm app-muted">
                                  {result.subtitle}
                                </p>
                              </div>

                              <span className="rounded-full bg-[var(--app-accent)] px-3 py-1 text-xs font-bold text-[var(--app-accent-text)]">
                                {result.type}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-3 text-sm app-muted">
                        No results found.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-start">
                <Link
                  href="/appointments"
                  className="app-button-primary px-5 py-3"
                >
                  Manage Bookings
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex cursor-pointer items-center gap-3 rounded-full border app-border bg-white/[0.04] px-3 py-2 transition-all duration-200 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/25"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--app-accent)] to-[#9D7CFF] text-sm font-black text-white">
                      {(user?.user_metadata?.full_name ||
                        user?.user_metadata?.name ||
                        user?.email ||
                        "U")[0].toUpperCase()}
                    </div>

                    <div className="hidden min-w-0 text-left sm:block">
                      <p className="truncate text-sm font-semibold">
                        {user?.user_metadata?.full_name ||
                          user?.user_metadata?.name ||
                          user?.email?.split("@")[0] ||
                          "User"}
                      </p>

                      <p className="mt-1 truncate text-xs app-muted">
                        {user?.email}
                      </p>
                    </div>

                    <ChevronDown
                      className={`h-4 w-4 text-white/45 transition-transform ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-14 z-50 w-[320px] rounded-[28px] border app-border bg-[var(--app-surface)] p-3 shadow-2xl shadow-black/20">
                      <div className="flex items-start gap-4 rounded-[22px] px-4 py-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--app-accent)] to-[#9D7CFF] text-base font-black text-white">
                          {userEmail.charAt(0).toUpperCase() || "N"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-base font-black leading-tight">
                            {user?.user_metadata?.full_name ||
                              user?.user_metadata?.name ||
                              user?.email?.split("@")[0] ||
                              "User"}
                          </p>

                          <p className="mt-1 break-all text-sm app-muted">
                            {userEmail || "No email found"}
                          </p>
                        </div>
                      </div>

                      <div className="my-1 h-px bg-white/10" />

                      <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          window.location.href = "/login";
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-500 transition hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}