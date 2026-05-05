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
  const [showModal, setShowModal] = useState(false);

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

  async function addClient() {
    if (!form.name.trim()) return;

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

    setForm({
      name: "",
      email: "",
      phone: "",
      service: "",
      status: "Active",
      last_visit: "Today",
    });

    setShowModal(false);
    fetchClients();
  }

  useEffect(() => {
    fetchClients();
  }, []);

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
            onClick={() => setShowModal(true)}
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

            <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/40">
              Search clients...
            </div>
          </div>

          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="grid grid-cols-[1.5fr_1.5fr_1fr_0.8fr] items-center rounded-[26px] border border-white/10 bg-[#0B0B0B] p-5 transition hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D7FF5F] font-black text-black">
                    {client.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </div>

                  <div>
                    <p className="font-bold">{client.name}</p>
                    <p className="text-sm text-white/40">{client.email}</p>
                  </div>
                </div>

                <p className="text-white/70">{client.service}</p>

                <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                  {client.status}
                </span>

                <p className="text-right text-sm text-white/40">
                  {client.last_visit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[36px] border border-white/10 bg-[#111111] p-7 shadow-2xl shadow-black/50">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
                New Record
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
                Add Client
              </h2>
              <p className="mt-2 text-sm text-white/40">
                Create a new client record in your Supabase database.
              </p>
            </div>

            <div className="grid gap-4">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Client name"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <input
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                placeholder="Service"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              >
                <option>Active</option>
                <option>Returning</option>
                <option>New</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white/60"
              >
                Cancel
              </button>

              <button
                onClick={addClient}
                className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black"
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}