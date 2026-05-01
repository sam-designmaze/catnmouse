import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getTenantFromHeaders } from "@/lib/tenant";
import { TenantProvider } from "@/components/branding/TenantProvider";
import { TenantSidebar } from "@/components/layout/TenantSidebar";
import { SessionWrapper } from "@/components/layout/SessionWrapper";
import { GradientBg } from "@/components/branding/GradientBg";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.accountType !== "TENANT_USER") {
    redirect("/login");
  }

  const tenant = await getTenantFromHeaders();
  if (!tenant) redirect("/login");

  return (
    <SessionWrapper>
      <TenantProvider config={tenant}>
        <div className="flex h-screen overflow-hidden">
          <GradientBg color={tenant.primaryColor} />
          <TenantSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </TenantProvider>
    </SessionWrapper>
  );
}
