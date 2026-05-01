import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function ServicesPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const services = await prisma.service.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <PageShell title="Services">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{services.length} services</p>
        <Button size="sm"><Plus size={15} />New Service</Button>
      </div>
      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Name", "Description", "Price", "Orders", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No services yet</td></tr>
              ) : services.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{s.description ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-white">{formatCurrency(s.price)}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{s._count.orders}</td>
                  <td className="px-6 py-4"><Badge variant={s.active ? "success" : "neutral"}>{s.active ? "Active" : "Inactive"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageShell>
  );
}
