"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  Users,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleAuth() {
    if (!form.email || !form.password) return;

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.push("/");
    } else {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Account created. You can now login.");
      setIsLogin(true);
    }
  }

  return (
    <main className="app-bg min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-16 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-accent)] text-sm font-black text-[var(--app-accent-text)]">
                CP
              </div>
              <p className="text-lg font-black tracking-tight">ClientPilot</p>
            </div>

            <div>
              <p className="app-kicker">
                {isLogin ? "Welcome Back" : "Start Workspace"}
              </p>

              <h1 className="mt-3 text-5xl font-black leading-[0.95] tracking-[-0.06em]">
                {isLogin ? "Sign in to your account." : "Create your account."}
              </h1>

              <p className="app-muted mt-5 max-w-sm text-base leading-7">
                {isLogin
                  ? "Access your clients, bookings, services and business dashboard."
                  : "Set up your workspace and start managing service operations."}
              </p>
            </div>

            <div className="mt-10 space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-bold app-muted">Email</span>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="app-input h-14 w-full px-4"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-bold app-muted">Password</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="app-input h-14 w-full px-4"
                />
              </label>
            </div>

            <button
              onClick={handleAuth}
              className="app-button-primary mt-8 flex h-14 w-full items-center justify-center gap-2"
            >
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="app-muted mt-6 w-full text-center text-sm transition hover:text-[var(--app-text)]"
            >
              {isLogin ? "Don’t have an account? " : "Already have an account? "}
              <span className="font-black text-[var(--app-text)]">
                {isLogin ? "Sign up" : "Login"}
              </span>
            </button>
          </div>
        </section>

        <section className="hidden p-5 lg:block">
          <div className="app-shell-bg relative flex h-full overflow-hidden rounded-[42px] border app-border p-10">
            <div className="relative z-10 flex w-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="rounded-full border app-border bg-white/10 px-4 py-2 text-sm app-muted">
                  Service Business CRM
                </div>

                <LockKeyhole className="h-5 w-5 text-[var(--app-accent)]" />
              </div>

              <div>
                <h2 className="max-w-xl text-6xl font-black leading-[0.95] tracking-[-0.065em]">
                  Organize your service business without messy spreadsheets.
                </h2>

                <p className="app-muted mt-6 max-w-md text-base leading-7">
                  ClientPilot helps service businesses manage clients, bookings,
                  offers and workspace settings from one clean dashboard.
                </p>
              </div>

              <div className="app-card p-5">
                <p className="app-muted mb-4 text-sm">What you can manage</p>

                <div className="grid gap-3">
                  {[
                    ["Clients", "Store client details and relationship status", Users],
                    ["Appointments", "Track bookings, times and session status", CalendarDays],
                    ["Analytics", "View simple business activity signals", BarChart3],
                  ].map(([title, description, Icon]) => (
                    <div
                      key={title as string}
                      className="app-card-dark flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="font-bold">{title as string}</p>
                        <p className="app-muted mt-1 text-sm">
                          {description as string}
                        </p>
                      </div>

                      <Icon className="h-5 w-5 text-[var(--app-accent)]" />
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm app-muted">
                  <CheckCircle2 className="h-4 w-4 text-[var(--app-accent)]" />
                  Secure workspace access with Supabase Auth
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}