import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { LanguageProvider } from "@/components/language-provider";
import { LANGUAGE_COOKIE, type Language } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "বাংলা বাজার | Bangla Bazar — Cash on Delivery",
  description: "Shop quality products with cash on delivery across Bangladesh. সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে কেনাকাটা।",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const saved = (await cookies()).get(LANGUAGE_COOKIE)?.value;
  const language: Language = saved === "en" ? "en" : "bn";
  return (
    <html lang={language}>
      <body className="min-h-screen antialiased">
        <LanguageProvider initialLanguage={language}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
