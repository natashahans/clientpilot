"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/context/workspace-context";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/formatters";
import {
  AlertTriangle,
  Briefcase,
  Clock,
  DollarSign,
  Edit3,
  Flame,
  Layers3,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

type Service = {
  id: number;
  name: string;
  price: string;
  duration: string | null;
  tag: string | null;
};

type Appointment = {
  id: number;
  service_id: number | null;
  service: string;
  service_price: number | null;
  appointment_at: string | null;
};

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const { workspaceSettings } = useWorkspace();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 8;

  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    tag: "Active",
  });

  function showToast(message: string, type: Toast["type"] = "success") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  async function fetchServices() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const [servicesRes, appointmentsRes] = await Promise.all([
      supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false }),

      supabase
        .from("appointments")
        .select("id, service_id, service, service_price, appointment_at")
        .eq("user_id", user.id),
    ]);

    if (servicesRes.error) {
      console.log("SERVICES ERROR:", servicesRes.error);
      showToast("Could not load services", "error");
      setLoading(false);
      return;
    }

    if (appointmentsRes.error) {
      console.log("SERVICE APPOINTMENTS ERROR:", appointmentsRes.error);
    } else {
      setAppointments(appointmentsRes.data || []);
    }

    setServices(servicesRes.data || []);
    setLoading(false);
  }

  function getFormattedDuration() {
    if (!form.duration.trim()) return "";
    return form.duration.trim();
  }

  async function addOrUpdateService() {
    if (!form.name.trim() || !form.price.trim()) {
      showToast("Service name and price are required", "error");
      return;
    }

    setSaving(true);

    if (editingService) {
      const { error } = await supabase
        .from("services")
        .update({
          name: form.name,
          price: form.price,
          duration: getFormattedDuration(),
          tag: form.tag,
        })
        .eq("id", editingService.id);

      if (error) {
        console.log("UPDATE SERVICE ERROR:", error);
        setSaving(false);
        showToast("Could not update service", "error");
        return;
      }

      showToast("Service updated");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaving(false);
        showToast("You must be logged in", "error");
        return;
      }

      const { error } = await supabase.from("services").insert([
        {
          name: form.name,
          price: form.price,
          duration: getFormattedDuration(),
          tag: form.tag,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.log("INSERT SERVICE ERROR:", error);
        setSaving(false);
        showToast("Could not save service", "error");
        return;
      }

      showToast("Service saved");
    }

    setForm({
      name: "",
      price: "",
      duration: "",
      tag: "Active",
    });

    setEditingService(null);
    setShowModal(false);
    setSaving(false);
    fetchServices();
  }

  async function deleteService(id: number) {
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      console.log("DELETE SERVICE ERROR:", error);
      showToast("Could not delete service", "error");
      return;
    }

    showToast("Service deleted");
    fetchServices();
  }

  function openAdd() {
    setEditingService(null);
    setForm({
      name: "",
      price: "",
      duration: "",
      tag: "Active",
    });
    setShowModal(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setForm({
      name: service.name,
      price: service.price,
      duration: service.duration || "",
      tag: service.tag || "Active",
    });
    setShowModal(true);
  }

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter((service) =>
    `${service.name} ${service.price} ${service.duration} ${service.tag}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * servicesPerPage,
    currentPage * servicesPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  function getServiceStats(service: Service) {
    const linkedAppointments = appointments.filter((appointment) => {
      if (appointment.service_id) {
        return appointment.service_id === service.id;
      }

      return appointment.service === service.name;
    });

    const revenue = linkedAppointments.reduce((sum, appointment) => {
      return sum + (appointment.service_price || 0);
    }, 0);

    const latestAppointment = linkedAppointments
      .filter((appointment) => appointment.appointment_at)
      .sort(
        (a, b) =>
          new Date(b.appointment_at || "").getTime() -
          new Date(a.appointment_at || "").getTime()
      )[0];

    return {
      bookings: linkedAppointments.length,
      revenue,
      latestAppointment,
    };
  }

  const totalRevenue = useMemo(
    () =>
      appointments.reduce(
        (sum, appointment) => sum + (appointment.service_price || 0),
        0
      ),
    [appointments]
  );

  const activeServices = services.filter(
    (service) => service.tag !== "Paused"
  ).length;

  const topService = useMemo(() => {
    if (services.length === 0) return null;

    return [...services].sort((a, b) => {
      return getServiceStats(b).bookings - getServiceStats(a).bookings;
    })[0];
  }, [services, appointments]);

  const topServiceStats = topService ? getServiceStats(topService) : null;

  const stats = [
    {
      label: "Total services",
      value: services.length,
      caption: "catalogue offers",
      icon: Layers3,
    },
    {
      label: "Active",
      value: activeServices,
      caption: "available to book",
      icon: Sparkles,
    },
    {
      label: "Bookings",
      value: appointments.length,
      caption: "linked sessions",
      icon: Briefcase,
    },
    {
      label: "Revenue",
      value: formatPrice(totalRevenue.toString(), workspaceSettings?.currency),
      caption: "service value",
      icon: DollarSign,
    },
  ];

  return (
    <>
      {toast && (
        <div className="fixed left-4 right-4 top-6 z-[80] flex justify-center sm:left-auto sm:right-6 sm:justify-end">
          <div
            className={`rounded-full px-5 py-3 text-[13px] font-bold shadow-2xl ${
              toast.type === "success"
                ? "bg-[#4f46e5] text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <section className="grid gap-4">
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="relative overflow-hidden rounded-[38px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute right-[-100px] top-[-110px] h-[300px] w-[300px] rounded-full bg-indigo-100/70 blur-3xl" />
            <div className="absolute bottom-[-130px] left-[22%] h-[260px] w-[260px] rounded-full bg-sky-100/60 blur-3xl" />

            <div className="relative z-10">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4f46e5]">
                Service Catalogue
              </p>

              <h1 className="mt-4 max-w-2xl text-[38px] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[52px]">
                Package your best services into clear offers.
              </h1>

              <p className="mt-4 max-w-xl text-[14.5px] font-medium leading-7 text-slate-500">
                Manage service pricing, durations, labels and performance from
                one clean catalogue.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={openAdd}
                  className="flex h-[48px] items-center justify-center gap-2 rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
                >
                  <Plus className="h-4 w-4" />
                  Add Service
                </button>

                <div className="flex h-[48px] items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm">
                  <Layers3 className="h-4 w-4 text-[#4f46e5]" />
                  {services.length} total services
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#5652f4] via-[#4f46e5] to-[#4338ca] p-6 text-white shadow-[0_24px_70px_rgba(79,70,229,0.22)] sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(0,0,0,0.14),transparent_34%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/55">
                  Top Service Signal
                </p>

                <h2 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-0.055em]">
                  {loading ? "Loading..." : topService?.name || "No service yet"}
                </h2>

                <p className="mt-4 text-[14px] font-medium leading-7 text-white/70">
                  Your strongest service helps shape packages, bundles and repeat
                  booking offers.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {[
                  ["Bookings", topServiceStats?.bookings || 0],
                  [
                    "Revenue",
                    formatPrice(
                      (topServiceStats?.revenue || 0).toString(),
                      workspaceSettings?.currency
                    ),
                  ],
                  ["Active", activeServices],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                  >
                    <p className="text-[11px] font-semibold text-white/55">
                      {label}
                    </p>

                    <p className="mt-2 truncate text-[22px] font-extrabold tracking-[-0.05em]">
                      {loading ? "..." : value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, caption }) => (
            <div
              key={label}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                  <Icon className="h-5 w-5" />
                </div>

                <p className="text-right text-[12px] font-semibold text-slate-400">
                  {caption}
                </p>
              </div>

              <p className="text-[13px] font-semibold text-slate-500">{label}</p>

              <p className="mt-2 truncate text-[34px] font-extrabold tracking-[-0.06em] text-slate-950">
                {loading ? "..." : value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                  Service Catalogue
                </h2>

                <p className="mt-1 text-[13px] font-medium text-slate-500">
                  Live services fetched from Supabase.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-[48px] w-full items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-slate-400 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 sm:w-[340px]">
                  <Search className="h-4 w-4" />

                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search services..."
                    className="w-full bg-transparent text-[13px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  onClick={openAdd}
                  className="flex h-[48px] items-center justify-center gap-2 rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-[260px] animate-pulse rounded-[28px] border border-slate-200 bg-slate-50"
                  />
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="font-bold text-slate-950">No services found</p>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Create a new service or adjust your search.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {paginatedServices.map((service) => {
                    const serviceStats = getServiceStats(service);

                    return (
                      <div
                        key={service.id}
                        onClick={() => router.push(`/services/${service.id}`)}
                        className="group cursor-pointer rounded-[30px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                      >
                        <div className="mb-6 flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#4f46e5] ring-1 ring-indigo-100">
                            <Briefcase className="h-5 w-5" />
                          </div>

                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
                            {service.tag || "No tag"}
                          </span>
                        </div>

                        <h3 className="truncate text-[22px] font-extrabold tracking-[-0.045em] text-slate-950">
                          {service.name}
                        </h3>

                        <p className="mt-2 text-[36px] font-extrabold tracking-[-0.06em] text-[#4f46e5]">
                          {formatPrice(service.price, workspaceSettings?.currency)}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-[20px] border border-slate-200 bg-white p-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Bookings
                            </p>

                            <p className="mt-2 text-[24px] font-extrabold tracking-[-0.05em] text-slate-950">
                              {serviceStats.bookings}
                            </p>
                          </div>

                          <div className="rounded-[20px] border border-slate-200 bg-white p-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Revenue
                            </p>

                            <p className="mt-2 truncate text-[22px] font-extrabold tracking-[-0.05em] text-slate-950">
                              {formatPrice(
                                serviceStats.revenue.toString(),
                                workspaceSettings?.currency
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3 text-[12px] font-semibold text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration || "No duration"}
                          </span>

                          <span>
                            {serviceStats.latestAppointment?.appointment_at
                              ? new Date(
                                  serviceStats.latestAppointment.appointment_at
                                ).toLocaleDateString()
                              : "No bookings yet"}
                          </span>
                        </div>

                        <div className="mt-6 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(service);
                            }}
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[16px] bg-indigo-50 text-[13px] font-bold text-[#4f46e5] ring-1 ring-indigo-100 transition hover:bg-indigo-100"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setServiceToDelete(service);
                            }}
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[16px] bg-red-50 text-[13px] font-bold text-red-500 ring-1 ring-red-100 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!loading && filteredServices.length > servicesPerPage && (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={() =>
                        setCurrentPage((page) => Math.max(page - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-[16px] border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <p className="text-center text-[13px] font-medium text-slate-500">
                      Showing {(currentPage - 1) * servicesPerPage + 1}-
                      {Math.min(
                        currentPage * servicesPerPage,
                        filteredServices.length
                      )}{" "}
                      of {filteredServices.length} services
                    </p>

                    <button
                      onClick={() =>
                        setCurrentPage((page) => Math.min(page + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-[16px] border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="grid gap-4">
            <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-950">
                    Catalogue Health
                  </h3>

                  <p className="mt-1 text-[13px] font-medium text-slate-500">
                    Quick service snapshot.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  ["Services", services.length],
                  ["Active", activeServices],
                  ["Bookings", appointments.length],
                  [
                    "Revenue",
                    formatPrice(totalRevenue.toString(), workspaceSettings?.currency),
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-[13px] font-bold text-slate-500">
                      {label}
                    </p>

                    <p className="max-w-[160px] truncate text-[22px] font-extrabold tracking-[-0.05em] text-slate-950">
                      {loading ? "..." : value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] bg-slate-950 p-5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
              <div className="absolute right-[-80px] top-[-80px] h-[200px] w-[200px] rounded-full bg-[#4f46e5]/40 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">
                      Service Insight
                    </p>

                    <h3 className="mt-1.5 text-[22px] font-extrabold tracking-[-0.045em]">
                      Best performer
                    </h3>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Flame className="h-4 w-4" />
                  </div>
                </div>

                {topService ? (
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl">
                    <p className="text-[24px] font-extrabold tracking-[-0.05em]">
                      {topService.name}
                    </p>

                    <p className="mt-2 text-[13px] font-medium leading-6 text-white/55">
                      This service currently has the strongest booking demand.
                      Use it for bundles, repeat offers, or featured promotions.
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-[18px] bg-white/10 p-3">
                        <p className="text-[11px] font-semibold text-white/45">
                          Bookings
                        </p>
                        <p className="mt-1 text-[22px] font-extrabold">
                          {topServiceStats?.bookings || 0}
                        </p>
                      </div>

                      <div className="rounded-[18px] bg-white/10 p-3">
                        <p className="text-[11px] font-semibold text-white/45">
                          Revenue
                        </p>
                        <p className="mt-1 truncate text-[22px] font-extrabold">
                          {formatPrice(
                            (topServiceStats?.revenue || 0).toString(),
                            workspaceSettings?.currency
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4">
                    <p className="font-bold">No service data yet</p>
                    <p className="mt-1 text-sm font-medium text-white/55">
                      Add services to unlock insights.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-950">
                    Pricing Spread
                  </h3>

                  <p className="mt-1 text-[13px] font-medium text-slate-500">
                    Visual price comparison.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-3">
                {services.slice(0, 5).map((service) => {
                  const price = Number(service.price) || 0;
                  const maxPrice =
                    Math.max(...services.map((item) => Number(item.price) || 0)) ||
                    1;

                  return (
                    <div key={service.id}>
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <p className="truncate text-[13px] font-bold text-slate-600">
                          {service.name}
                        </p>

                        <p className="text-[13px] font-extrabold text-[#4f46e5]">
                          {formatPrice(service.price, workspaceSettings?.currency)}
                        </p>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#4f46e5]"
                          style={{ width: `${Math.max((price / maxPrice) * 100, 8)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {!loading && services.length === 0 && (
                  <div className="rounded-[22px] bg-slate-50 p-5 text-center">
                    <p className="font-bold text-slate-950">No prices yet</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Add service pricing to see this chart.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[34px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
                  {editingService ? "Edit Offer" : "New Offer"}
                </p>

                <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                  {editingService ? "Edit Service" : "Add Service"}
                </h2>

                <p className="mt-2 text-[13px] font-medium leading-6 text-slate-500">
                  {editingService
                    ? "Update this service record in Supabase."
                    : "Create a new service offer in your Supabase database."}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingService(null);
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Service name"
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price e.g. 40"
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <input
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: e.target.value })
                }
                placeholder="Duration e.g. 45 min"
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <select
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option>Active</option>
                <option>Popular</option>
                <option>High Value</option>
                <option>Bundle</option>
                <option>Paused</option>
              </select>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingService(null);
                }}
                disabled={saving}
                className="h-[48px] rounded-[18px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateService}
                disabled={saving}
                className="h-[48px] rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingService
                  ? "Update Service"
                  : "Save Service"}
              </button>
            </div>
          </div>
        </div>
      )}

      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">
              Delete Service
            </p>

            <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
              Delete {serviceToDelete.name}?
            </h2>

            <p className="mt-3 text-[13px] font-medium leading-6 text-slate-500">
              This will permanently remove this service. Existing appointments
              may still show the old service name.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setServiceToDelete(null)}
                className="h-[48px] rounded-[18px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deleteService(serviceToDelete.id);
                  setServiceToDelete(null);
                }}
                className="h-[48px] rounded-[18px] bg-red-500 px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(239,68,68,0.18)] transition hover:bg-red-600"
              >
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}