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
  PAID: "success", SENT: "info", DRAFT: "neutral", OVERDUE: "danger",
};

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });

  return (
    <PageShell title="Invoices">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{invoices.length} total invoices</p>
        <Button size="sm"><Plus size={15} />New Invoice</Button>
      </div>
      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Invoice #", "Client", "Amount", "Status", "Due Date", "Created"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No invoices yet</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-white">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{inv.client.name}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{formatCurrency(inv.amount)}</td>
                  <td className="px-6 py-4"><Badge variant={statusVariant[inv.status] ?? "neutral"}>{inv.status}</Badge></td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(inv.dueDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(inv.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageShell>
  );
}
