# 🚀 ওয়েবসাইট লাইভ করার গাইড (বাংলায়)

এই প্রজেক্ট **Next.js + PostgreSQL** দিয়ে তৈরি। লাইভ করতে দুইটা জিনিস লাগবে:

1. **ডাটাবেস** — Neon (ফ্রি) 👉 আপনার পণ্য, অর্ডার, কার্ট থাকবে এখানে
2. **ওয়েবসাইট হোস্টিং** — Vercel (ফ্রি) 👉 Next.js-এর অফিসিয়াল হোস্টিং

মোট খরচ: **০ টাকা** (ফ্রি প্ল্যানে)। সময়: প্রায় ২০–৩০ মিনিট।

---

## ধাপ ১: কোড GitHub-এ তুলুন

Vercel GitHub থেকে কোড নিয়ে অটো-ডিপ্লয় করে।

```bash
# প্রজেক্ট ফোল্ডারে গিয়ে:
git init
git add .
git commit -m "Bangla Bazar online shop"
```

তারপর [github.com](https://github.com) → **New repository** → নাম দিন `bangla-bazar` → Create। এরপর:

```bash
git remote add origin https://github.com/APNAR-USERNAME/bangla-bazar.git
git branch -M main
git push -u origin main
```

> ⚠️ `.env` ফাইল কখনো GitHub-এ তুলবেন না (এতে পাসওয়ার্ড থাকে)।

---

## ধাপ ২: ফ্রি ডাটাবেস বানান (Neon)

1. [neon.tech](https://neon.tech) → **Sign Up** (GitHub দিয়ে লগইন করুন)
2. **New Project** → নাম দিন `bangla-bazar` → Region: **Singapore** (বাংলাদেশ থেকে দ্রুত) → Create
3. ড্যাশবোর্ডে **Connection String** পাবেন, দেখতে এমন:
   ```
   postgresql://user:xxxx@ep-xxx.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require
   ```
4. এটা কপি করে রাখুন — এটাই আপনার `DATABASE_URL`

---

## ধাপ ৩: টেবিল তৈরি করুন (একবারই করতে হয়)

নিজের কম্পিউটারে প্রজেক্ট ফোল্ডারে:

```bash
npm install
DATABASE_URL="এখানে-neon-এর-connection-string" npx drizzle-kit push --force
```

সফল হলে লেখা আসবে `✓ Changes applied`। পণ্যের ডেটা সাইট প্রথমবার চালু হলেই **অটো-সিড** হয়ে যাবে (আলাদা কিছু করতে হবে না)।

---

## ধাপ ৪: Vercel-এ ওয়েবসাইট লাইভ করুন

1. [vercel.com](https://vercel.com) → **Sign Up** (GitHub দিয়ে)
2. **Add New → Project** → `bangla-bazar` রিপো **Import** করুন
3. **Environment Variables** অংশে দুইটা যোগ করুন:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | ধাপ ২-এর connection string |
   | `ADMIN_PASSWORD` | কঠিন একটা পাসওয়ার্ড (যেমন `Bazar#2026!Dhaka`) |

4. **Deploy** চাপুন ☕ ১–২ মিনিট অপেক্ষা করুন
5. অভিনন্দন! 🎉 লাইভ লিংক পেয়ে যাবেন, যেমন:
   ```
   https://bangla-bazar.vercel.app
   ```

---

## ধাপ ৫: যাচাই করুন

- [ ] লিংকে ঢুকে পণ্য দেখা যাচ্ছে?
- [ ] কার্টে পণ্য যোগ + টেস্ট অর্ডার করে দেখুন
- [ ] `/track` পেজে অর্ডার আইডি দিয়ে ট্র্যাক হয়?
- [ ] `/admin` এ গিয়ে `ADMIN_PASSWORD` দিয়ে লগইন হয়?

---

## ❓ সাধারণ প্রশ্ন

**নতুন কোড বদলালে কী করবো?**
শুধু GitHub-এ push করুন — Vercel নিজে নিজে নতুন ভার্সন লাইভ করে দেবে:
```bash
git add . && git commit -m "update" && git push
```

**নিজের ডোমেইন (যেমন banglabazar.com) লাগাতে চাই?**
ডোমেইন কিনে (Namecheap/GoDaddy, বছরে ~১২০০–১৫০০ টাকা) Vercel → Project → **Settings → Domains** → ডোমেইন যোগ করে দেখানো DNS রেকর্ড বসিয়ে দিন।

**Vercel ছাড়া অন্য উপায়?**
[Railway](https://railway.app) — ওয়েবসাইট + ডাটাবেস একসাথে (৫ ডলার ফ্রি ক্রেডিট/মাস)। প্রজেক্ট বানিয়ে GitHub কানেক্ট + PostgreSQL addon + একই ২টা env বসালেই হবে।

**অ্যাডমিন পাসওয়ার্ড ভুলে গেলে?**
Vercel → Project → Settings → Environment Variables → `ADMIN_PASSWORD` বদলে **Redeploy** করুন।
