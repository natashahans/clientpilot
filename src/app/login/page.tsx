"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
      <div className="w-full max-w-md rounded-[36px] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7FF5F]">
            ClientPilot
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>

          <p className="mt-3 text-sm text-white/40">
            {isLogin
              ? "Login to access your business dashboard."
              : "Create your ClientPilot workspace account."}
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/30"
          />
        </div>

        <button
          onClick={handleAuth}
          className="mt-6 w-full rounded-full bg-[#D7FF5F] py-3 text-sm font-bold text-black transition hover:bg-[#c8f24f]"
        >
          {isLogin ? "Login" : "Create Account"}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 w-full text-sm text-white/50 transition hover:text-white"
        >
          {isLogin
            ? "Need an account? Sign up"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}