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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    status: "Active",
    last_visit: "Today",
  });

  async function fetchClients() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("CLIENTS ERROR:", error);
      return;
    }

    setClients(data || []);
  }

  async function addOrUpdateClient() {
    if (!form.name.trim()) return;

    if (editingClient) {
      // UPDATE
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
        return;
      }
    } else {
      // INSERT
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
        return;
      }
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
    fetchClients();
  }

  async function deleteClient(id: number) {
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("DELETE ERROR:", error);
      return;
    }

    fetchClients();
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
      <section className="space-y-7">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
              CRM
            </p>
            <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
              Clients
            </h1>
            <p className="mt-3 text-white/45">
              Manage client records, booking history and relationship status.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingClient(null);
              setShowModal(true);
            }}
            className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black"
          >
            Add Client
          </button>
        </div>

        <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Client Directory</h2>
              <p className="mt-1 text-sm text-white/40">
                Live client data fetched from Supabase.
              </p>
            </div>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients..."
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>

          <div className="space-y-3">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr] items-center rounded-[26px] border border-white/10 bg-[#0B0B0B] p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D7FF5F] font-black text-black">
                    {client.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </div>

                  <div>
                    <p className="font-bold">{client.name}</p>
                    <p className="text-sm text-white/40">{client.email}</p>
                  </div>
                </div>

                <p>{client.service}</p>

                <span className="text-sm text-white/60">
                  {client.status}
                </span>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => openEdit(client)}
                    className="text-xs text-blue-400"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteClient(client.id)}
                    className="text-xs text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-[#111] p-6 rounded-xl w-[400px] space-y-4">
            <h2 className="text-xl font-bold">
              {editingClient ? "Edit Client" : "Add Client"}
            </h2>

            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Name"
              className="w-full p-2 bg-black border border-white/10"
            />

            <input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="Email"
              className="w-full p-2 bg-black border border-white/10"
            />

            <input
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              placeholder="Phone"
              className="w-full p-2 bg-black border border-white/10"
            />

            <input
              value={form.service}
              onChange={(e) =>
                setForm({ ...form, service: e.target.value })
              }
              placeholder="Service"
              className="w-full p-2 bg-black border border-white/10"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button
                onClick={addOrUpdateClient}
                className="bg-[#D7FF5F] px-4 py-2 text-black"
              >
                {editingClient ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}