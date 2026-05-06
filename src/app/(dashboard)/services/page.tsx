"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Service = {
  id: number;
  name: string;
  price: string;
  duration: string | null;
  tag: string | null;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    tag: "Active",
  });

  async function fetchServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("SERVICES ERROR:", error);
      return;
    }

    setServices(data || []);
  }

  async function addOrUpdateService() {
    if (!form.name.trim() || !form.price.trim()) return;

    if (editingService) {
      const { error } = await supabase
        .from("services")
        .update({
          name: form.name,
          price: form.price,
          duration: form.duration,
          tag: form.tag,
        })
        .eq("id", editingService.id);

      if (error) {
        console.log("UPDATE SERVICE ERROR:", error);
        return;
      }
    } else {
      const { error } = await supabase.from("services").insert([
        {
          name: form.name,
          price: form.price,
          duration: form.duration,
          tag: form.tag,
        },
      ]);

      if (error) {
        console.log("INSERT SERVICE ERROR:", error);
        return;
      }
    }

    setForm({
      name: "",
      price: "",
      duration: "",
      tag: "Active",
    });

    setEditingService(null);
    setShowModal(false);
    fetchServices();
  }

  async function deleteService(id: number) {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("DELETE SERVICE ERROR:", error);
      return;
    }

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

  return (
    <>
      <section className="space-y-7">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
              Catalogue
            </p>
            <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
              Services
            </h1>
            <p className="mt-3 text-white/45">
              Manage service offers, pricing, duration and performance labels.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black"
          >
            Add Service
          </button>
        </div>

        <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Service Catalogue</h2>
              <p className="mt-1 text-sm text-white/40">
                Live services fetched from Supabase.
              </p>
            </div>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services..."
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="rounded-[32px] border border-white/10 bg-[#0B0B0B] p-6 shadow-2xl shadow-black/30 transition hover:bg-white/[0.06]"
              >
                <div className="mb-10 flex items-center justify-between">
                  <span className="rounded-full bg-[#D7FF5F] px-3 py-1 text-xs font-bold text-black">
                    {service.tag}
                  </span>
                  <span className="text-sm text-white/35">
                    {service.duration}
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-[-0.04em]">
                  {service.name}
                </h2>

                <p className="mt-3 text-5xl font-black tracking-[-0.06em] text-[#D7FF5F]">
                  {service.price}
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => openEdit(service)}
                    className="flex-1 rounded-full border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteService(service.id)}
                    className="flex-1 rounded-full border border-red-400/20 bg-red-500/10 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[36px] border border-white/10 bg-[#111111] p-7 shadow-2xl shadow-black/50">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
                {editingService ? "Edit Offer" : "New Offer"}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
                {editingService ? "Edit Service" : "Add Service"}
              </h2>
              <p className="mt-2 text-sm text-white/40">
                {editingService
                  ? "Update this service record in Supabase."
                  : "Create a new service offer in your Supabase database."}
              </p>
            </div>

            <div className="grid gap-4">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Service name"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price e.g. $40"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <input
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: e.target.value })
                }
                placeholder="Duration e.g. 45 min"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
              />

              <select
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              >
                <option>Active</option>
                <option>Popular</option>
                <option>High Value</option>
                <option>Bundle</option>
                <option>Paused</option>
              </select>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingService(null);
                }}
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white/60"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateService}
                className="rounded-full bg-[#D7FF5F] px-5 py-3 text-sm font-bold text-black"
              >
                {editingService ? "Update Service" : "Save Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}