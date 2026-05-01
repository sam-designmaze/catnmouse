import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const clients = await prisma.client.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <PageShell title="Clients">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{clients.length} total clients</p>
        <Button size="sm"><Plus size={15} />New Client</Button>
      </div>
      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Name", "Email", "Phone", "Orders", "Status", "Joined"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No clients yet</td></tr>
              ) : clients.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{c.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{c.phone ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{c._count.orders}</td>
                  <td className="px-6 py-4"><Badge variant={c.status === "ACTIVE" ? "success" : "neutral"}>{c.status}</Badge></td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageShell>
  );
}
