import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { PageShell } from "@/components/layout/PageShell";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Users, DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;

  const [orderCount, clientCount, invoices, subscriptionCount, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { tenantId } }),
      prisma.client.count({ where: { tenantId } }),
      prisma.invoice.findMany({ where: { tenantId, status: "PAID" }, select: { amount: true } }),
      prisma.subscription.count({ where: { tenantId, status: "ACTIVE" } }),
      prisma.order.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { client: true, service: true },
      }),
    ]);

  const revenue = invoices.reduce((sum, i) => sum + i.amount, 0);

  const stats = [
    { label: "Total Orders", value: orderCount, icon: ShoppingCart, color: "cyan" },
    { label: "Active Clients", value: clientCount, icon: Users, color: "green" },
    { label: "Revenue", value: formatCurrency(revenue), icon: DollarSign, color: "yellow" },
    { label: "Subscriptions", value: subscriptionCount, icon: CreditCard, color: "purple" },
  ];

  const statusVariant: Record<string, "success" | "info" | "warning" | "danger" | "neutral"> = {
    COMPLETED: "success",
    PROCESSING: "info",
    PENDING: "warning",
    CANCELLED: "danger",
  };

  return (
    <PageShell title="Dashboard">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.label} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-white text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--tenant-primary)]/15">
                  <Icon size={20} className="text-[var(--tenant-primary)]" style={{ color: "var(--tenant-primary)" }} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp size={12} className="text-green-400" />
                <span className="text-green-400 text-xs">Live data</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Recent orders */}
      <GlassCard padding="none">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-white font-semibold">Recent Orders</h2>
          <a href="/orders" className="text-[var(--tenant-primary)] text-sm hover:underline" style={{ color: "var(--tenant-primary)" }}>
            View all
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Order #", "Client", "Service", "Status", "Amount"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders yet</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-mono">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{order.client.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{order.service?.name ?? "—"}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[order.status] ?? "neutral"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{formatCurrency(order.totalAmount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageShell>
  );
}
