import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "info" | "neutral"> = {
  REWARDED: "success", CONVERTED: "info", PENDING: "warning",
};

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const referrals = await prisma.referral.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });

  return (
    <PageShell title="Referrals">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{referrals.length} referrals</p>
        <Button size="sm"><Plus size={15} />New Referral</Button>
      </div>
      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Code", "Referrer", "Referred", "Status", "Reward", "Date"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No referrals yet</td></tr>
              ) : referrals.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-white">{r.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{r.referrerEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{r.refereeEmail ?? "—"}</td>
                  <td className="px-6 py-4"><Badge variant={statusVariant[r.status] ?? "neutral"}>{r.status}</Badge></td>
                  <td className="px-6 py-4 text-sm text-white">{r.reward > 0 ? `$${r.reward}` : "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageShell>
  );
}
