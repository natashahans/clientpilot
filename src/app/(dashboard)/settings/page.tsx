"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/context/workspace-context";
import {
  BadgeCheck,
  Building2,
  Clock,
  Coins,
  Edit3,
  Globe2,
  Save,
  Sparkles,
  User,
  X,
} from "lucide-react";

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

const currencyOptions = [
  { label: "US Dollar", value: "USD", symbol: "$" },
  { label: "Pakistani Rupee", value: "PKR", symbol: "Rs" },
  { label: "Euro", value: "EUR", symbol: "€" },
  { label: "British Pound", value: "GBP", symbol: "£" },
  { label: "Canadian Dollar", value: "CAD", symbol: "$" },
  { label: "Australian Dollar", value: "AUD", symbol: "$" },
  { label: "UAE Dirham", value: "AED", symbol: "د.إ" },
];

const timezoneOptions = [
  "Asia/Karachi",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Toronto",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const { refreshWorkspaceSettings } = useWorkspace();

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
      .order("created_at", { ascending: false })
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

    const { data, error } = await supabase
      .from("workspace_settings")
      .update({
        business_name: form.business_name,
        business_type: form.business_type,
        owner_name: form.owner_name,
        currency: form.currency,
        timezone: form.timezone,
      })
      .eq("id", settings.id)
      .eq("user_id", settings.user_id)
      .select()
      .single();

    if (error) {
      console.log("UPDATE SETTINGS ERROR:", error);
      setSaving(false);
      showToast("Could not update settings", "error");
      return;
    }

    if (!data) {
      console.log("NO SETTINGS ROW UPDATED");
      setSaving(false);
      showToast("No settings row was updated", "error");
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

    await refreshWorkspaceSettings();

    setSaving(false);
    setIsEditing(false);
    showToast("Workspace updated");
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

  const currentCurrency = currencyOptions.find(
    (currency) => currency.value === settings?.currency
  );

  const profileItems = [
    {
      label: "Business Name",
      value: settings?.business_name || "Not set",
      icon: Building2,
    },
    {
      label: "Business Type",
      value: settings?.business_type || "Not set",
      icon: BadgeCheck,
    },
    {
      label: "Owner",
      value: settings?.owner_name || "Not set",
      icon: User,
    },
    {
      label: "Currency",
      value: settings?.currency
        ? `${currentCurrency?.symbol || ""} ${settings.currency}`
        : "Not set",
      icon: Coins,
    },
    {
      label: "Timezone",
      value: settings?.timezone || "Not set",
      icon: Globe2,
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
                Workspace Settings
              </p>

              <h1 className="mt-4 max-w-2xl text-[38px] font-extrabold leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-[52px]">
                Control your business profile and workspace defaults.
              </h1>

              <p className="mt-4 max-w-xl text-[14.5px] font-medium leading-7 text-slate-500">
                Manage business details, owner identity, currency and timezone
                preferences used across ClientPilot.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex h-[48px] items-center justify-center gap-2 rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Workspace
                </button>

                <div className="flex h-[48px] items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-500 shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#4f46e5]" />
                  Live Supabase data
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-[#5652f4] via-[#4f46e5] to-[#4338ca] p-6 text-white shadow-[0_24px_70px_rgba(79,70,229,0.22)] sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(0,0,0,0.14),transparent_34%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/55">
                  Active Workspace
                </p>

                <h2 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-0.055em]">
                  {settings?.business_name || "Workspace"}
                </h2>

                <p className="mt-4 text-[14px] font-medium leading-7 text-white/70">
                  Your current operating profile for clients, bookings and
                  service management.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <p className="text-[11px] font-semibold text-white/55">
                    Currency
                  </p>

                  <p className="mt-2 truncate text-[22px] font-extrabold tracking-[-0.05em]">
                    {settings?.currency || "Not set"}
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <p className="text-[11px] font-semibold text-white/55">
                    Timezone
                  </p>

                  <p className="mt-2 truncate text-[22px] font-extrabold tracking-[-0.05em]">
                    {settings?.timezone || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
                  Business Profile
                </h2>

                <p className="mt-1 text-[13px] font-medium text-slate-500">
                  These details are stored live in Supabase.
                </p>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex h-[44px] items-center justify-center gap-2 rounded-[16px] bg-[#4f46e5] px-4 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca]"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <div className="flex h-[44px] items-center gap-2 rounded-[16px] border border-indigo-100 bg-indigo-50 px-4 text-[13px] font-bold text-[#4f46e5]">
                  <Clock className="h-4 w-4" />
                  Editing
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="grid gap-3">
                {profileItems.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#4f46e5] ring-1 ring-indigo-100">
                        <Icon className="h-4 w-4" />
                      </div>

                      <p className="text-[13px] font-bold text-slate-500">
                        {label}
                      </p>
                    </div>

                    <p className="break-words text-[14px] font-extrabold text-slate-950 sm:text-right">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Business Name
                    </span>

                    <input
                      value={form.business_name}
                      onChange={(e) =>
                        setForm({ ...form, business_name: e.target.value })
                      }
                      placeholder="Business name"
                      className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Business Type
                    </span>

                    <input
                      value={form.business_type}
                      onChange={(e) =>
                        setForm({ ...form, business_type: e.target.value })
                      }
                      placeholder="Service Business"
                      className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Owner Name
                    </span>

                    <input
                      value={form.owner_name}
                      onChange={(e) =>
                        setForm({ ...form, owner_name: e.target.value })
                      }
                      placeholder="Owner name"
                      className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Currency
                    </span>

                    <select
                      value={form.currency}
                      onChange={(e) =>
                        setForm({ ...form, currency: e.target.value })
                      }
                      className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      {currencyOptions.map((currency) => (
                        <option key={currency.value} value={currency.value}>
                          {currency.symbol} {currency.label} ({currency.value})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Timezone
                    </span>

                    <select
                      value={form.timezone}
                      onChange={(e) =>
                        setForm({ ...form, timezone: e.target.value })
                      }
                      className="h-[50px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-medium outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      {timezoneOptions.map((timezone) => (
                        <option key={timezone} value={timezone}>
                          {timezone}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="flex h-[48px] items-center justify-center gap-2 rounded-[18px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>

                  <button
                    onClick={updateSettings}
                    disabled={saving}
                    className="flex h-[48px] items-center justify-center gap-2 rounded-[18px] bg-[#4f46e5] px-5 text-[13px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-4">
            <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-950">
                    Workspace Health
                  </h3>

                  <p className="mt-1 text-[13px] font-medium text-slate-500">
                    Configuration snapshot.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-[#4f46e5] ring-1 ring-indigo-100">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  ["Business profile", settings?.business_name ? "Ready" : "Missing"],
                  ["Currency", settings?.currency || "Not set"],
                  ["Timezone", settings?.timezone || "Not set"],
                  ["Owner", settings?.owner_name || "Not set"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-[13px] font-bold text-slate-500">
                      {label}
                    </p>

                    <p className="max-w-[170px] truncate text-[15px] font-extrabold text-slate-950">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] bg-slate-950 p-5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
              <div className="absolute right-[-80px] top-[-80px] h-[200px] w-[200px] rounded-full bg-[#4f46e5]/40 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">
                      ClientPilot System
                    </p>

                    <h3 className="mt-1.5 text-[22px] font-extrabold tracking-[-0.045em]">
                      Preferences
                    </h3>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Globe2 className="h-4 w-4" />
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl">
                  <p className="text-[24px] font-extrabold tracking-[-0.05em]">
                    {settings?.currency || "USD"} ·{" "}
                    {settings?.timezone || "Asia/Karachi"}
                  </p>

                  <p className="mt-2 text-[13px] font-medium leading-6 text-white/55">
                    These defaults control how prices and appointment times are
                    displayed across your workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}