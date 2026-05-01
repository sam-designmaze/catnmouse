import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/branding/GlassCard";
import { AdminPageShell } from "@/components/layout/AdminPageShell";
import { Badge } from "@/components/ui/badge";
import { TenantDetailForm } from "./TenantDetailForm";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: { billing: true, _count: { select: { users: true, clients: true, orders: true, invoices: true } } },
  });

  if (!tenant) notFound();

  return (
    <AdminPageShell title={`Tenant: ${tenant.name}`}>
      <div className="max-w-2xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Users", value: tenant._count.users },
            { label: "Clients", value: tenant._count.clients },
            { label: "Orders", value: tenant._count.orders },
            { label: "Invoices", value: tenant._count.invoices },
          ].map((s) => (
            <GlassCard key={s.label} padding="sm">
              <p className="text-gray-400 text-xs mb-1">{s.label}</p>
              <p className="text-white text-xl font-bold">{s.value}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard>
          <TenantDetailForm tenant={tenant} />
        </GlassCard>
      </div>
    </AdminPageShell>
  );
}
