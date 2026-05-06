import { prisma } from "@/lib/prisma";
import { AdminPageShell } from "@/components/layout/AdminPageShell";
import { TenantsList } from "./TenantsList";

export default async function AdminTenantsPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      billing: true,
      _count: { select: { users: true, clients: true, orders: true } },
    },
  });

  return (
    <AdminPageShell title="Tenants">
      <TenantsList tenants={tenants} />
    </AdminPageShell>
  );
}
