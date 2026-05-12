"use client";

import { useEffect, useState } from "react";
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
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    async function redirectLoggedInUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace("/");
      }

      setCheckingAuth(false);
    }

    redirectLoggedInUser();
  }, [router]);

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });

    if (error) {
      setAuthError(error.message);
    }
  }

  async function handleAuth() {
    setAuthError("");
    setAuthMessage("");
    if (!form.email || !form.password) return;

    if (!isLogin && !form.name.trim()) {
      setAuthError("Name is required.");
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      router.replace("/");
    } else {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim(),
            name: form.name.trim(),
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      setAuthMessage(
        "Account created. Please check your email to verify your account."
      );

      setAuthError("");

      setIsLogin(true);
    }
  }

  if (checkingAuth) {
    return (
      <div className="app-bg flex min-h-screen items-center justify-center">
        <div className="app-card px-6 py-4 text-sm font-bold">
          Checking session...
        </div>
      </div>
    );
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

            <button
              onClick={handleGoogleLogin}
              className="app-card mt-10 flex h-14 w-full items-center justify-center gap-3 border app-border text-sm font-bold transition hover:border-[var(--app-accent)] hover:bg-white/[0.06]"
            >
              <span className="text-lg font-black">G</span>
              Continue with Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t app-border" />
              </div>

              <div className="relative flex justify-center">
                <span className="app-bg px-4 text-xs font-bold uppercase tracking-[0.2em] app-muted">
                  Or continue with email
                </span>
              </div>
            </div>

            {authError && (
              <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                {authError}
              </div>
            )}

            {authMessage && (
              <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                {authMessage}
              </div>
            )}
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAuth();
              }}
              className="space-y-5"
            >
              {!isLogin && (
                <label className="block space-y-2">
                  <span className="text-sm font-bold app-muted">Full Name</span>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="app-input h-14 w-full px-4"
                  />
                </label>
              )}
              <label className="block space-y-2">
                <span className="text-sm font-bold app-muted">Email</span>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              <button
                type="submit"
                className="app-button-primary mt-8 flex h-14 w-full items-center justify-center gap-2"
              >
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="app-muted mt-6 w-full text-center text-sm transition hover:text-[var(--app-text)]"
              >
                {isLogin ? "Don’t have an account? " : "Already have an account? "}
                <span className="font-black text-[var(--app-text)]">
                  {isLogin ? "Sign up" : "Login"}
                </span>
              </button>
            </form>
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