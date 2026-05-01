import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const statusVariant: Record<string, "success" | "info" | "warning" | "neutral"> = {
  ACTIVE: "success", TRIAL: "info", INACTIVE: "neutral",
};

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const subs = await prisma.subscription.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell title="Subscriptions">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{subs.length} subscriptions</p>
        <Button size="sm"><Plus size={15} />New Plan</Button>
      </div>
      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Plan Name", "Price", "Interval", "Status", "Created"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No subscriptions yet</td></tr>
              ) : subs.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-white">{formatCurrency(s.price)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{s.interval}</td>
                  <td className="px-6 py-4"><Badge variant={statusVariant[s.status] ?? "neutral"}>{s.status}</Badge></td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageShell>
  );
}
