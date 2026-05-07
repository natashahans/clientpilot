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
  user_id: string;
};

type Toast = {
  message: string;
  type: "success" | "error";
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [form, setForm] = useState({
    business_name: "",
    business_type: "",
    owner_name: "",
    currency: "",
    timezone: "",
  });

  function showToast(message: string, type: Toast["type"] = "success") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  async function fetchSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("workspace_settings")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.log("SETTINGS ERROR:", error);
      showToast("Could not load settings", "error");
      return;
    }

    if (!data) {
      const { data: newSettings, error: insertError } = await supabase
        .from("workspace_settings")
        .insert([
          {
            business_name: "My Workspace",
            business_type: "Service Business",
            owner_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "Owner",
            currency: "USD",
            timezone: "Asia/Karachi",
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.log("CREATE SETTINGS ERROR:", insertError);
        showToast("Could not create workspace settings", "error");
        return;
      }

      setSettings(newSettings);
      setForm({
        business_name: newSettings.business_name || "",
        business_type: newSettings.business_type || "",
        owner_name: newSettings.owner_name || "",
        currency: newSettings.currency || "",
        timezone: newSettings.timezone || "",
      });

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

    if (!form.business_name.trim()) {
      showToast("Business name is required", "error");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("workspace_settings")
      .update({
        business_name: form.business_name,
        business_type: form.business_type,
        owner_name: form.owner_name,
        currency: form.currency,
        timezone: form.timezone,
      })
      .eq("id", settings.id)
      .eq("user_id", settings.user_id);

    if (error) {
      console.log("UPDATE SETTINGS ERROR:", error);
      setSaving(false);
      showToast("Could not update settings", "error");
      return;
    }

    setSaving(false);
    setIsEditing(false);
    showToast("Workspace updated");
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

            <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.055em] sm:text-4xl">
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
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                      className="app-card-dark flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="app-muted text-sm">{label}</p>
                      <p className="break-words font-bold sm:text-right">
                        {value || "Not set"}
                      </p>
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

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="app-button-secondary flex-1 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={updateSettings}
                    disabled={saving}
                    className="app-button-primary flex-1 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}