"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/context/workspace-context";
import { useRouter } from "next/navigation";
import {
  formatDateWithTimezone,
  formatPrice,
  formatTimeWithTimezone,
} from "@/lib/formatters";
import {
  AlertTriangle,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

type Appointment = {
  id: number;
  client_name: string;
  service: string;
  client_id: number | null;
  service_id: number | null;
  time: string;
  status: string | null;
  appointment_at: string | null;
  service_price: number | null;
};

type Service = {
  id: number;
  name: string;
  price: string;
  duration: string | null;
};

type Client = {
  id: number;
  name: string;
  email: string | null;
};

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [activeClientIndex, setActiveClientIndex] = useState(0);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [creatingClient, setCreatingClient] = useState(false);
  const [creatingClientSaving, setCreatingClientSaving] = useState(false);
  const [creatingServiceSaving, setCreatingServiceSaving] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [creatingService, setCreatingService] = useState(false);
  const { workspaceSettings } = useWorkspace();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);

  const [newClientForm, setNewClientForm] = useState({
    name: "",
    email: "",
  });

  const [newServiceForm, setNewServiceForm] = useState({
    name: "",
    price: "",
    duration: "",
  });

  const [form, setForm] = useState({
    client_id: "",
    client_name: "",
    service_id: "",
    service: "",
    service_price: "",
    appointment_at: "",
    status: "Confirmed",
  });

  function showToast(message: string, type: Toast["type"] = "success") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  function formatDateTimeForInput(dateTime: string | null) {
    if (!dateTime) return "";

    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  }

  async function fetchAppointments() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const [appointmentsRes, servicesRes, clientsRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("appointment_at", {
          ascending: true,
          nullsFirst: false,
        }),

      supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),

      supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
    ]);

    if (appointmentsRes.error) {
      console.log("APPOINTMENTS ERROR:", appointmentsRes.error);
      setLoading(false);
      showToast("Could not load appointments", "error");
      return;
    }

    setAppointments(appointmentsRes.data || []);

    if (servicesRes.error) {
      console.log("SERVICES ERROR:", servicesRes.error);
    } else {
      setServices(servicesRes.data || []);
    }

    if (clientsRes.error) {
      console.log("CLIENTS ERROR:", clientsRes.error);
    } else {
      setClients(clientsRes.data || []);
    }

    setLoading(false);
  }

  async function createClient() {
    if (creatingClientSaving) return;

    if (!newClientForm.name.trim()) {
      showToast("Client name is required", "error");
      return;
    }

    setCreatingClientSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCreatingClientSaving(false);
      showToast("You must be logged in", "error");
      return;
    }

    const { data, error } = await supabase
      .from("clients")
      .insert([
        {
          name: newClientForm.name,
          email: newClientForm.email.trim().toLowerCase() || null,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log("CREATE CLIENT ERROR:", error);
      setCreatingClientSaving(false);
      showToast("Could not create client", "error");
      return;
    }

    const createdClient = data as Client;

    setClients((prev) => [...prev, createdClient]);

    setForm({
      ...form,
      client_id: createdClient.id.toString(),
      client_name: createdClient.name,
    });

    setClientSearch(createdClient.name);

    setNewClientForm({
      name: "",
      email: "",
    });

    setCreatingClient(false);
    setCreatingClientSaving(false);

    showToast("Client created");
  }

  async function createService() {
    if (creatingServiceSaving) return;

    if (!newServiceForm.name.trim() || !newServiceForm.price.trim()) {
      showToast("Service name and price are required", "error");
      return;
    }

    setCreatingServiceSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCreatingServiceSaving(false);
      showToast("You must be logged in", "error");
      return;
    }

    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          name: newServiceForm.name,
          price: newServiceForm.price,
          duration: newServiceForm.duration || null,
          tag: "Active",
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log("CREATE SERVICE ERROR:", error);
      setCreatingServiceSaving(false);
      showToast("Could not create service", "error");
      return;
    }

    const createdService = data as Service;

    setServices((prev) => [...prev, createdService]);

    setForm({
      ...form,
      service_id: createdService.id.toString(),
      service: createdService.name,
      service_price: createdService.price,
    });

    setServiceSearch(createdService.name);

    setNewServiceForm({
      name: "",
      price: "",
      duration: "",
    });

    setCreatingService(false);
    setCreatingServiceSaving(false);

    showToast("Service created");
  }

  async function addOrUpdateAppointment() {
    if (!form.client_id || !form.service_id || !form.appointment_at.trim()) {
      showToast("Please fill all appointment fields", "error");
      return;
    }

    setSaving(true);

    const appointmentTime = formatTimeWithTimezone(
      new Date(form.appointment_at).toISOString(),
      workspaceSettings?.timezone
    );

    if (editingAppointment) {
      const { error } = await supabase
        .from("appointments")
        .update({
          client_id: form.client_id ? Number(form.client_id) : null,
          service_id: form.service_id ? Number(form.service_id) : null,
          client_name: form.client_name,
          service: form.service,
          service_price: form.service_price
            ? parseFloat(form.service_price)
            : null,
          time: appointmentTime,
          appointment_at: new Date(form.appointment_at).toISOString(),
          status: form.status,
        })
        .eq("id", editingAppointment.id);

      if (error) {
        console.log("UPDATE APPOINTMENT ERROR:", error);
        setSaving(false);
        showToast("Could not update appointment", "error");
        return;
      }

      showToast("Appointment updated");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaving(false);
        showToast("You must be logged in", "error");
        return;
      }

      const { error } = await supabase.from("appointments").insert([
        {
          client_id: form.client_id ? Number(form.client_id) : null,
          service_id: form.service_id ? Number(form.service_id) : null,
          client_name: form.client_name,
          service: form.service,
          service_price: form.service_price
            ? parseFloat(form.service_price)
            : null,
          time: appointmentTime,
          appointment_at: new Date(form.appointment_at).toISOString(),
          status: form.status,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.log("INSERT APPOINTMENT ERROR:", error);
        setSaving(false);
        showToast("Could not save appointment", "error");
        return;
      }

      showToast("Appointment saved");
    }

    setForm({
      client_id: "",
      client_name: "",
      service_id: "",
      service: "",
      service_price: "",
      appointment_at: "",
      status: "Confirmed",
    });

    setEditingAppointment(null);
    setShowModal(false);
    setSaving(false);
    fetchAppointments();
  }

  async function deleteAppointment(id: number) {
    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      console.log("DELETE APPOINTMENT ERROR:", error);
      showToast("Could not delete appointment", "error");
      return;
    }

    showToast("Appointment deleted");
    fetchAppointments();
  }

  function openEdit(appointment: Appointment) {
    setEditingAppointment(appointment);
    setForm({
      client_id: appointment.client_id?.toString() || "",
      client_name: appointment.client_name,
      service_id: appointment.service_id?.toString() || "",
      service: appointment.service,
      service_price: appointment.service_price?.toString() || "",
      appointment_at: formatDateTimeForInput(appointment.appointment_at),
      status: appointment.status || "Confirmed",
    });

    setClientSearch(appointment.client_name);
    setServiceSearch(appointment.service);
    setShowModal(true);
  }

  function openAdd() {
    setEditingAppointment(null);
    setForm({
      client_id: "",
      client_name: "",
      service_id: "",
      service: "",
      service_price: "",
      appointment_at: "",
      status: "Confirmed",
    });

    setClientSearch("");
    setActiveClientIndex(0);
    setActiveServiceIndex(0);
    setServiceSearch("");
    setCreatingClient(false);
    setCreatingService(false);
    setCreatingClientSaving(false);
    setCreatingServiceSaving(false);
    setShowModal(true);
  }

  function selectClient(client: Client) {
    setForm({
      ...form,
      client_id: client.id.toString(),
      client_name: client.name,
    });

    setClientSearch(client.name);
    setActiveClientIndex(0);
  }

  function selectService(service: Service) {
    setForm({
      ...form,
      service_id: service.id.toString(),
      service: service.name,
      service_price: service.price,
    });

    setServiceSearch(service.name);
    setActiveServiceIndex(0);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) =>
    `${appointment.client_name} ${appointment.client_id} ${appointment.service} ${appointment.service_id} ${appointment.service_price} ${appointment.time} ${appointment.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * appointmentsPerPage,
    currentPage * appointmentsPerPage
  );

  const filteredClients = clients
    .filter((client) =>
      `${client.name} ${client.email || ""}`
        .toLowerCase()
        .includes(clientSearch.toLowerCase())
    )
    .slice(0, 6);

  const filteredServices = services
    .filter((service) =>
      `${service.name} ${service.price} ${service.duration || ""}`
        .toLowerCase()
        .includes(serviceSearch.toLowerCase())
    )
    .slice(0, 6);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const upcomingAppointments = appointments.filter((appointment) => {
    if (!appointment.appointment_at) return false;
    return new Date(appointment.appointment_at).getTime() >= new Date().getTime();
  });

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;

  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "Cancelled"
  ).length;

  const totalRevenue = appointments.reduce(
    (sum, appointment) => sum + (appointment.service_price || 0),
    0
  );

  const stats = [
    {
      label: "Total bookings",
      value: appointments.length,
      caption: "saved appointments",
      icon: CalendarDays,
    },
    {
      label: "Upcoming",
      value: upcomingAppointments.length,
      caption: "future sessions",
      icon: Clock,
    },
    {
      label: "Confirmed",
      value: confirmedAppointments,
      caption: "ready to go",
      icon: CheckCircle2,
    },
    {
      label: "Revenue",
      value: formatPrice(totalRevenue.toString(), workspaceSettings?.currency),
      caption: "booking value",
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
                Schedule
              </p>

              <h1 className="mt-4 max-w-2xl text-[38px] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[52px]">
                Manage every booking from one live timeline.
              </h1>

              <p className="mt-4 max-w-xl text-[14.5px] font-medium leading-7 text-slate-500">
                Track appointment times, client sessions, service value and
                booking status without jumping between messy tools.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={openAdd}
                  className="flex h-[48px] items-center justify-center gap-2 rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
                >
                  <Plus className="h-4 w-4" />
                  New Appointment
                </button>

                <div className="flex h-[48px] items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm">
                  <CalendarDays className="h-4 w-4 text-[#4f46e5]" />
                  {appointments.length} total bookings
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#5652f4] via-[#4f46e5] to-[#4338ca] p-6 text-white shadow-[0_24px_70px_rgba(79,70,229,0.22)] sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(0,0,0,0.14),transparent_34%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/55">
                  Booking Signal
                </p>

                <h2 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-0.055em]">
                  {loading ? "Loading..." : `${upcomingAppointments.length} upcoming`}
                </h2>

                <p className="mt-4 text-[14px] font-medium leading-7 text-white/70">
                  Keep upcoming sessions visible and react faster to pending or
                  cancelled bookings.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {[
                  ["Confirmed", confirmedAppointments],
                  ["Pending", pendingAppointments],
                  ["Cancelled", cancelledAppointments],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                  >
                    <p className="text-[11px] font-semibold text-white/55">
                      {label}
                    </p>

                    <p className="mt-2 text-[24px] font-extrabold tracking-[-0.05em]">
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

              <p className="mt-2 text-[34px] font-extrabold tracking-[-0.06em] text-slate-950">
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
                  Appointment Timeline
                </h2>

                <p className="mt-1 text-[13px] font-medium text-slate-500">
                  Live appointment records fetched from Supabase.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-[48px] w-full items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-slate-400 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 sm:w-[340px]">
                  <Search className="h-4 w-4" />

                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search appointments..."
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

            <div className="overflow-hidden rounded-[28px] border border-slate-200">
              <div className="hidden grid-cols-[0.85fr_1fr_1.1fr_0.75fr_0.65fr] bg-slate-50 px-5 py-3 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-slate-400 lg:grid">
                <p>Time</p>
                <p>Client</p>
                <p>Service</p>
                <p>Status</p>
                <p className="text-right">Actions</p>
              </div>

              <div className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  [1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-[88px] animate-pulse bg-slate-50"
                    />
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="font-bold text-slate-950">
                      No appointments found
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Create a new appointment or adjust your search.
                    </p>
                  </div>
                ) : (
                  paginatedAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() =>
                        router.push(`/appointments/${appointment.id}`)
                      }
                      className="grid cursor-pointer gap-4 px-5 py-4 transition hover:bg-slate-50 lg:grid-cols-[0.85fr_1fr_1.1fr_0.75fr_0.65fr] lg:items-center"
                    >
                      <div>
                        <p className="text-[14px] font-extrabold text-[#4f46e5]">
                          {formatTimeWithTimezone(
                            appointment.appointment_at,
                            workspaceSettings?.timezone
                          )}
                        </p>

                        <p className="mt-1 text-[12px] font-medium text-slate-400">
                          {formatDateWithTimezone(
                            appointment.appointment_at,
                            workspaceSettings?.timezone
                          )}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-extrabold text-slate-950">
                          {appointment.client_name}
                        </p>
                        <p className="mt-1 text-[12px] font-medium text-slate-400">
                          Client session
                        </p>
                      </div>

                      <div className="flex min-w-0 items-center gap-2">
                        <Briefcase className="h-4 w-4 shrink-0 text-slate-300" />

                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-slate-600">
                            {appointment.service}
                          </p>

                          <p className="mt-1 text-[12px] font-bold text-[#4f46e5]">
                            {appointment.service_price
                              ? formatPrice(
                                  appointment.service_price.toString(),
                                  workspaceSettings?.currency
                                )
                              : "No price"}
                          </p>
                        </div>
                      </div>

                      <span className="w-fit rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
                        {appointment.status || "No status"}
                      </span>

                      <div className="flex justify-start gap-2 lg:justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(appointment);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100 transition hover:bg-indigo-100"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAppointmentToDelete(appointment);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 ring-1 ring-red-100 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {!loading && filteredAppointments.length > appointmentsPerPage && (
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
                  Showing {(currentPage - 1) * appointmentsPerPage + 1}-
                  {Math.min(
                    currentPage * appointmentsPerPage,
                    filteredAppointments.length
                  )}{" "}
                  of {filteredAppointments.length} appointments
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
          </div>

          <div className="grid gap-4">
            <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-950">
                    Booking Health
                  </h3>

                  <p className="mt-1 text-[13px] font-medium text-slate-500">
                    Quick operational snapshot.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  ["Confirmed", confirmedAppointments],
                  ["Pending", pendingAppointments],
                  ["Cancelled", cancelledAppointments],
                  ["Services", services.length],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-[13px] font-bold text-slate-500">
                      {label}
                    </p>

                    <p className="text-[22px] font-extrabold tracking-[-0.05em] text-slate-950">
                      {loading ? "..." : value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
                Next Booking
              </p>

              {loading ? (
                <div className="mt-4 h-[120px] animate-pulse rounded-[24px] bg-slate-50" />
              ) : upcomingAppointments.length === 0 ? (
                <div className="mt-4 rounded-[24px] bg-slate-50 p-5 text-center">
                  <p className="font-bold text-slate-950">No upcoming booking</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    New sessions will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[14px] font-extrabold text-[#4f46e5]">
                    {formatTimeWithTimezone(
                      upcomingAppointments[0].appointment_at,
                      workspaceSettings?.timezone
                    )}
                  </p>

                  <p className="mt-3 text-[20px] font-extrabold tracking-[-0.04em] text-slate-950">
                    {upcomingAppointments[0].service}
                  </p>

                  <p className="mt-1 text-[13px] font-medium text-slate-500">
                    {upcomingAppointments[0].client_name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {appointmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">
              Confirm Delete
            </p>

            <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
              Delete this appointment?
            </h2>

            <p className="mt-3 text-[13px] font-medium leading-6 text-slate-500">
              This will permanently delete the booking for{" "}
              <span className="font-bold text-slate-950">
                {appointmentToDelete.client_name}
              </span>
              .
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setAppointmentToDelete(null)}
                className="h-[48px] rounded-[18px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deleteAppointment(appointmentToDelete.id);
                  setAppointmentToDelete(null);
                }}
                className="h-[48px] rounded-[18px] bg-red-500 px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(239,68,68,0.18)] transition hover:bg-red-600"
              >
                Delete Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[34px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
                  {editingAppointment ? "Edit Booking" : "New Booking"}
                </p>

                <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                  {editingAppointment ? "Edit Appointment" : "Add Appointment"}
                </h2>

                <p className="mt-2 text-[13px] font-medium leading-6 text-slate-500">
                  {editingAppointment
                    ? "Update this appointment record in Supabase."
                    : "Create a new appointment in your Supabase database."}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAppointment(null);
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4">
              <div className="relative">
                <input
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setActiveClientIndex(0);

                    setForm({
                      ...form,
                      client_id: "",
                      client_name: "",
                    });
                  }}
                  onKeyDown={(e) => {
                    if (!clientSearch || filteredClients.length === 0) return;

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveClientIndex((index) =>
                        index === filteredClients.length - 1 ? 0 : index + 1
                      );
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveClientIndex((index) =>
                        index === 0 ? filteredClients.length - 1 : index - 1
                      );
                    }

                    if (e.key === "Enter") {
                      e.preventDefault();
                      selectClient(filteredClients[activeClientIndex]);
                    }

                    if (e.key === "Escape") {
                      e.preventDefault();
                      setClientSearch("");
                      setActiveClientIndex(0);
                      setForm({
                        ...form,
                        client_id: "",
                        client_name: "",
                      });
                    }
                  }}
                  placeholder={
                    clients.length === 0
                      ? "No clients available"
                      : "Search client..."
                  }
                  className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                />

                {clientSearch && !form.client_id && filteredClients.length > 0 && (
                  <div className="absolute left-0 right-0 top-14 z-50 rounded-[22px] border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                    {filteredClients.map((client, index) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => selectClient(client)}
                        className={`block w-full rounded-[18px] px-4 py-3 text-left transition ${
                          activeClientIndex === index
                            ? "bg-indigo-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <p className="font-bold text-slate-950">{client.name}</p>
                        <p className="text-sm font-medium text-slate-400">
                          {client.email || "No email"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {clientSearch && !form.client_id && filteredClients.length === 0 && (
                  <div className="mt-3 space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      No matching client found
                    </p>

                    {!creatingClient ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCreatingClient(true);

                          setNewClientForm({
                            ...newClientForm,
                            name: clientSearch,
                          });
                        }}
                        className="rounded-[16px] border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
                      >
                        Create &quot;{clientSearch}&quot; as new client
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <input
                          value={newClientForm.name}
                          onChange={(e) =>
                            setNewClientForm({
                              ...newClientForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="Client name"
                          className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                        />

                        <input
                          value={newClientForm.email}
                          onChange={(e) =>
                            setNewClientForm({
                              ...newClientForm,
                              email: e.target.value,
                            })
                          }
                          placeholder="Client email"
                          className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                        />

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={createClient}
                            disabled={creatingClientSaving}
                            className="rounded-[16px] bg-[#4f46e5] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {creatingClientSaving ? "Saving..." : "Save Client"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setCreatingClient(false)}
                            className="rounded-[16px] border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  value={serviceSearch}
                  onChange={(e) => {
                    setServiceSearch(e.target.value);
                    setActiveServiceIndex(0);

                    setForm({
                      ...form,
                      service_id: "",
                      service: "",
                      service_price: "",
                    });
                  }}
                  onKeyDown={(e) => {
                    if (!serviceSearch || filteredServices.length === 0) return;

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveServiceIndex((index) =>
                        index === filteredServices.length - 1 ? 0 : index + 1
                      );
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveServiceIndex((index) =>
                        index === 0 ? filteredServices.length - 1 : index - 1
                      );
                    }

                    if (e.key === "Enter") {
                      e.preventDefault();
                      selectService(filteredServices[activeServiceIndex]);
                    }

                    if (e.key === "Escape") {
                      e.preventDefault();
                      setServiceSearch("");
                      setActiveServiceIndex(0);
                      setForm({
                        ...form,
                        service_id: "",
                        service: "",
                        service_price: "",
                      });
                    }
                  }}
                  placeholder={
                    services.length === 0
                      ? "No services available"
                      : "Search service..."
                  }
                  className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                />

                {serviceSearch &&
                  !form.service_id &&
                  filteredServices.length > 0 && (
                    <div className="absolute left-0 right-0 top-14 z-50 rounded-[22px] border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                      {filteredServices.map((service, index) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => selectService(service)}
                          className={`block w-full rounded-[18px] px-4 py-3 text-left transition ${
                            activeServiceIndex === index
                              ? "bg-indigo-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <p className="font-bold text-slate-950">
                            {service.name}
                          </p>

                          <p className="text-sm font-medium text-slate-400">
                            {formatPrice(
                              service.price,
                              workspaceSettings?.currency
                            )}
                            {service.duration ? ` • ${service.duration}` : ""}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                {serviceSearch &&
                  !form.service_id &&
                  filteredServices.length === 0 && (
                    <div className="mt-3 space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-950">
                        No matching service found
                      </p>

                      {!creatingService ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCreatingService(true);

                            setNewServiceForm({
                              ...newServiceForm,
                              name: serviceSearch,
                            });
                          }}
                          className="rounded-[16px] border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
                        >
                          Create &quot;{serviceSearch}&quot; as new service
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <input
                            value={newServiceForm.name}
                            onChange={(e) =>
                              setNewServiceForm({
                                ...newServiceForm,
                                name: e.target.value,
                              })
                            }
                            placeholder="Service name"
                            className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                          />

                          <input
                            type="number"
                            min="0"
                            value={newServiceForm.price}
                            onChange={(e) =>
                              setNewServiceForm({
                                ...newServiceForm,
                                price: e.target.value,
                              })
                            }
                            placeholder="Service price e.g. 200"
                            className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                          />

                          <input
                            value={newServiceForm.duration}
                            onChange={(e) =>
                              setNewServiceForm({
                                ...newServiceForm,
                                duration: e.target.value,
                              })
                            }
                            placeholder="Duration e.g. 30 min"
                            className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                          />

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={createService}
                              disabled={creatingServiceSaving}
                              className="rounded-[16px] bg-[#4f46e5] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {creatingServiceSaving
                                ? "Saving..."
                                : "Save Service"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setCreatingService(false)}
                              className="rounded-[16px] border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              <input
                type="number"
                min="0"
                value={form.service_price}
                onChange={(e) =>
                  setForm({ ...form, service_price: e.target.value })
                }
                placeholder="Service price e.g. 200"
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <input
                type="datetime-local"
                value={form.appointment_at}
                onChange={(e) =>
                  setForm({ ...form, appointment_at: e.target.value })
                }
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option>Confirmed</option>
                <option>In Progress</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAppointment(null);
                }}
                disabled={saving}
                className="h-[48px] rounded-[18px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateAppointment}
                disabled={saving}
                className="h-[48px] rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingAppointment
                  ? "Update Appointment"
                  : "Save Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}