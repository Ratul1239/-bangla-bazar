import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import AdminLoginForm from "@/components/admin-login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="container-bn flex min-h-[70vh] items-center justify-center py-14">
      <AdminLoginForm />
    </div>
  );
}
