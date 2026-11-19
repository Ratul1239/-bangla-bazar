export function normalizePhone(raw: string) {
  let digits = raw.replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit))).replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(2);
  return digits;
}
