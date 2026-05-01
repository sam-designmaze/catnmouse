import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { AdminPageShell } from "@/components/layout/AdminPageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, TrendingUp, Building2, AlertCircle } from "lucide-react";

const billingStatusVariant: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  ACTIVE: "success", PAST_DUE: "danger", TRIAL: "info", CANCELLED: "neutral",
};

const planVariant: Record<string, "purple" | "info" | "neutral"> = {
  ENTERPRISE: "purple", PRO: "info", STARTER: "neutral",
};

const planRates: Record<string, number> = { STARTER: 99, PRO: 199, ENTERPRISE: 499 };

export default async function AdminBillingPage() {
  const billings = await prisma.tenantBilling.findMany({
    include: { tenant: true },
    orderBy: { createdAt: "desc" },
  });

  const totalMrr = billings
    .filter((b) => b.status === "ACTIVE")
    .reduce((s, b) => s + b.monthlyRate, 0);

  const activeCount = billings.filter((b) => b.status === "ACTIVE").length;
  const pastDueCount = billings.filter((b) => b.status === "PAST_DUE").length;

  return (
    <AdminPageShell title="Billing">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total MRR", value: formatCurrency(totalMrr), icon: DollarSign, color: "green" },
          { label: "Active", value: activeCount, icon: TrendingUp, color: "cyan" },
          { label: "Tenants", value: billings.length, icon: Building2, color: "purple" },
          { label: "Past Due", value: pastDueCount, icon: AlertCircle, color: "red" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{s.label}</p>
                  <p className="text-white text-2xl font-bold">{s.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <Icon size={20} className="text-purple-400" />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard padding="none">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-white font-semibold">Tenant Billing</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Tenant", "Plan", "Monthly Rate", "Status", "Next Billing", "Last Payment", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {billings.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No billing records</td></tr>
              ) : billings.map((b) => (
                <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: b.tenant.primaryColor }}>
                        {b.tenant.name[0]}
                      </div>
                      <span className="text-sm font-medium text-white">{b.tenant.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant={planVariant[b.plan] ?? "neutral"}>{b.plan}</Badge></td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{formatCurrency(b.monthlyRate)}/mo</td>
                  <td className="px-6 py-4"><Badge variant={billingStatusVariant[b.status] ?? "neutral"}>{b.status}</Badge></td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(b.nextBillingDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{b.lastPaymentDate ? formatDate(b.lastPaymentDate) : "—"}</td>
                  <td className="px-6 py-4">
                    <a href={`/admin/billing/${b.tenantId}`}>
                      <Button size="sm" variant="ghost">Edit</Button>
                    </a>
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
