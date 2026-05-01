import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { SessionWrapper } from "@/components/layout/SessionWrapper";
import { GradientBg } from "@/components/branding/GradientBg";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.accountType !== "ADMIN") {
    redirect("/login");
  }

  return (
    <SessionWrapper>
      <div className="flex h-screen overflow-hidden">
        <GradientBg color="#a78bfa" />
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>
    </SessionWrapper>
  );
}
