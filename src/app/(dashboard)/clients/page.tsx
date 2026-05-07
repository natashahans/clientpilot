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
  const [toast, setToast] = useState<Toast | null>(null);

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
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("CLIENTS ERROR:", error);
      showToast("Could not load clients", "error");
      return;
    }

    setClients(data || []);
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
      const { error } = await supabase.from("clients").insert([
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          status: form.status,
          last_visit: form.last_visit,
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

  return (
    <>
      {toast && (
        <div className="fixed right-6 top-6 z-[80]">
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
        <div className="flex items-end justify-between">
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
          <div className="mb-6 flex items-center justify-between gap-4">
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
              className="app-input rounded-full px-5 py-3 text-sm"
            />
          </div>

          <div className="space-y-3">
            {filteredClients.length === 0 ? (
              <div className="app-card-dark p-6 text-center">
                <p className="font-bold">No clients found</p>
                <p className="app-muted mt-1 text-sm">
                  Create a new client or adjust your search.
                </p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="app-card-dark grid grid-cols-[1.5fr_1.5fr_1fr_1fr] items-center px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-accent)] font-black text-[var(--app-accent-text)]">
                      {client.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")}
                    </div>

                    <div>
                      <p className="font-bold">{client.name}</p>
                      <p className="app-muted text-sm">{client.email}</p>
                    </div>
                  </div>

                  <p className="app-muted">{client.service}</p>

                  <span className="text-sm text-white/60">
                    {client.status}
                  </span>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => openEdit(client)}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteClient(client.id)}
                      className="text-xs font-semibold text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="app-card w-full max-w-xl p-7">
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

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingClient(null);
                }}
                disabled={saving}
                className="app-button-secondary px-5 py-3"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateClient}
                disabled={saving}
                className="app-button-primary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
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