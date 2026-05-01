import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { AdminPageShell } from "@/components/layout/AdminPageShell";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Building2, TrendingUp, TrendingDown, Users, ShoppingCart } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const [tenants, totalOrders, totalClients, recentAnalytics] = await Promise.all([
    prisma.tenant.findMany({
      include: {
        billing: true,
        _count: { select: { clients: true, orders: true, users: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count(),
    prisma.client.count(),
    prisma.tenantAnalytics.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const activeTenants = tenants.filter((t) => t.status === "ACTIVE").length;
  const churnRisk = tenants.filter((t) => t.status === "SUSPENDED" || t.status === "CANCELLED").length;
  const totalMrr = tenants.reduce((s, t) => s + (t.billing?.monthlyRate ?? 0), 0);

  return (
    <AdminPageShell title="Analytics">
      {/* Top stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tenants", value: tenants.length, icon: Building2, trend: "up" },
          { label: "Active Tenants", value: activeTenants, icon: TrendingUp, trend: "up" },
          { label: "Total Clients", value: totalClients, icon: Users, trend: "up" },
          { label: "Total Orders", value: totalOrders, icon: ShoppingCart, trend: "up" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} padding="md">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <Icon size={18} className="text-purple-400" />
                </div>
                {s.trend === "up" ? (
                  <TrendingUp size={14} className="text-green-400" />
                ) : (
                  <TrendingDown size={14} className="text-red-400" />
                )}
              </div>
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className="text-white text-2xl font-bold mt-1">{s.value}</p>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Per-tenant breakdown */}
        <div className="xl:col-span-2">
          <GlassCard padding="none">
            <div className="px-6 py-4 border-b border-white/8">
              <h2 className="text-white font-semibold">Tenant Overview</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {["Tenant", "MRR", "Users", "Clients", "Orders", "Status"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: t.primaryColor }}>
                            {t.name[0]}
                          </div>
                          <span className="text-sm font-medium text-white">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{formatCurrency(t.billing?.monthlyRate ?? 0)}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{t._count.users}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{t._count.clients}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{t._count.orders}</td>
                      <td className="px-6 py-4">
                        <Badge variant={t.status === "ACTIVE" ? "success" : t.status === "SUSPENDED" ? "warning" : "danger"}>
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* MRR summary */}
        <div className="space-y-4">
          <GlassCard>
            <h3 className="text-white font-semibold mb-4">Revenue Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total MRR</span>
                <span className="text-white font-bold">{formatCurrency(totalMrr)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">ARR (projected)</span>
                <span className="text-white font-bold">{formatCurrency(totalMrr * 12)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Avg per tenant</span>
                <span className="text-white font-bold">
                  {tenants.length > 0 ? formatCurrency(totalMrr / tenants.length) : "$0"}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-white font-semibold mb-4">Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Active</span>
                <Badge variant="success">{activeTenants}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Churn Risk</span>
                <Badge variant={churnRisk > 0 ? "warning" : "neutral"}>{churnRisk}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Tracked months</span>
                <span className="text-white text-sm">{recentAnalytics.length}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AdminPageShell>
  );
}
