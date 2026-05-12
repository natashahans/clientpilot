"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Mail,
  Users,
} from "lucide-react";

function ClientPilotLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#4f46e5] shadow-[0_10px_30px_rgba(79,70,229,0.22)]">
        <div className="absolute left-2 top-2 h-3 w-3 rounded-full border-2 border-white" />
        <div className="absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-white" />
        <div className="absolute left-[17px] top-[17px] h-2 w-2 rounded-full bg-white" />
        <div className="absolute left-[13px] top-[14px] h-[2px] w-[15px] rotate-45 rounded-full bg-white/85" />
        <div className="absolute bottom-[14px] right-[13px] h-[2px] w-[15px] rotate-45 rounded-full bg-white/85" />
      </div>

      <p className="text-[20px] font-extrabold tracking-[-0.04em] text-slate-950">
        ClientPilot
      </p>
    </div>
  );
}

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

    if (error) setAuthError(error.message);
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

      setIsLogin(true);
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 shadow-sm">
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen overflow-x-hidden overflow-y-auto bg-[#f7f8fc] text-slate-950">
      <div className="grid min-h-full lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative flex min-h-full flex-col px-6 py-5 sm:px-10 sm:py-6 lg:px-14 lg:py-5">
          <ClientPilotLogo />

          <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center pb-16 pt-2 sm:pb-20 lg:-mt-10 lg:pb-10">
            <div className="text-center">
              <h1 className="text-[33px] font-extrabold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-[36px]">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>

              <p className="mt-3 text-[14px] leading-7 text-slate-500 sm:text-[14.5px]">
                {isLogin
                  ? "Enter your email and password to access your workspace."
                  : "Create your workspace and start managing clients, services and bookings."}
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-7 flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-[13.5px] font-semibold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-slate-50 sm:mt-8"
            >
              <span className="text-lg font-extrabold text-[#4285F4]">G</span>
              Continue with Google
            </button>

            <div className="relative my-5 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-[#f7f8fc] px-4 text-[13px] font-medium text-slate-400">
                  or continue with email
                </span>
              </div>
            </div>

            {authError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
                {authError}
              </div>
            )}

            {authMessage && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">
                {authMessage}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAuth();
              }}
              className="space-y-4"
            >
              {!isLogin && (
                <label className="block space-y-2">
                  <span className="text-[13px] font-semibold text-slate-800">
                    Full Name
                  </span>

                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-[54px] w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-300 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </label>
              )}

              <label className="block space-y-2">
                <span className="text-[13px] font-semibold text-slate-800">
                  Email
                </span>

                <input
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-[54px] w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-300 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[13px] font-semibold text-slate-800">
                  Password
                </span>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="h-[54px] w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[13.5px] font-medium outline-none transition placeholder:text-slate-300 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>

              <button
                type="submit"
                className="mt-7 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#4f46e5] text-[13.5px] font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4338ca]"
              >
                {isLogin ? "Log In" : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setAuthError("");
                  setAuthMessage("");
                }}
                className="w-full text-center text-[13.5px] font-medium text-slate-500 transition hover:text-slate-900"
              >
                {isLogin
                  ? "Don’t have an account? "
                  : "Already have an account? "}

                <span className="font-bold text-[#4f46e5]">
                  {isLogin ? "Register Now." : "Login"}
                </span>
              </button>
            </form>
          </div>

          <div className="hidden text-[13px] font-medium text-slate-400 sm:block">
            © 2026 ClientPilot
          </div>
        </section>

        <section className="hidden h-full p-5 lg:block xl:p-6">
          <div className="relative flex min-h-[calc(100vh-48px)] overflow-hidden rounded-[30px] bg-gradient-to-br from-[#5652f4] via-[#4f46e5] to-[#4338ca] p-10 text-white shadow-2xl shadow-indigo-500/20 xl:rounded-[34px] xl:p-14">
            <div className="absolute inset-0 overflow-hidden">
              {/* top glow */}
              <div className="absolute left-[-140px] top-[-140px] h-[360px] w-[360px] rounded-full bg-white/[0.045] blur-3xl" />
              {/* bottom glow */}
              <div className="absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-black/[0.12] blur-3xl" />
              {/* center smooth radial */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_58%)]" />
              {/* subtle lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:120px_120px]" />
            </div>

            <div className="relative z-10 flex w-full flex-col justify-center">
              <div className="absolute right-0 top-0">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-white/75 backdrop-blur-sm">
                  Service CRM
                </div>
              </div>

              <div className="mx-auto w-full max-w-[650px]">
                <h2 className="max-w-[500px] text-[34px] font-extrabold leading-[1.03] tracking-[-0.055em] xl:text-[40px]">
                  Effortlessly manage your clients and bookings.
                </h2>

                <p className="mt-5 max-w-[470px] text-[14px] font-medium leading-7 text-white/68 xl:text-[15px] xl:leading-8">
                  Access your CRM dashboard, manage appointments, track revenue
                  and keep your service business organized from one clean
                  workspace.
                </p>

                <div className="mt-8 rounded-[28px] border border-white/15 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.28)] xl:mt-10 xl:rounded-[30px]">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 xl:rounded-[24px] xl:p-5">
                    <div className="mb-4 flex items-center justify-between xl:mb-5">
                      <div>
                        <p className="text-[13px] font-extrabold text-slate-950">
                          Business Overview
                        </p>
                        <p className="mt-1 text-[11.5px] font-medium text-slate-400">
                          Live workspace snapshot
                        </p>
                      </div>

                      <div className="rounded-full bg-indigo-50 px-3 py-1 text-[11.5px] font-bold text-[#4f46e5]">
                        This month
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        ["Clients", "248", Users],
                        ["Bookings", "86", CalendarDays],
                        ["Revenue", "$12.4k", BarChart3],
                      ].map(([label, value, Icon]) => (
                        <div
                          key={label as string}
                          className="rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm xl:p-4"
                        >
                          <Icon className="h-4 w-4 text-[#4f46e5]" />

                          <p className="mt-3 text-[11.5px] font-semibold text-slate-400 xl:mt-4">
                            {label as string}
                          </p>

                          <p className="mt-1 text-[22px] font-extrabold tracking-[-0.04em] text-slate-950 xl:text-[24px]">
                            {value as string}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-[13px] font-extrabold text-slate-950">
                          Upcoming appointments
                        </p>

                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>

                      <div className="space-y-3">
                        {[
                          ["10:30 AM", "Hair Consultation"],
                          ["12:00 PM", "Body Wax"],
                          ["02:45 PM", "Skin Checkup"],
                        ].map(([time, service]) => (
                          <div
                            key={service}
                            className="flex items-center justify-between rounded-[16px] bg-slate-50 px-3 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 shadow-inner">
                                <Mail className="h-3.5 w-3.5 text-[#4f46e5]" />
                              </div>

                              <p className="text-[13px] font-bold text-slate-800">
                                {service}
                              </p>
                            </div>

                            <p className="text-[12px] font-bold text-slate-400">
                              {time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}