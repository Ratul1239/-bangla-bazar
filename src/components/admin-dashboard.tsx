"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { categoryName, localizeError, productName, statusName } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

export type AdminOrder = {
  id: number; orderCode: string; customerName: string; phone: string; district: string; thana: string;
  address: string; note: string; total: number; subtotal: number; deliveryCharge: number; paymentMethod: string;
  status: string; createdAt: string;
  items: { name: string; nameEn: string | null; quantity: number; price: number }[];
};
export type AdminProduct = {
  id: number; name: string; nameEn: string | null; slug: string; category: string; categoryEn: string | null;
  price: number; discountPrice: number | null; stock: number; imageUrl: string;
};

type Tab = "overview" | "orders" | "products" | "create";

const statuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const emptyForm = { name: "", nameEn: "", slug: "", description: "", descriptionEn: "", category: "পোশাক", categoryEn: "", price: "", discountPrice: "", stock: "10", imageUrl: "/images/tshirt.jpg", badge: "", badgeEn: "" };

function dhakaDay(value: string | Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

export default function AdminDashboard({ orders: initialOrders, products: initialProducts }: { orders: AdminOrder[]; products: AdminProduct[] }) {
  const router = useRouter();
  const { language, t, money, number } = useLanguage();
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState("");
  const [showCreateBusy, setShowCreateBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");

  function flash(message: string) { setToast(message); setTimeout(() => setToast(""), 2200); }

  async function changeStatus(id: number, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) { setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o)); flash(t("অর্ডার স্ট্যাটাস আপডেট হয়েছে", "Order status updated")); }
    else flash(t("স্ট্যাটাস আপডেট করা যায়নি", "Could not update status"));
  }

  async function changeStock(id: number, stock: number) {
    const res = await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stock }) });
    if (res.ok) { const data = await res.json(); setProducts((prev) => prev.map((p) => p.id === id ? data.product : p)); flash(t("স্টক আপডেট হয়েছে", "Stock updated")); }
    else flash(t("স্টক আপডেট করা যায়নি", "Could not update stock"));
  }

  async function createProduct(e: FormEvent) {
    e.preventDefault(); setShowCreateBusy(true);
    try {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, price: Number(form.price), discountPrice: Number(form.discountPrice) || null, stock: Number(form.stock) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(localizeError(data.error, language, t("পণ্য যোগ করা যায়নি", "Could not add the product.")));
      setProducts((prev) => [data.product, ...prev]); setForm(emptyForm); setTab("products"); flash(t("নতুন পণ্য যোগ হয়েছে", "New product added")); router.refresh();
    } catch (error) { flash(error instanceof Error ? error.message : t("পণ্য যোগ করা যায়নি", "Could not add the product.")); }
    finally { setShowCreateBusy(false); }
  }

  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); router.refresh(); }

  function refresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1200);
  }

  function dateTime(value: string) {
    return new Intl.DateTimeFormat(language === "en" ? "en-GB" : "bn-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" }).format(new Date(value));
  }

  const stats = useMemo(() => {
    const today = dhakaDay(new Date());
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const byStatus: Record<string, number> = {};
    for (const s of statuses) byStatus[s] = 0;
    let todayCount = 0;
    let weekCount = 0;
    let revenue = 0;
    for (const o of orders) {
      if (byStatus[o.status] !== undefined) byStatus[o.status] += 1;
      if (dhakaDay(o.createdAt) === today) todayCount += 1;
      if (new Date(o.createdAt).getTime() >= weekAgo) weekCount += 1;
      if (o.status !== "Cancelled") revenue += o.total;
    }
    return { byStatus, todayCount, weekCount, revenue, pending: byStatus.Pending || 0 };
  }, [orders]);

  const lowStock = useMemo(() => [...products].filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock), [products]);

  const topCustomers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; count: number; total: number; district: string }>();
    for (const o of orders) {
      const key = o.phone;
      const prev = map.get(key);
      if (prev) map.set(key, { ...prev, count: prev.count + 1, total: prev.total + o.total });
      else map.set(key, { name: o.customerName, phone: o.phone, count: 1, total: o.total, district: o.district });
    }
    return [...map.values()].sort((a, b) => b.count - a.count || b.total - a.total).slice(0, 5);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (!term) return true;
      return [o.orderCode, o.customerName, o.phone, o.address, o.district, o.thana, ...o.items.map((i) => i.name)].some((f) => f.toLowerCase().includes(term));
    });
  }, [orders, search, statusFilter]);

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => [p.name, p.nameEn ?? "", p.slug, p.category, p.categoryEn ?? ""].some((f) => f.toLowerCase().includes(term)));
  }, [products, productSearch]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: t("ওভারভিউ", "Overview"), icon: "📊" },
    { key: "orders", label: t("অর্ডারসমূহ", "Orders"), icon: "📦" },
    { key: "products", label: t("পণ্য ও স্টক", "Products & stock"), icon: "🏷️" },
    { key: "create", label: t("নতুন পণ্য", "Add product"), icon: "➕" },
  ];

  const maxStatus = Math.max(1, ...Object.values(stats.byStatus));

  return (
    <div className="container-bn py-10 sm:py-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">── {t("কন্ট্রোল প্যানেল", "Control panel")}</span>
          <h1 className="section-title mt-2">{t("অ্যাডমিন ড্যাশবোর্ড", "Admin dashboard")}</h1>
          <p className="muted mt-1 text-[14px]">{t("কয়টা অর্ডার পড়লো, কে অর্ডার করলো — সব এক জায়গায় দেখুন।", "See how many orders came in and who placed them — all in one place.")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={refresh} disabled={refreshing} className="btn-ghost !py-2.5 !text-[14px]">
            {refreshing ? t("রিফ্রেশ হচ্ছে...", "Refreshing...") : `↻ ${t("রিফ্রেশ", "Refresh")}`}
          </button>
          <button onClick={logout} className="btn-ghost !py-2.5 !text-[14px]">🚪 {t("লগআউট", "Sign out")}</button>
        </div>
      </div>

      {stats.pending > 0 && (
        <button onClick={() => { setTab("orders"); setStatusFilter("Pending"); }} className="mt-6 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#e8b64c] bg-[#fff6e3] px-5 py-4 text-left transition hover:bg-[#fff0d1]">
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d99a38] text-xl text-white">⏳</span>
            <span>
              <span className="block text-[16px] font-bold text-[#7a4d08]">{t(`${number(stats.pending)}টি অর্ডার কনফার্মের অপেক্ষায়`, `${number(stats.pending)} order${stats.pending > 1 ? "s" : ""} waiting for confirmation`)}</span>
              <span className="block text-[13px] text-[#96703a]">{t("কাস্টমারকে কল করে দ্রুত কনফার্ম করুন", "Call the customer and confirm quickly")}</span>
            </span>
          </span>
          <span className="text-[14px] font-bold text-[#7a4d08]">{t("দেখুন →", "View →")}</span>
        </button>
      )}

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: t("মোট অর্ডার", "Total orders"), value: number(orders.length), sub: t(`গত ৭ দিনে ${number(stats.weekCount)}টি`, `${number(stats.weekCount)} in last 7 days`), icon: "📦", bg: "bg-[#eaf3ec]" },
          { label: t("পেন্ডিং অর্ডার", "Pending orders"), value: number(stats.pending), sub: t("কল করে কনফার্ম করুন", "Call to confirm"), icon: "⏳", bg: stats.pending > 0 ? "bg-[#fff1d2]" : "bg-[#eaf3ec]" },
          { label: t("আজকের অর্ডার", "Today's orders"), value: number(stats.todayCount), sub: t("ঢাকা সময় অনুযায়ী", "Dhaka time"), icon: "🆕", bg: "bg-[#e6eefc]" },
          { label: t("মোট বিক্রয়", "Total revenue"), value: money(stats.revenue), sub: t("বাতিল ছাড়া", "Excluding cancelled"), icon: "💰", bg: "bg-[#fbf2e4]" },
        ].map((kpi) => (
          <div key={kpi.label} className="surface p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] font-semibold text-[#7c887f] sm:text-[13px]">{kpi.label}</p>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${kpi.bg}`}>{kpi.icon}</span>
            </div>
            <p className="mt-2 truncate text-[20px] font-bold text-[#14563d] sm:text-[26px]">{kpi.value}</p>
            <p className="mt-0.5 text-[11px] text-[#9aa59c] sm:text-[12px]">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-[#e2ded3] sm:gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-[14px] font-bold transition sm:px-5 sm:text-[15px] ${tab === item.key ? "border-[#14563d] text-[#14563d]" : "border-transparent text-[#7c887f] hover:text-[#14563d]"}`}
          >
            <span>{item.icon}</span> {item.label}
            {item.key === "orders" && stats.pending > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d99a38] px-1 text-[11px] font-bold text-white">{number(stats.pending)}</span>
            )}
          </button>
        ))}
      </div>

      {/* ============ OVERVIEW ============ */}
      {tab === "overview" && (
        <div className="mt-6 space-y-6">
          {/* Status breakdown */}
          <section className="surface p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[18px] font-bold text-[#0c3929]">📈 {t("অর্ডার স্ট্যাটাস", "Order status breakdown")}</h2>
              <button onClick={() => setTab("orders")} className="text-[14px] font-bold text-[#14563d] hover:underline">{t("সব অর্ডার দেখুন →", "View all orders →")}</button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {statuses.map((s) => (
                <button key={s} onClick={() => { setTab("orders"); setStatusFilter(s); }} className="rounded-xl border border-[#eeeae0] bg-[#fbfaf6] p-3.5 text-left transition hover:border-[#14563d]">
                  <span className={`status-pill status-${s}`}>{statusName(s, language)}</span>
                  <p className="mt-2 text-[22px] font-bold text-[#0c3929]">{number(stats.byStatus[s] || 0)}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eeeae0]">
                    <div className="h-full rounded-full bg-[#14563d]" style={{ width: `${Math.round(((stats.byStatus[s] || 0) / maxStatus) * 100)}%` }} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Latest orders — who ordered */}
            <section className="surface p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[18px] font-bold text-[#0c3929]">🆕 {t("সাম্প্রতিক অর্ডার — কে অর্ডার করলো", "Latest orders — who ordered")}</h2>
              </div>
              {orders.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-[#859087]">{t("এখনো কোনো অর্ডার আসেনি।", "No orders yet.")}</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#eeeae0] p-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf3ec] text-[16px] font-bold text-[#14563d]">
                        {o.customerName.trim().charAt(0) || "?"}
                      </span>
                      <div className="min-w-[140px] flex-1">
                        <p className="text-[15px] font-bold">{o.customerName}</p>
                        <p className="font-en text-[12px] text-[#7c887f]">📞 {o.phone} · {o.district}</p>
                      </div>
                      <div className="text-right">
                        <Link href={`/track/${o.orderCode}`} className="font-en text-[13px] font-bold text-[#14563d] hover:underline">#{o.orderCode}</Link>
                        <p className="text-[13px] font-bold">{money(o.total)}</p>
                      </div>
                      <span className={`status-pill status-${o.status}`}>{statusName(o.status, language)}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setTab("orders")} className="btn-ghost mt-4 w-full !py-2.5 !text-[14px]">{t("সব অর্ডার দেখুন", "View all orders")} →</button>
            </section>

            {/* Pending call list */}
            <section className="surface border-2 border-[#f0d48a] p-5 sm:p-6">
              <h2 className="text-[18px] font-bold text-[#0c3929]">📞 {t("কল করতে হবে (পেন্ডিং)", "Need a call (pending)")}</h2>
              {stats.pending === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-4xl">✅</div>
                  <p className="mt-2 text-[15px] font-bold text-[#1a7139]">{t("সব অর্ডার কনফার্ম করা হয়েছে!", "All orders confirmed!")}</p>
                </div>
              ) : (
                <div className="mt-4 max-h-[380px] space-y-3 overflow-y-auto">
                  {orders.filter((o) => o.status === "Pending").slice(0, 8).map((o) => (
                    <div key={o.id} className="rounded-xl bg-[#fff9ec] p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-bold">{o.customerName}</p>
                          <p className="font-en text-[13px] text-[#7c887f]">{o.phone}</p>
                        </div>
                        <a href={`tel:${o.phone}`} className="btn-primary !rounded-lg !px-4 !py-2 !text-[13px]">📞 {t("কল", "Call")}</a>
                      </div>
                      <p className="mt-1.5 truncate text-[13px] text-[#6c7a70]">#{o.orderCode} · {o.address}, {o.district} · {money(o.total)}</p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => changeStatus(o.id, "Confirmed")} className="flex-1 rounded-lg bg-[#14563d] px-3 py-1.5 text-[13px] font-bold text-white hover:bg-[#0c3929]">✓ {t("কনফার্ম", "Confirm")}</button>
                        <button onClick={() => changeStatus(o.id, "Cancelled")} className="flex-1 rounded-lg border border-[#e5b6b6] px-3 py-1.5 text-[13px] font-bold text-[#a73333] hover:bg-[#fdeaea]">✕ {t("বাতিল", "Cancel")}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top customers */}
            <section className="surface p-5 sm:p-6">
              <h2 className="text-[18px] font-bold text-[#0c3929]">⭐ {t("সেরা কাস্টমার", "Top customers")}</h2>
              {topCustomers.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-[#859087]">{t("এখনো কোনো কাস্টমার নেই।", "No customers yet.")}</p>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {topCustomers.map((c, i) => (
                    <div key={c.phone} className="flex items-center gap-3 rounded-xl border border-[#eeeae0] px-3.5 py-2.5">
                      <span className="font-en flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f6f4ee] text-[14px] font-bold text-[#7a6a3a]">{number(i + 1)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold">{c.name}</p>
                        <p className="font-en text-[12px] text-[#7c887f]">{c.phone} · {c.district}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-bold text-[#14563d]">{t(`${number(c.count)}টি অর্ডার`, `${number(c.count)} orders`)}</p>
                        <p className="text-[12px] text-[#7c887f]">{money(c.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Low stock */}
            <section className="surface p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[18px] font-bold text-[#0c3929]">⚠️ {t("স্টক অ্যালার্ট", "Low stock alert")}</h2>
                <button onClick={() => setTab("products")} className="text-[14px] font-bold text-[#14563d] hover:underline">{t("স্টক দেখুন →", "Manage →")}</button>
              </div>
              {lowStock.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-4xl">📦</div>
                  <p className="mt-2 text-[15px] font-bold text-[#1a7139]">{t("সব পণ্যের স্টক ঠিক আছে।", "All products are well stocked.")}</p>
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {lowStock.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl border border-[#eeeae0] px-3.5 py-2.5">
                      <img src={p.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">{productName(p, language)}</p>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${p.stock === 0 ? "bg-[#fdeaea] text-[#a73333]" : "bg-[#fff3d9] text-[#95610b]"}`}>
                        {p.stock === 0 ? t("স্টক শেষ", "Out of stock") : t(`মাত্র ${number(p.stock)}টি`, `Only ${number(p.stock)} left`)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ============ ORDERS ============ */}
      {tab === "orders" && (
        <div className="mt-6">
          <div className="surface flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[220px] flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa59c]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input
                aria-label={t("অর্ডার খুঁজুন", "Search orders")}
                className="input-bn !pl-11"
                placeholder={t("অর্ডার আইডি, নাম বা ফোন দিয়ে খুঁজুন...", "Search by order ID, name or phone...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select aria-label={t("স্ট্যাটাস ফিল্টার", "Filter by status")} className="input-bn w-auto min-w-[150px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">{t("সব স্ট্যাটাস", "All statuses")}</option>
              {statuses.map((s) => <option key={s} value={s}>{statusName(s, language)} ({number(stats.byStatus[s] || 0)})</option>)}
            </select>
          </div>
          <p className="mt-4 text-[14px] text-[#7c887f]">
            {t(`${number(filteredOrders.length)}টি অর্ডার দেখানো হচ্ছে`, `Showing ${number(filteredOrders.length)} orders`)}
            {(search || statusFilter !== "All") && (
              <button onClick={() => { setSearch(""); setStatusFilter("All"); }} className="ml-2 font-bold text-[#a73333] hover:underline">{t("ফিল্টার মুছুন", "Clear")}</button>
            )}
          </p>

          {filteredOrders.length === 0 ? (
            <div className="surface mt-4 py-14 text-center text-[#859087]">{t("কোনো অর্ডার পাওয়া যায়নি।", "No orders found.")}</div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredOrders.map((order) => {
                const expanded = expandedId === order.id;
                return (
                  <article key={order.id} className="surface overflow-hidden">
                    <div className="flex flex-wrap items-center gap-3 p-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf3ec] text-[17px] font-bold text-[#14563d]">
                        {order.customerName.trim().charAt(0) || "?"}
                      </span>
                      <div className="min-w-[150px] flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <Link href={`/track/${order.orderCode}`} className="font-en text-[14px] font-bold text-[#14563d] hover:underline">#{order.orderCode}</Link>
                          <span className="text-[12px] text-[#9aa59c]">{dateTime(order.createdAt)}</span>
                        </div>
                        <p className="mt-0.5 text-[16px] font-bold">{order.customerName}</p>
                        <p className="font-en text-[13px] text-[#7c887f]">📞 {order.phone} · 📍 {order.district}{order.thana ? `, ${order.thana}` : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] text-[#9aa59c]">{t(`${number(order.items.reduce((s, i) => s + i.quantity, 0))}টি পণ্য`, `${number(order.items.reduce((s, i) => s + i.quantity, 0))} items`)}</p>
                        <p className="text-[17px] font-bold text-[#14563d]">{money(order.total)}</p>
                      </div>
                      <select
                        aria-label={t("অর্ডারের অবস্থা পরিবর্তন", "Change order status")}
                        value={order.status}
                        onChange={(e) => changeStatus(order.id, e.target.value)}
                        className={`status-pill status-${order.status} cursor-pointer border-0 !px-3 !py-1.5 !text-[13px] outline-none`}
                      >
                        {statuses.map((s) => <option key={s} value={s}>{statusName(s, language)}</option>)}
                      </select>
                      <button
                        onClick={() => setExpandedId(expanded ? null : order.id)}
                        aria-expanded={expanded}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2ded3] text-[#415347] transition hover:border-[#14563d]"
                      >
                        <span className={`transition ${expanded ? "rotate-180" : ""}`}>▾</span>
                      </button>
                    </div>
                    {expanded && (
                      <div className="grid gap-4 border-t border-[#eeeae0] bg-[#fbfaf6] p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[13px] font-bold text-[#6c7a70]">{t("ডেলিভারি ঠিকানা", "Delivery address")}</p>
                          <p className="mt-1 text-[14px]">{order.address}</p>
                          <p className="text-[13px] text-[#7c887f]">{order.thana ? `${order.thana}, ` : ""}{order.district}</p>
                          {order.note && <p className="mt-2 rounded-lg bg-[#fff6e3] px-3 py-2 text-[13px]">📝 {t("নোট", "Note")}: {order.note}</p>}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <a href={`tel:${order.phone}`} className="btn-primary !rounded-lg !px-4 !py-2 !text-[13px]">📞 {t("কল করুন", "Call customer")}</a>
                            <Link href={`/track/${order.orderCode}`} className="btn-ghost !rounded-lg !px-4 !py-2 !text-[13px]">{t("অর্ডার পেজ", "Order page")} →</Link>
                          </div>
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#6c7a70]">{t("অর্ডারের পণ্য", "Ordered items")}</p>
                          <div className="mt-2 space-y-1.5">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between gap-2 text-[14px]">
                                <span>{productName(item, language)} <span className="text-[#9aa59c]">×{number(item.quantity)}</span></span>
                                <span className="shrink-0 font-semibold">{money(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 space-y-1 border-t border-dashed border-[#e2ded3] pt-2 text-[13px]">
                            <div className="flex justify-between"><span className="muted">{t("সাবটোটাল", "Subtotal")}</span><span>{money(order.subtotal)}</span></div>
                            <div className="flex justify-between"><span className="muted">{t("ডেলিভারি", "Delivery")}</span><span>{money(order.deliveryCharge)}</span></div>
                            <div className="flex justify-between text-[15px] font-bold"><span>{t("মোট (COD)", "Total (COD)")}</span><span className="text-[#14563d]">{money(order.total)}</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============ PRODUCTS ============ */}
      {tab === "products" && (
        <div className="mt-6">
          <div className="surface flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[220px] flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa59c]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input aria-label={t("পণ্য খুঁজুন", "Search products")} className="input-bn !pl-11" placeholder={t("পণ্য খুঁজুন...", "Search products...")} value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            </div>
            <p className="text-[14px] text-[#7c887f]">{t(`${number(filteredProducts.length)}টি পণ্য`, `${number(filteredProducts.length)} products`)}{lowStock.length > 0 && <span className="ml-2 font-bold text-[#a3620a]">⚠️ {t(`${number(lowStock.length)}টি লো-স্টক`, `${number(lowStock.length)} low-stock`)}</span>}</p>
          </div>
          <div className="surface mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[14px]">
              <thead className="bg-[#f6f4ee] text-[13px] text-[#6c7a70]"><tr><th className="p-4">{t("পণ্য", "Product")}</th><th className="p-4">{t("ক্যাটাগরি", "Category")}</th><th className="p-4">{t("দাম", "Price")}</th><th className="p-4">{t("স্টক", "Stock")}</th></tr></thead>
              <tbody className="divide-y divide-[#eeeae0]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={product.stock <= 5 ? "bg-[#fffdf4]" : ""}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={product.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                        <div>
                          <p className="font-semibold">{productName(product, language)}</p>
                          {product.stock === 0 && <span className="mt-0.5 inline-block rounded-full bg-[#fdeaea] px-2 py-0.5 text-[11px] font-bold text-[#a73333]">{t("স্টক শেষ", "Out of stock")}</span>}
                          {product.stock > 0 && product.stock <= 5 && <span className="mt-0.5 inline-block rounded-full bg-[#fff3d9] px-2 py-0.5 text-[11px] font-bold text-[#95610b]">{t("স্টক কম", "Low stock")}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#6c7a70]">{categoryName(product.category, language, product.categoryEn)}</td>
                    <td className="p-4 font-bold">{money(product.discountPrice ?? product.price)}</td>
                    <td className="p-4">
                      <input
                        aria-label={t("স্টক পরিমাণ", "Stock quantity")}
                        type="number" min={0} defaultValue={product.stock} key={`${product.id}-${product.stock}`}
                        onBlur={(e) => { if (Number(e.target.value) !== product.stock) changeStock(product.id, Number(e.target.value)); }}
                        className="input-bn !w-24 !py-2"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && <p className="p-10 text-center text-[#859087]">{t("কোনো পণ্য পাওয়া যায়নি।", "No products found.")}</p>}
          </div>
        </div>
      )}

      {/* ============ CREATE ============ */}
      {tab === "create" && (
        <form onSubmit={createProduct} className="surface mt-6 grid max-w-3xl gap-4 p-6 sm:grid-cols-2">
          <p className="col-span-full mb-1 text-[14px] text-[#6c7a70]">{t("দুই ভাষায় পণ্য দেখাতে বাংলা ও ইংরেজি তথ্য লিখুন। ইংরেজি ঘরগুলো ঐচ্ছিক।", "Provide Bengali and English details to display products in both languages. English fields are optional.")}</p>
          <div><label className="label-bn">{t("পণ্যের নাম (বাংলা) *", "Product name (Bengali) *")}</label><input className="input-bn" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label-bn">{t("পণ্যের নাম (ইংরেজি)", "Product name (English)")}</label><input className="input-bn" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></div>
          <div><label className="label-bn">{t("স্লাগ (ইংরেজি) *", "Slug (English) *")}</label><input className="input-bn" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="new-product" /></div>
          <div><label className="label-bn">{t("ক্যাটাগরি (বাংলা)", "Category (Bengali)")}</label><input className="input-bn" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div><label className="label-bn">{t("ক্যাটাগরি (ইংরেজি)", "Category (English)")}</label><input className="input-bn" value={form.categoryEn} onChange={(e) => setForm({ ...form, categoryEn: e.target.value })} placeholder="Clothing" /></div>
          <div><label className="label-bn">{t("ব্যাজ (বাংলা)", "Badge (Bengali)")}</label><input className="input-bn" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="নতুন" /></div>
          <div><label className="label-bn">{t("ব্যাজ (ইংরেজি)", "Badge (English)")}</label><input className="input-bn" value={form.badgeEn} onChange={(e) => setForm({ ...form, badgeEn: e.target.value })} placeholder="New" /></div>
          <div><label className="label-bn">{t("মূল্য (টাকা) *", "Price (BDT) *")}</label><input className="input-bn" required type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div><label className="label-bn">{t("ডিসকাউন্ট মূল্য", "Discount price")}</label><input className="input-bn" type="number" min={0} value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} /></div>
          <div><label className="label-bn">{t("স্টক", "Stock")}</label><input className="input-bn" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
          <div><label className="label-bn">{t("ছবির পাথ / URL", "Image path / URL")}</label><input className="input-bn" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
          <div><label className="label-bn">{t("বিবরণ (বাংলা)", "Description (Bengali)")}</label><textarea className="input-bn min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label-bn">{t("বিবরণ (ইংরেজি)", "Description (English)")}</label><textarea className="input-bn min-h-24" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} /></div>
          <button className="btn-primary col-span-full" disabled={showCreateBusy}>{showCreateBusy ? t("যোগ করা হচ্ছে...", "Adding...") : t("পণ্য যোগ করুন →", "Add product →")}</button>
        </form>
      )}
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </div>
  );
}
