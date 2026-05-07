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

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

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

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      console.log("SERVICES ERROR:", error);
      showToast("Could not load services", "error");
      setLoading(false);
      return;
    }

    setServices(data || []);
    setLoading(false);
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
          duration: form.duration,
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
          duration: form.duration,
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
            <p className="app-kicker">Catalogue</p>
            <h1 className="app-page-title mt-2">Services</h1>
            <p className="app-muted mt-3">
              Manage service offers, pricing, duration and performance labels.
            </p>
          </div>

          <button onClick={openAdd} className="app-button-primary px-5 py-3">
            Add Service
          </button>
        </div>

        <div className="app-card p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="app-section-title">Service Catalogue</h2>
              <p className="app-muted mt-1 text-sm">
                Live services fetched from Supabase.
              </p>
            </div>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services..."
              className="app-input w-full rounded-full px-5 py-3 text-sm lg:w-auto"
            />
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="app-card-dark h-[220px] animate-pulse"
                />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="app-card-dark p-6 text-center">
              <p className="font-bold">No services found</p>
              <p className="app-muted mt-1 text-sm">
                Create a new service or adjust your search.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {paginatedServices.map((service) => (
                  <div
                    key={service.id}
                    className="app-card-dark p-8 transition-all duration-200 hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-black/5"
                  >
                    <div className="mb-10 flex items-center justify-between">
                      <span className="rounded-full bg-[var(--app-accent)] px-3 py-1 text-xs font-bold text-[var(--app-accent-text)]">
                        {service.tag}
                      </span>

                      <span className="text-sm text-white/35">
                        {service.duration}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black tracking-[-0.04em]">
                      {service.name}
                    </h2>

                    <p className="mt-3 text-5xl font-black tracking-[-0.06em] text-[var(--app-accent)]">
                      {service.price}
                    </p>

                    <div className="mt-8 flex gap-3">
                      <button
                        onClick={() => openEdit(service)}
                        className="app-button-secondary flex-1 py-3"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          const confirmed = window.confirm(
                            "Delete this service permanently?"
                          );

                          if (confirmed) {
                            deleteService(service.id);
                          }
                        }}
                        className="flex-1 rounded-full border border-red-400/20 bg-red-500/10 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!loading && filteredServices.length > servicesPerPage && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.max(page - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="app-button-secondary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <p className="app-muted text-sm">
                    Showing {(currentPage - 1) * servicesPerPage + 1}-
                    {Math.min(currentPage * servicesPerPage, filteredServices.length)} of{" "}
                    {filteredServices.length} services
                  </p>

                  <button
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="app-button-secondary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="app-card max-h-[90vh] w-full max-w-xl overflow-y-auto p-5 sm:p-7">
            <div className="mb-6">
              <p className="app-kicker">
                {editingService ? "Edit Offer" : "New Offer"}
              </p>

              <h2 className="app-section-title mt-2">
                {editingService ? "Edit Service" : "Add Service"}
              </h2>

              <p className="app-muted mt-2 text-sm">
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
                className="app-input px-4 py-3"
              />

              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price e.g. $40"
                className="app-input px-4 py-3"
              />

              <input
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: e.target.value })
                }
                placeholder="Duration e.g. 45 min"
                className="app-input px-4 py-3"
              />

              <select
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="app-input px-4 py-3"
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
                className="app-button-secondary w-full px-5 py-3 sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={addOrUpdateService}
                disabled={saving}
                className="app-button-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
    </>
  );
}