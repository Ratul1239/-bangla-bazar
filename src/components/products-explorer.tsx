"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/db/schema";
import { categoryName, productDescription, productName } from "@/lib/i18n";
import { useLanguage } from "./language-provider";
import ProductCard from "./product-card";

export default function ProductsExplorer({ products, categories }: { products: Product[]; categories: string[] }) {
  const { language, t, number } = useLanguage();
  const [category, setCategory] = useState("সব");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const list = useMemo(() => {
    let items = [...products];
    if (category !== "সব") items = items.filter((p) => p.category === category);
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      items = items.filter((p) => [p.name, p.description, p.category, productName(p, "en"), productDescription(p, "en"), categoryName(p.category, "en", p.categoryEn)].some((text) => text.toLowerCase().includes(term)));
    }
    if (sort === "price-asc") items.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    if (sort === "price-desc") items.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    if (sort === "newest") items.sort((a, b) => b.id - a.id);
    return items;
  }, [products, category, search, sort]);

  return (
    <div className="container-bn py-12">
      <span className="eyebrow">── {t("আমাদের সংগ্রহ", "Our collection")}</span>
      <h1 className="section-title mt-2">{t("সকল পণ্য", "All products")}</h1>
      <p className="muted mt-2 text-[15px]">{t("আপনার পছন্দের পণ্য খুঁজে নিন সহজেই", "Find something you love, all in one place.")}</p>
      <div className="mt-9">
        <div className="surface mb-8 flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa59c]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input aria-label={t("পণ্য খুঁজুন", "Search products")} className="input-bn !pl-11" placeholder={t("পণ্য খুঁজুন...", "Search products...")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select aria-label={t("পণ্য সাজান", "Sort products")} className="input-bn w-auto min-w-[150px]" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">{t("জনপ্রিয়", "Featured")}</option><option value="newest">{t("নতুন পণ্য", "Newest")}</option><option value="price-asc">{t("কম দাম আগে", "Price: low to high")}</option><option value="price-desc">{t("বেশি দাম আগে", "Price: high to low")}</option>
          </select>
        </div>
        <div className="mb-7 flex flex-wrap gap-2">
          {["সব", ...categories].map((cat) => <button key={cat} onClick={() => setCategory(cat)} className={`rounded-full border px-4 py-2 text-[14px] font-semibold transition ${category === cat ? "border-[#14563d] bg-[#14563d] text-white" : "border-[#e2ded3] bg-white text-[#4b5c51] hover:border-[#14563d]"}`}>{cat === "সব" ? t("সব", "All") : categoryName(cat, language, products.find((p) => p.category === cat)?.categoryEn)}</button>)}
        </div>
        <p className="mb-4 text-[14px] text-[#7c887f]">{t(`${number(list.length)} টি পণ্য পাওয়া গেছে`, `${number(list.length)} ${list.length === 1 ? "product" : "products"} found`)}</p>
        {list.length > 0 ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="surface py-16 text-center text-[#7c887f]">{t("কোনো পণ্য পাওয়া যায়নি। অন্য কীওয়ার্ড চেষ্টা করুন।", "No products found. Try a different search.")}</div>}
      </div>
    </div>
  );
}
