import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const statusVariant: Record<string, "success" | "info" | "warning" | "danger" | "neutral"> = {
  COMPLETED: "success", PROCESSING: "info", PENDING: "warning", CANCELLED: "danger",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const orders = await prisma.order.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { client: true, service: true },
  });

  return (
    <PageShell title="Orders">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{orders.length} total orders</p>
        <Button size="sm"><Plus size={15} />New Order</Button>
      </div>
      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Order #", "Client", "Service", "Status", "Amount", "Date"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No orders yet</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-white">{o.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{o.client.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{o.service?.name ?? "—"}</td>
                  <td className="px-6 py-4"><Badge variant={statusVariant[o.status] ?? "neutral"}>{o.status}</Badge></td>
                  <td className="px-6 py-4 text-sm text-white">{formatCurrency(o.totalAmount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageShell>
  );
}
