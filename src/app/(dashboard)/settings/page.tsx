"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type WorkspaceSettings = {
  id: number;
  business_name: string;
  business_type: string | null;
  owner_name: string | null;
  currency: string | null;
  timezone: string | null;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    business_name: "",
    business_type: "",
    owner_name: "",
    currency: "",
    timezone: "",
  });

  async function fetchSettings() {
    const { data, error } = await supabase
      .from("workspace_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.log("SETTINGS ERROR:", error);
      return;
    }

    setSettings(data);
    setForm({
      business_name: data.business_name || "",
      business_type: data.business_type || "",
      owner_name: data.owner_name || "",
      currency: data.currency || "",
      timezone: data.timezone || "",
    });
  }

  async function updateSettings() {
    if (!settings) return;

    const { error } = await supabase
      .from("workspace_settings")
      .update({
        business_name: form.business_name,
        business_type: form.business_type,
        owner_name: form.owner_name,
        currency: form.currency,
        timezone: form.timezone,
      })
      .eq("id", settings.id);

    if (error) {
      console.log("UPDATE SETTINGS ERROR:", error);
      return;
    }

    setIsEditing(false);
    fetchSettings();
  }

  function cancelEditing() {
    setIsEditing(false);

    if (!settings) return;

    setForm({
      business_name: settings.business_name || "",
      business_type: settings.business_type || "",
      owner_name: settings.owner_name || "",
      currency: settings.currency || "",
      timezone: settings.timezone || "",
    });
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <section className="space-y-7">
      <div>
        <p className="app-kicker">Workspace</p>

        <h1 className="app-page-title mt-2">Settings</h1>

        <p className="app-muted mt-3">
          Manage business details, workspace preferences and account configuration.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <div className="app-accent-card p-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-black/45">
            Workspace
          </p>

          <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.055em]">
            {settings?.business_name || "Workspace"}
          </h2>

          <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-black/55">
            Your active business workspace for clients, bookings and service operations.
          </p>

          <div className="mt-8 rounded-[26px] bg-black p-5 text-white">
            <p className="text-sm text-white/45">Owner</p>
            <p className="mt-2 text-2xl font-black">
              {settings?.owner_name || "Not set"}
            </p>
          </div>
        </div>

        <div className="app-card p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="app-section-title">Business Profile</h2>
              <p className="app-muted mt-1 text-sm">
                These details are stored live in Supabase.
              </p>
            </div>

            <span className="app-button-secondary px-4 py-2">
              Live data
            </span>
          </div>

          {!isEditing ? (
            <>
              <div className="grid gap-4">
                {[
                  ["Business Name", settings?.business_name],
                  ["Business Type", settings?.business_type],
                  ["Owner", settings?.owner_name],
                  ["Currency", settings?.currency],
                  ["Timezone", settings?.timezone],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="app-card-dark flex items-center justify-between px-5 py-4"
                  >
                    <p className="app-muted text-sm">{label}</p>
                    <p className="text-right font-bold">{value || "Not set"}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="app-button-primary mt-6 w-full py-3"
              >
                Edit Workspace
              </button>
            </>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                    Business Name
                  </span>
                  <input
                    value={form.business_name}
                    onChange={(e) =>
                      setForm({ ...form, business_name: e.target.value })
                    }
                    placeholder="Business name"
                    className="app-input w-full px-4 py-3"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                    Business Type
                  </span>
                  <input
                    value={form.business_type}
                    onChange={(e) =>
                      setForm({ ...form, business_type: e.target.value })
                    }
                    placeholder="Service Business"
                    className="app-input w-full px-4 py-3"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                    Owner Name
                  </span>
                  <input
                    value={form.owner_name}
                    onChange={(e) =>
                      setForm({ ...form, owner_name: e.target.value })
                    }
                    placeholder="Owner name"
                    className="app-input w-full px-4 py-3"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                    Currency
                  </span>
                  <input
                    value={form.currency}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                    placeholder="USD"
                    className="app-input w-full px-4 py-3"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                    Timezone
                  </span>
                  <input
                    value={form.timezone}
                    onChange={(e) =>
                      setForm({ ...form, timezone: e.target.value })
                    }
                    placeholder="Asia/Karachi"
                    className="app-input w-full px-4 py-3"
                  />
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={cancelEditing}
                  className="app-button-secondary flex-1 py-3"
                >
                  Cancel
                </button>

                <button
                  onClick={updateSettings}
                  className="app-button-primary flex-1 py-3"
                >
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}