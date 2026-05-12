"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserPlus,
  Repeat,
  Mail,
  Phone,
  Briefcase,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

type Client = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  status: string | null;
  last_visit: string | null;
};

type Service = {
  id: number;
  name: string;
};

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    status: "Active",
    last_visit: "Today",
  });

  function showToast(message: string, type: Toast["type"] = "success") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  async function fetchClients() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const [clientsRes, servicesRes] = await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false }),

      supabase
        .from("services")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
    ]);

    if (clientsRes.error) {
      console.log("CLIENTS ERROR:", clientsRes.error);
      showToast("Could not load clients", "error");
      setLoading(false);
      return;
    }

    if (servicesRes.error) {
      console.log("CLIENT SERVICES ERROR:", servicesRes.error);
      showToast("Could not load services", "error");
    } else {
      setServices(servicesRes.data || []);
    }

    setClients(clientsRes.data || []);
    setLoading(false);
  }

  async function addOrUpdateClient() {
    if (!form.name.trim()) {
      showToast("Client name is required", "error");
      return;
    }

    setSaving(true);

    if (editingClient) {
      const { error } = await supabase
        .from("clients")
        .update({
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          status: form.status,
          last_visit: form.last_visit,
        })
        .eq("id", editingClient.id);

      if (error) {
        console.log("UPDATE ERROR:", error);
        setSaving(false);
        showToast("Could not update client", "error");
        return;
      }

      showToast("Client updated");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaving(false);
        showToast("You must be logged in to save clients", "error");
        return;
      }

      const { error } = await supabase.from("clients").insert([
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          status: form.status,
          last_visit: form.last_visit,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.log("INSERT ERROR:", error);
        setSaving(false);
        showToast("Could not save client", "error");
        return;
      }

      showToast("Client saved");
    }

    setForm({
      name: "",
      email: "",
      phone: "",
      service: "",
      status: "Active",
      last_visit: "Today",
    });

    setEditingClient(null);
    setShowModal(false);
    setSaving(false);
    fetchClients();
  }

  async function deleteClient(id: number) {
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      console.log("DELETE ERROR:", error);
      showToast("Could not delete client", "error");
      return;
    }

    showToast("Client deleted");
    fetchClients();
  }

  function openAdd() {
    setEditingClient(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      service: "",
      status: "Active",
      last_visit: "Today",
    });
    setShowModal(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      service: client.service || "",
      status: client.status || "Active",
      last_visit: client.last_visit || "Today",
    });
    setShowModal(true);
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) =>
    `${client.name} ${client.email} ${client.service} ${client.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * clientsPerPage,
    currentPage * clientsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const activeClients = useMemo(
    () => clients.filter((client) => client.status === "Active").length,
    [clients]
  );

  const newClients = useMemo(
    () => clients.filter((client) => client.status === "New").length,
    [clients]
  );

  const returningClients = useMemo(
    () => clients.filter((client) => client.status === "Returning").length,
    [clients]
  );

  const stats = [
    {
      label: "Total clients",
      value: clients.length,
      icon: Users,
      caption: "saved records",
    },
    {
      label: "Active",
      value: activeClients,
      icon: UserCheck,
      caption: "ready to book",
    },
    {
      label: "Returning",
      value: returningClients,
      icon: Repeat,
      caption: "relationship signal",
    },
    {
      label: "New",
      value: newClients,
      icon: UserPlus,
      caption: "fresh leads",
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
                Client Directory
              </p>

              <h1 className="mt-4 max-w-2xl text-[38px] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[52px]">
                Manage every client from one calm workspace.
              </h1>

              <p className="mt-4 max-w-xl text-[14.5px] font-medium leading-7 text-slate-500">
                Store client details, track relationship status and connect each
                person to their preferred service.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={openAdd}
                  className="flex h-[48px] items-center justify-center gap-2 rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
                >
                  <Plus className="h-4 w-4" />
                  Add Client
                </button>

                <div className="flex h-[48px] items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm">
                  <Users className="h-4 w-4 text-[#4f46e5]" />
                  {clients.length} total records
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#5652f4] via-[#4f46e5] to-[#4338ca] p-6 text-white shadow-[0_24px_70px_rgba(79,70,229,0.22)] sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(0,0,0,0.14),transparent_34%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/55">
                  CRM Signal
                </p>

                <h2 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-0.055em]">
                  {loading ? "Loading..." : `${activeClients} active clients`}
                </h2>

                <p className="mt-4 text-[14px] font-medium leading-7 text-white/70">
                  Keep your best relationships visible and quickly jump into
                  each profile.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {[
                  ["Active", activeClients],
                  ["Returning", returningClients],
                  ["New", newClients],
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

        <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                Client Directory
              </h2>

              <p className="mt-1 text-[13px] font-medium text-slate-500">
                Live client data fetched from Supabase.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-[48px] w-full items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-slate-400 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 sm:w-[340px]">
                <Search className="h-4 w-4" />

                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search clients..."
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
            <div className="hidden grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr] bg-slate-50 px-5 py-3 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-slate-400 lg:grid">
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
                    className="h-[82px] animate-pulse bg-slate-50"
                  />
                ))
              ) : filteredClients.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="font-bold text-slate-950">No clients found</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Create a new client or adjust your search.
                  </p>
                </div>
              ) : (
                paginatedClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => router.push(`/clients/${client.id}`)}
                    className="grid cursor-pointer gap-4 px-5 py-4 transition hover:bg-slate-50 lg:grid-cols-[1.4fr_1.2fr_0.8fr_0.8fr] lg:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-[13px] font-extrabold text-[#4f46e5] ring-1 ring-indigo-100">
                        {client.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-extrabold text-slate-950">
                          {client.name}
                        </p>

                        <div className="mt-1 flex flex-col gap-1 text-[12.5px] font-medium text-slate-400 sm:flex-row sm:items-center sm:gap-3">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {client.email || "No email"}
                            </span>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            {client.phone || "No phone"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500">
                      <Briefcase className="h-4 w-4 text-slate-300" />
                      <span className="truncate">
                        {client.service || "No preferred service"}
                      </span>
                    </div>

                    <span className="w-fit rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
                      {client.status || "No status"}
                    </span>

                    <div className="flex justify-start gap-2 lg:justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(client);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100 transition hover:bg-indigo-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setClientToDelete(client);
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

          {!loading && filteredClients.length > clientsPerPage && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-[16px] border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <p className="text-center text-[13px] font-medium text-slate-500">
                Showing {(currentPage - 1) * clientsPerPage + 1}-
                {Math.min(currentPage * clientsPerPage, filteredClients.length)}{" "}
                of {filteredClients.length} clients
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
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[34px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
                  {editingClient ? "Edit Record" : "New Record"}
                </p>

                <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                  {editingClient ? "Edit Client" : "Add Client"}
                </h2>

                <p className="mt-2 text-[13px] font-medium leading-6 text-slate-500">
                  {editingClient
                    ? "Update this client record in Supabase."
                    : "Create a new client record in your Supabase database."}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingClient(null);
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
                placeholder="Client name"
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              />

              <select
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">Select preferred service</option>

                {services.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-[50px] rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option>Active</option>
                <option>Returning</option>
                <option>New</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingClient(null);
                }}
                disabled={saving}
                className="h-[48px] rounded-[18px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateClient}
                disabled={saving}
                className="h-[48px] rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingClient
                  ? "Update Client"
                  : "Save Client"}
              </button>
            </div>
          </div>
        </div>
      )}

      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">
              Delete Client
            </p>

            <h2 className="mt-2 text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
              Delete {clientToDelete.name}?
            </h2>

            <p className="mt-3 text-[13px] font-medium leading-6 text-slate-500">
              This will permanently remove this client record. This action
              cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setClientToDelete(null)}
                className="h-[48px] rounded-[18px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deleteClient(clientToDelete.id);
                  setClientToDelete(null);
                }}
                className="h-[48px] rounded-[18px] bg-red-500 px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(239,68,68,0.18)] transition hover:bg-red-600"
              >
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}