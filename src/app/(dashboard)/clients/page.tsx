"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  status: string | null;
  last_visit: string | null;
};

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

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

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      console.log("CLIENTS ERROR:", error);
      showToast("Could not load clients", "error");
      setLoading(false);
      return;
    }

    setClients(data || []);
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
            <p className="app-kicker">CRM</p>
            <h1 className="app-page-title mt-2">Clients</h1>
            <p className="app-muted mt-3">
              Manage client records, booking history and relationship status.
            </p>
          </div>

          <button onClick={openAdd} className="app-button-primary px-5 py-3">
            Add Client
          </button>
        </div>

        <div className="app-card p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="app-section-title">Client Directory</h2>
              <p className="app-muted mt-1 text-sm">
                Live client data fetched from Supabase.
              </p>
            </div>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients..."
              className="app-input w-full rounded-full px-5 py-3 text-sm lg:w-auto"
            />
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="app-card-dark h-[84px] animate-pulse"
                />
              ))
            ) : filteredClients.length === 0 ? (
              <div className="app-card-dark p-6 text-center">
                <p className="font-bold">No clients found</p>
                <p className="app-muted mt-1 text-sm">
                  Create a new client or adjust your search.
                </p>
              </div>
            ) : (
              paginatedClients.map((client) => (
                <div
                  key={client.id}
                  className="app-card-dark grid gap-4 px-5 py-4 lg:grid-cols-[1.5fr_1.5fr_1fr_1fr] lg:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-accent)] font-black text-[var(--app-accent-text)]">
                      {client.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold">{client.name}</p>
                      <p className="app-muted truncate text-sm">
                        {client.email || "No email"}
                      </p>
                    </div>
                  </div>

                  <p className="app-muted text-sm lg:text-base">
                    {client.service || "No service"}
                  </p>

                  <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                    {client.status}
                  </span>

                  <div className="flex justify-start gap-3 lg:justify-end">
                    <button
                      onClick={() => openEdit(client)}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        const confirmed = window.confirm(
                          "Delete this client permanently?"
                        );

                        if (confirmed) {
                          deleteClient(client.id);
                        }
                      }}
                      className="text-xs font-semibold text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && filteredClients.length > clientsPerPage && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="app-button-secondary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <p className="app-muted text-sm">
                Showing {(currentPage - 1) * clientsPerPage + 1}-
                {Math.min(currentPage * clientsPerPage, filteredClients.length)} of{" "}
                {filteredClients.length} clients
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
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="app-card max-h-[90vh] w-full max-w-xl overflow-y-auto p-5 sm:p-7">
            <div className="mb-6">
              <p className="app-kicker">
                {editingClient ? "Edit Record" : "New Record"}
              </p>

              <h2 className="app-section-title mt-2">
                {editingClient ? "Edit Client" : "Add Client"}
              </h2>

              <p className="app-muted mt-2 text-sm">
                {editingClient
                  ? "Update this client record in Supabase."
                  : "Create a new client record in your Supabase database."}
              </p>
            </div>

            <div className="grid gap-4">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Client name"
                className="app-input px-4 py-3"
              />

              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className="app-input px-4 py-3"
              />

              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
                className="app-input px-4 py-3"
              />

              <input
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                placeholder="Service"
                className="app-input px-4 py-3"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="app-input px-4 py-3"
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
                className="app-button-secondary w-full px-5 py-3 sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateClient}
                disabled={saving}
                className="app-button-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
    </>
  );
}