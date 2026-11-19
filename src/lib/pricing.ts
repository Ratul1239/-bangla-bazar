export function effectivePrice(product: { price: number; discountPrice: number | null }) {
  return product.discountPrice ?? product.price;
}

export function formatBDT(amount: number) {
  return `${amount.toLocaleString("bn-BD")} টাকা`;
}
