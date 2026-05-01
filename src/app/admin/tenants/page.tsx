import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { AdminPageShell } from "@/components/layout/AdminPageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Plus, ExternalLink } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  ACTIVE: "success", SUSPENDED: "warning", CANCELLED: "danger",
};

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm">{tenants.length} tenants on the platform</p>
        </div>
        <Button size="sm" style={{ background: "#a78bfa" }}>
          <Plus size={15} />
          Create Tenant
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Tenants", value: tenants.length },
          { label: "Active", value: tenants.filter((t) => t.status === "ACTIVE").length },
          { label: "Total MRR", value: `$${tenants.reduce((s, t) => s + (t.billing?.monthlyRate ?? 0), 0)}/mo` },
        ].map((stat) => (
          <GlassCard key={stat.label} padding="md">
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-white text-2xl font-bold">{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Tenant", "Subdomain", "Plan", "Users", "Clients", "Orders", "Status", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: t.primaryColor }}
                      >
                        {t.name[0]}
                      </div>
                      <span className="text-sm font-medium text-white">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-400">{t.subdomain}</td>
                  <td className="px-6 py-4">
                    <Badge variant={t.billing?.plan === "ENTERPRISE" ? "purple" : t.billing?.plan === "PRO" ? "info" : "neutral"}>
                      {t.billing?.plan ?? "—"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{t._count.users}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{t._count.clients}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{t._count.orders}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[t.status] ?? "neutral"}>{t.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(t.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a href={`/admin/tenants/${t.id}`}>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </a>
                      <a href={`http://${t.subdomain}.localhost:3000/dashboard`} target="_blank">
                        <Button size="sm" variant="ghost">
                          <ExternalLink size={13} />
                        </Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </AdminPageShell>
  );
}
