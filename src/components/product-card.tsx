"use client";

import Link from "next/link";
import type { Product } from "@/db/schema";
import { effectivePrice } from "@/lib/pricing";
import { badgeName, categoryName, productDescription, productName } from "@/lib/i18n";
import { useLanguage } from "./language-provider";
import AddToCartButton from "./add-to-cart-button";

export default function ProductCard({ product }: { product: Product }) {
  const { language, money, number } = useLanguage();
  const price = effectivePrice(product);
  const name = productName(product, language);
  const discount = product.discountPrice ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  return (
    <article className="group surface overflow-hidden shadow-[0_4px_20px_rgba(23,37,29,.04)] transition hover:shadow-[0_16px_40px_rgba(23,37,29,.10)]">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-[#f3efe6]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={name} className="product-img h-full w-full object-cover" />
        {product.badge && <span className="absolute left-3 top-3 rounded-lg bg-[#14563d] px-2.5 py-1 text-[12px] font-bold text-white">{badgeName(product.badge, language, product.badgeEn)}</span>}
        {discount > 0 && <span className="absolute right-3 top-3 rounded-lg bg-[#d99a38] px-2.5 py-1 text-[12px] font-bold text-white">-{number(discount)}%</span>}
      </Link>
      <div className="p-4">
        <p className="mb-1 text-[12px] font-semibold text-[#8a968c]">{categoryName(product.category, language, product.categoryEn)}</p>
        <Link href={`/products/${product.id}`} className="line-clamp-1 text-[17px] font-bold text-[#17251d] hover:text-[#14563d]">{name}</Link>
        <p className="mt-1 line-clamp-2 min-h-[42px] text-[13px] leading-[21px] text-[#78847b]">{productDescription(product, language)}</p>
        <div className="mt-3 flex items-baseline gap-2"><span className="price-tag">{money(price)}</span>{product.discountPrice && <span className="text-[13px] text-[#a7afa8] line-through">{money(product.price)}</span>}</div>
        <div className="mt-3"><AddToCartButton productId={product.id} stock={product.stock} compact /></div>
      </div>
    </article>
  );
}
