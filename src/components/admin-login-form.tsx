"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { localizeError } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

export default function AdminLoginForm() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : t("লগইন ব্যর্থ", "Login failed.")); setLoading(false); }
  }
  return (
    <form onSubmit={submit} className="surface w-full max-w-md p-8">
      <div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf3ec] text-2xl">🔐</div><h1 className="mt-4 text-[26px] font-bold text-[#0c3929]">{t("অ্যাডমিন লগইন", "Admin login")}</h1><p className="muted mt-1 text-[14px]">{t("অর্ডার ও পণ্য ম্যানেজ করতে লগইন করুন", "Sign in to manage orders and products.")}</p></div>
      <div className="mt-7"><label htmlFor="admin-password" className="label-bn">{t("অ্যাডমিন পাসওয়ার্ড", "Admin password")}</label><input id="admin-password" type="password" className="input-bn" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" /></div>
      {error && <p role="alert" className="mt-3 text-[14px] font-semibold text-[#a73333]">⚠ {localizeError(error, language, t("লগইন ব্যর্থ", "Login failed."))}</p>}
      <button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? t("লগইন হচ্ছে...", "Signing in...") : t("লগইন করুন →", "Sign in →")}</button>
      <p className="muted mt-4 text-center text-[12px]">{t("ডেমো পাসওয়ার্ড: codadmin (ADMIN_PASSWORD দিয়ে পরিবর্তনযোগ্য)", "Demo password: codadmin (change via ADMIN_PASSWORD)")}</p>
    </form>
  );
}
