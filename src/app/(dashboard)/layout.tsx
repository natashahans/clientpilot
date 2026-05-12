"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  Bell,
  Sparkles,
  Command,
} from "lucide-react";
import { WorkspaceProvider } from "@/context/workspace-context";

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

function ClientPilotMark() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#4f46e5] shadow-[0_12px_30px_rgba(79,70,229,0.28)]">
      <div className="absolute left-2 top-2 h-3 w-3 rounded-full border-2 border-white" />
      <div className="absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-white" />
      <div className="absolute left-[17px] top-[17px] h-2 w-2 rounded-full bg-white" />
      <div className="absolute left-[13px] top-[14px] h-[2px] w-[15px] rotate-45 rounded-full bg-white/85" />
      <div className="absolute bottom-[14px] right-[13px] h-[2px] w-[15px] rotate-45 rounded-full bg-white/85" />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [user, setUser] = useState<
    Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]
  >(null);

  const profileRef = useRef<HTMLDivElement | null>(null);

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
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      const trimmedTerm = searchTerm.trim();

      if (!trimmedTerm) {
        setResults([]);
        setActiveSearchIndex(0);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        setResults([]);
        setActiveSearchIndex(0);
        return;
      }

      const [clientsRes, appointmentsRes, servicesRes] = await Promise.all([
        supabase.from("clients").select("*").eq("user_id", user.id),
        supabase.from("appointments").select("*").eq("user_id", user.id),
        supabase.from("services").select("*").eq("user_id", user.id),
      ]);

      if (cancelled) return;

      const term = trimmedTerm.toLowerCase();

      const clientResults =
        clientsRes.data
          ?.filter((client) =>
            `${client.name} ${client.email || ""} ${client.service || ""} ${
              client.status || ""
            }`
              .toLowerCase()
              .includes(term)
          )
          .map((client) => ({
            id: client.id,
            title: client.name,
            subtitle: client.email || client.service || "Client record",
            type: "Client" as const,
            path: `/clients/${client.id}`,
          })) || [];

      const appointmentResults =
        appointmentsRes.data
          ?.filter((appointment) =>
            `${appointment.client_name} ${appointment.service} ${
              appointment.time || ""
            } ${appointment.status || ""}`
              .toLowerCase()
              .includes(term)
          )
          .map((appointment) => ({
            id: appointment.id,
            title: appointment.client_name,
            subtitle: `${appointment.service} at ${
              appointment.time || "No time"
            }`,
            type: "Appointment" as const,
            path: `/appointments/${appointment.id}`,
          })) || [];

      const serviceResults =
        servicesRes.data
          ?.filter((service) =>
            `${service.name} ${service.price} ${service.duration || ""} ${
              service.tag || ""
            }`
              .toLowerCase()
              .includes(term)
          )
          .map((service) => ({
            id: service.id,
            title: service.name,
            subtitle: `${service.price} • ${service.duration || "No duration"}`,
            type: "Service" as const,
            path: `/services/${service.id}`,
          })) || [];

      setResults([...clientResults, ...appointmentResults, ...serviceResults]);
      setActiveSearchIndex(0);
    }

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [searchTerm]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-[13px] font-semibold text-slate-900 shadow-sm">
          Loading workspace...
        </div>
      </div>
    );
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mb-5">
        <div className="rounded-[26px] border border-slate-200 bg-white/90 p-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <ClientPilotMark />

            <div>
              <h1 className="text-[19px] font-extrabold tracking-[-0.045em] text-slate-950">
                ClientPilot
              </h1>

              <p className="mt-0.5 text-[12px] font-semibold text-slate-400">
                Service CRM
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 px-3 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
        Main Menu
      </div>

      <nav className="space-y-1.5">
        {navItems.map(({ name, icon: Icon, path }) => {
          const isActive =
            path === "/" ? pathname === "/" : pathname.startsWith(path);

          return (
            <Link
              key={name}
              href={path}
              onClick={() => {
                setSearchTerm("");
                setResults([]);
                setActiveSearchIndex(0);
                setMobileMenuOpen(false);
              }}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-[20px] px-3 py-2.5 text-[13px] font-bold transition-all duration-200 ${
                isActive
                  ? "bg-[#4f46e5] text-white shadow-[0_16px_34px_rgba(79,70,229,0.28)]"
                  : "text-slate-500 hover:bg-white hover:text-slate-950 hover:shadow-sm"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.24),transparent_30%)]" />
              )}

              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-[14px] ${
                  isActive
                    ? "bg-white/16 text-white"
                    : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-[#4f46e5]"
                }`}
              >
                <Icon className="h-[16px] w-[16px]" strokeWidth={2.35} />
              </span>

              <span className="relative z-10">{name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[26px] border border-indigo-100 bg-white p-3.5 shadow-sm">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
          <Command className="h-4 w-4" />
        </div>

        <p className="text-[13px] font-extrabold text-slate-950">
          Quick tip
        </p>

        <p className="mt-1 text-[12.5px] leading-5 text-slate-500">
          Use search to jump between clients, bookings and services.
        </p>
      </div>
    </div>
  );

  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-[#f7f8fc] text-slate-950">
        <div className="flex min-h-screen">
          {mobileMenuOpen && (
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            />
          )}

          <aside
            className={`fixed left-0 top-0 z-50 h-full w-[260px] border-r border-slate-200/70 bg-[#f7f8fc] px-4 py-4 transition-transform duration-300 lg:hidden ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-lg font-extrabold tracking-[-0.04em]">
                Menu
              </p>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {SidebarContent}
          </aside>

          <aside className="hidden w-[260px] shrink-0 border-r border-slate-200/70 bg-[#f7f8fc] px-4 py-4 lg:block">
            {SidebarContent}
          </aside>

          <main className="min-w-0 flex-1 bg-[#f7f8fc]">
            <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f7f8fc]/88 px-4 py-3 backdrop-blur-xl lg:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center justify-between gap-3 lg:hidden">
                  <div className="flex items-center gap-3">
                    <ClientPilotMark />

                    <div>
                      <p className="text-lg font-extrabold tracking-[-0.04em]">
                        ClientPilot
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        Workspace
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
                  >
                    <Menu className="h-4 w-4" />
                    Menu
                  </button>
                </div>

                <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="relative w-full lg:w-[430px]">
                    <div className="flex h-[48px] items-center gap-3 rounded-[19px] border border-slate-200 bg-white px-4 text-slate-400 shadow-sm transition-all duration-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10">
                      <Search className="h-4 w-4" />

                      <input
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setActiveSearchIndex(0);
                        }}
                        onKeyDown={(e) => {
                          if (!searchTerm || results.length === 0) return;

                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setActiveSearchIndex((index) =>
                              index === results.length - 1 ? 0 : index + 1
                            );
                          }

                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setActiveSearchIndex((index) =>
                              index === 0 ? results.length - 1 : index - 1
                            );
                          }

                          if (e.key === "Enter") {
                            e.preventDefault();
                            router.push(results[activeSearchIndex].path);
                            setSearchTerm("");
                            setResults([]);
                            setActiveSearchIndex(0);
                          }

                          if (e.key === "Escape") {
                            e.preventDefault();
                            setSearchTerm("");
                            setResults([]);
                            setActiveSearchIndex(0);
                          }
                        }}
                        placeholder="Search clients, bookings, services..."
                        className="w-full bg-transparent text-[13px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>

                    {searchTerm && (
                      <div className="absolute left-0 top-14 z-50 w-full rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                        {results.length > 0 ? (
                          <div className="space-y-1.5">
                            {results.map((result, index) => (
                              <Link
                                key={`${result.type}-${result.id}`}
                                href={result.path}
                                onClick={() => {
                                  setSearchTerm("");
                                  setMobileMenuOpen(false);
                                  setActiveSearchIndex(0);
                                }}
                                onMouseEnter={() => setActiveSearchIndex(index)}
                                className={`block rounded-[18px] px-4 py-3 transition ${
                                  activeSearchIndex === index
                                    ? "bg-indigo-50"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="truncate text-[13.5px] font-bold text-slate-950">
                                      {result.title}
                                    </p>
                                    <p className="mt-0.5 truncate text-[12.5px] font-medium text-slate-400">
                                      {result.subtitle}
                                    </p>
                                  </div>

                                  <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-[#4f46e5] ring-1 ring-indigo-100">
                                    {result.type}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="px-4 py-3 text-[13px] font-medium text-slate-400">
                            No results found.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="hidden items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-slate-500 shadow-sm xl:flex">
                    <Sparkles className="h-4 w-4 text-[#4f46e5]" />
                    Workspace live
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-start">
                  <button className="hidden h-[48px] w-[48px] items-center justify-center rounded-[18px] border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 lg:flex">
                    <Bell className="h-4 w-4" />
                  </button>

                  <Link
                    href="/appointments"
                    className="flex h-[48px] items-center justify-center rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
                  >
                    Manage Bookings
                  </Link>

                  <div ref={profileRef} className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex h-[48px] cursor-pointer items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-2.5 pl-3 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] text-sm font-extrabold text-white">
                        {(user?.user_metadata?.full_name ||
                          user?.user_metadata?.name ||
                          user?.email ||
                          "U")[0].toUpperCase()}
                      </div>

                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          profileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-14 z-50 w-[320px] rounded-[26px] border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                        <div className="flex items-start gap-4 rounded-[22px] px-4 py-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] text-base font-extrabold text-white">
                            {userEmail.charAt(0).toUpperCase() || "N"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-extrabold leading-tight text-slate-950">
                              {user?.user_metadata?.full_name ||
                                user?.user_metadata?.name ||
                                user?.email?.split("@")[0] ||
                                "User"}
                            </p>

                            <p className="mt-1 break-all text-[13px] font-medium text-slate-400">
                              {userEmail || "No email found"}
                            </p>
                          </div>
                        </div>

                        <div className="my-1 h-px bg-slate-100" />

                        <button
                          onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = "/login";
                          }}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-[18px] px-4 py-3 text-left text-[13.5px] font-bold text-red-500 transition hover:bg-red-50"
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

            <div className="px-4 py-5 lg:px-6">{children}</div>
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}