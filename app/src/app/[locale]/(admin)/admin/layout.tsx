import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  const [dbUser] = await db
    .select({ role: userTable.role })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  if (!dbUser || dbUser.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
