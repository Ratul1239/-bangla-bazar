import { ADMIN_COOKIE, adminToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (String(password ?? "") !== (process.env.ADMIN_PASSWORD ?? "codadmin")) {
    return Response.json({ error: "পাসওয়ার্ড সঠিক নয়" }, { status: 401 });
  }
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `${ADMIN_COOKIE}=${adminToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      },
    },
  );
}
