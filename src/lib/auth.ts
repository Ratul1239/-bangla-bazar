import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "banga_admin";

export function adminToken() {
  const password = process.env.ADMIN_PASSWORD ?? "codadmin";
  return createHash("sha256").update(`banga-bazar:${password}`).digest("hex");
}

export async function isAdmin() {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === adminToken();
}

export function isAdminRequest(request: Request) {
  const raw = request.headers.get("cookie") ?? "";
  const match = raw
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`));
  return match?.slice(ADMIN_COOKIE.length + 1) === adminToken();
}
