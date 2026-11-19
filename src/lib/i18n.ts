export type Language = "bn" | "en";
export const LANGUAGE_COOKIE = "banga_lang";

export function translate(language: Language, bn: string, en: string) {
  return language === "en" ? en : bn;
}

export function formatNumber(value: number, language: Language) {
  return value.toLocaleString(language === "en" ? "en-BD" : "bn-BD");
}

export function formatMoney(value: number, language: Language) {
  const number = formatNumber(value, language);
  return language === "en" ? `৳${number}` : `${number} টাকা`;
}

type ProductText = {
  name: string;
  slug?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  category?: string | null;
  categoryEn?: string | null;
  badge?: string | null;
  badgeEn?: string | null;
};

const seedEnglish: Record<string, { bnName: string; name: string; description: string }> = {
  "premium-cotton-panjabi": {
    bnName: "প্রিমিয়াম কটন পাঞ্জাবি",
    name: "Premium Cotton Panjabi",
    description: "Made from soft, pure cotton, this premium panjabi is perfect for special occasions and everyday wear. Detailed embroidery, a comfortable fit and lasting colour make it a wardrobe favourite.",
  },
  "wireless-headphones-pro": {
    bnName: "ওয়্যারলেস হেডফোন Pro",
    name: "Wireless Headphones Pro",
    description: "Enjoy deep bass, up to 40 hours of battery life, noise cancellation and comfortable ear cushions. A perfect companion for work, study and travel.",
  },
  "classic-stainless-watch": {
    bnName: "ক্লাসিক স্টেইনলেস ওয়াচ",
    name: "Classic Stainless Steel Watch",
    description: "A versatile watch with a stainless steel body and navy dial. Water-resistant and fitted with a reliable quartz movement for everyday style.",
  },
  "cotton-basic-tshirt": {
    bnName: "কটন বেসিক টি-শার্ট",
    name: "Cotton Basic T-Shirt",
    description: "A lightweight, breathable T-shirt made from pure cotton. Its comfortable everyday fit keeps its shape even after repeated washes.",
  },
  "premium-leather-bag": {
    bnName: "প্রিমিয়াম লেদার ব্যাগ",
    name: "Premium Leather Bag",
    description: "A durable genuine-leather messenger bag with room for your laptop, books and essentials. Includes an adjustable strap and multiple compartments.",
  },
  "cozy-knit-sweater": {
    bnName: "কোজি নিট সোয়েটার",
    name: "Cozy Knit Sweater",
    description: "A soft knitted sweater for warmth and comfort on cooler days. Lightweight, durable and easy to pair with your casual favourites.",
  },
};

function seedFor(product: ProductText) {
  if (product.slug && seedEnglish[product.slug]) return seedEnglish[product.slug];
  return Object.values(seedEnglish).find((item) => item.bnName === product.name);
}

export function productName(product: ProductText, language: Language) {
  if (language === "bn") return product.name;
  return product.nameEn?.trim() || seedFor(product)?.name || product.name;
}

export function productDescription(product: ProductText, language: Language) {
  if (language === "bn") return product.description || "";
  return product.descriptionEn?.trim() || seedFor(product)?.description || product.description || "";
}

const categoryTranslations: Record<string, string> = {
  "পোশাক": "Clothing",
  "ইলেকট্রনিক্স": "Electronics",
  "অ্যাক্সেসরিজ": "Accessories",
  "অন্যান্য": "Other",
};
const badgeTranslations: Record<string, string> = {
  "জনপ্রিয়": "Popular",
  "হট সেল": "Hot sale",
  "নতুন": "New",
  "শীতকালীন": "Winter",
};

export function categoryName(category: string, language: Language, categoryEn?: string | null) {
  return language === "en" ? categoryEn?.trim() || categoryTranslations[category] || category : category;
}

export function badgeName(badge: string, language: Language, badgeEn?: string | null) {
  return language === "en" ? badgeEn?.trim() || badgeTranslations[badge] || badge : badge;
}

export function statusName(status: string, language: Language) {
  if (language === "en") return status;
  const statuses: Record<string, string> = {
    Pending: "অপেক্ষমাণ",
    Confirmed: "নিশ্চিত",
    Shipped: "পাঠানো হয়েছে",
    Delivered: "ডেলিভারি সম্পন্ন",
    Cancelled: "বাতিল",
  };
  return statuses[status] || status;
}

export function localizeError(message: unknown, language: Language, fallback: string) {
  if (typeof message !== "string" || !message) return fallback;
  if (language === "bn") return message;
  const errors: Record<string, string> = {
    "নাম লিখুন": "Please enter your name.",
    "সঠিক মোবাইল নম্বর দিন": "Please enter a valid mobile number.",
    "সম্পূর্ণ ঠিকানা লিখুন": "Please enter your complete address.",
    "কার্ট খালি": "Your cart is empty.",
    "অর্ডার তৈরি করা যায়নি": "Could not create your order. Please try again.",
    "পণ্য পাওয়া যায়নি": "Product not found.",
    "কার্টে যোগ করা যায়নি": "Could not add the item to your cart.",
    "অর্ডার আইডি দিন": "Please enter your order ID.",
    "এই অর্ডার আইডি পাওয়া যায়নি": "We couldn't find an order with that ID.",
    "পাসওয়ার্ড সঠিক নয়": "Incorrect password.",
    "নাম, স্লাগ এবং দাম আবশ্যক": "Name, slug and price are required.",
    "পণ্য যোগ করা যায়নি": "Could not add the product.",
  };
  if (errors[message]) return errors[message];
  if (message.includes("স্টকের পরিমাণ কমে গেছে")) {
    const name = message.split(" — ")[0];
    return `${productName({ name }, "en")} — not enough stock available.`;
  }
  return /[\u0980-\u09ff]/.test(message) ? fallback : message;
}
