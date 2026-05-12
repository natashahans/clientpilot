"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/context/workspace-context";
import {
  formatDateWithTimezone,
  formatPrice,
  formatTimeWithTimezone,
} from "@/lib/formatters";

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
    if (
      !form.client_id ||
      !form.service_id ||
      !form.appointment_at.trim()
    ) {
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
          service_price: form.service_price ? parseFloat(form.service_price) : null,
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
          service_price: form.service_price ? parseFloat(form.service_price) : null,
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

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

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

  return (
    <>
      {toast && (
        <div className="fixed left-4 right-4 top-6 z-[80] flex justify-center sm:left-auto sm:right-6 sm:justify-end">
          <div
            className={`rounded-full px-5 py-3 text-sm font-bold shadow-2xl ${
              toast.type === "success"
                ? "bg-[var(--app-accent)] text-[var(--app-accent-text)]"
                : "bg-[var(--app-danger)] text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <section className="space-y-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="app-kicker">Schedule</p>
            <h1 className="app-page-title mt-2">Appointments</h1>
            <p className="app-muted mt-3">
              Track today’s bookings, session status and client schedule.
            </p>
          </div>

          <button onClick={openAdd} className="app-button-primary px-5 py-3">
            New Appointment
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
          <div className="app-accent-card p-7">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-black/50">
              Total
            </p>

            <h2 className="mt-3 text-6xl font-black tracking-[-0.06em]">
              {appointments.length}
            </h2>

            <p className="mt-2 text-lg font-bold">appointments in database</p>

            <div className="mt-8 rounded-[28px] bg-white/35 p-5 text-black/80 backdrop-blur-xl">
              <p className="text-sm font-semibold text-black/55">Data source</p>
              <p className="mt-2 text-2xl font-black text-black/80">
                Live from Supabase
              </p>
            </div>
          </div>

          <div className="app-card p-6">
            <div className="mb-6">
              <h2 className="app-section-title">Today’s Timeline</h2>
              <p className="app-muted mt-1 text-sm">
                Live overview of upcoming and active appointments.
              </p>

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search appointments..."
                className="app-input mt-4 w-full rounded-full px-5 py-3 text-sm"
              />
            </div>

            <div className="space-y-4">
              {loading ? (
                <>
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="app-card-dark h-24 animate-pulse"
                    />
                  ))}
                </>
              ) : filteredAppointments.length === 0 ? (
                <div className="app-card-dark p-6 text-center">
                  <p className="font-bold">No appointments found</p>
                  <p className="app-muted mt-1 text-sm">
                    Create a new appointment or adjust your search.
                  </p>
                </div>
              ) : (
                paginatedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="app-card-dark grid gap-4 px-5 py-4 lg:grid-cols-[0.8fr_1.1fr_1.1fr_0.8fr_0.7fr] lg:items-center"
                  >
                    <div>
                      <p className="font-black text-[var(--app-accent)]">
                        {formatTimeWithTimezone(
                          appointment.appointment_at,
                          workspaceSettings?.timezone
                        )}
                      </p>

                      <p className="app-muted mt-1 text-xs">
                        {formatDateWithTimezone(
                          appointment.appointment_at,
                          workspaceSettings?.timezone
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold">{appointment.client_name}</p>
                      <p className="app-muted text-sm">Client</p>
                    </div>
                    <div>
                      <p className="app-muted text-sm lg:text-base">
                        {appointment.service}
                      </p>

                      <p className="mt-1 text-xs font-bold text-[var(--app-accent)]">
                        {appointment.service_price
                          ? formatPrice(
                              appointment.service_price.toString(),
                              workspaceSettings?.currency
                            )
                          : "No price"}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                      {appointment.status}
                    </span>

                    <div className="flex justify-start gap-3 lg:justify-end">
                      <button
                        onClick={() => openEdit(appointment)}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setAppointmentToDelete(appointment)}
                        className="text-xs font-semibold text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!loading && filteredAppointments.length > appointmentsPerPage && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  className="app-button-secondary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <p className="app-muted text-sm">
                  Showing {(currentPage - 1) * appointmentsPerPage + 1}-
                  {Math.min(currentPage * appointmentsPerPage, filteredAppointments.length)} of{" "}
                  {filteredAppointments.length} appointments
                </p>

                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="app-button-secondary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {appointmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="app-card w-full max-w-md p-6">
            <p className="app-kicker">Confirm Delete</p>

            <h2 className="app-section-title mt-2">
              Delete this appointment?
            </h2>

            <p className="app-muted mt-3 text-sm">
              This will permanently delete the booking for{" "}
              <span className="font-bold text-[var(--app-text)]">
                {appointmentToDelete.client_name}
              </span>
              .
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setAppointmentToDelete(null)}
                className="app-button-secondary w-full px-5 py-3 sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deleteAppointment(appointmentToDelete.id);
                  setAppointmentToDelete(null);
                }}
                className="w-full rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400 sm:w-auto"
              >
                Delete Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="app-card max-h-[90vh] w-full max-w-xl overflow-y-auto p-5 sm:p-7">
            <div className="mb-6">
              <p className="app-kicker">
                {editingAppointment ? "Edit Booking" : "New Booking"}
              </p>

              <h2 className="app-section-title mt-2">
                {editingAppointment ? "Edit Appointment" : "Add Appointment"}
              </h2>

              <p className="app-muted mt-2 text-sm">
                {editingAppointment
                  ? "Update this appointment record in Supabase."
                  : "Create a new appointment in your Supabase database."}
              </p>
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
                    if (!clientSearch || filteredClients.length === 0) {
                      return;
                    }

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
                  className="app-input w-full px-4 py-3"
                />

                {clientSearch && !form.client_id && filteredClients.length > 0 && (
                  <div className="absolute left-0 right-0 top-14 z-50 rounded-[22px] border app-border bg-[var(--app-surface)] p-2 shadow-2xl shadow-black/30">
                    {filteredClients.map((client, index) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => selectClient(client)}
                        className={`block w-full rounded-2xl px-4 py-3 text-left transition ${
                          activeClientIndex === index
                            ? "bg-[var(--app-accent)] text-[var(--app-accent-text)]"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <p className="font-bold">{client.name}</p>
                        <p className="app-muted text-sm">{client.email || "No email"}</p>
                      </button>
                    ))}
                  </div>
                )}

                {clientSearch && !form.client_id && filteredClients.length === 0 && (
                  <div className="mt-3 space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold">
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
                        className="app-button-secondary px-4 py-2 text-sm"
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
                          className="app-input w-full px-4 py-3"
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
                          className="app-input w-full px-4 py-3"
                        />

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={createClient}
                            disabled={creatingClientSaving}
                            className="app-button-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {creatingClientSaving ? "Saving..." : "Save Client"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setCreatingClient(false)}
                            className="app-button-secondary px-4 py-2 text-sm"
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
                    if (!serviceSearch || filteredServices.length === 0) {
                      return;
                    }

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
                    services.length === 0 ? "No services available" : "Search service..."
                  }
                  className="app-input w-full px-4 py-3"
                />

                {serviceSearch && !form.service_id && filteredServices.length > 0 && (
                  <div className="absolute left-0 right-0 top-14 z-50 rounded-[22px] border app-border bg-[var(--app-surface)] p-2 shadow-2xl shadow-black/30">
                    {filteredServices.map((service, index) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => selectService(service)}
                        className={`block w-full rounded-2xl px-4 py-3 text-left transition ${
                          activeServiceIndex === index
                            ? "bg-[var(--app-accent)] text-[var(--app-accent-text)]"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <p className="font-bold">{service.name}</p>
                        <p className="app-muted text-sm">
                          {formatPrice(service.price, workspaceSettings?.currency)}
                          {service.duration ? ` • ${service.duration}` : ""}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {serviceSearch && !form.service_id && filteredServices.length === 0 && (
                  <div className="mt-3 space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold">
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
                        className="app-button-secondary px-4 py-2 text-sm"
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
                          className="app-input w-full px-4 py-3"
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
                          className="app-input w-full px-4 py-3"
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
                          className="app-input w-full px-4 py-3"
                        />

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={createService}
                            disabled={creatingServiceSaving}
                            className="app-button-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {creatingServiceSaving ? "Saving..." : "Save Service"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setCreatingService(false)}
                            className="app-button-secondary px-4 py-2 text-sm"
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
                className="app-input px-4 py-3"
              />

              <input
                type="datetime-local"
                value={form.appointment_at}
                onChange={(e) =>
                  setForm({ ...form, appointment_at: e.target.value })
                }
                className="app-input px-4 py-3"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="app-input px-4 py-3"
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
                className="app-button-secondary w-full px-5 py-3 sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateAppointment}
                disabled={saving}
                className="app-button-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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