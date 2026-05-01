import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CouponsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const coupons = await prisma.coupon.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });

  return (
    <PageShell title="Coupons">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{coupons.length} coupons</p>
        <Button size="sm"><Plus size={15} />New Coupon</Button>
      </div>
      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Code", "Discount", "Type", "Usage", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No coupons yet</td></tr>
              ) : coupons.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-bold text-white tracking-wider">{c.code}</td>
                  <td className="px-6 py-4 text-sm text-white">{c.type === "PERCENTAGE" ? `${c.discount}%` : `$${c.discount}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{c.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                  <td className="px-6 py-4"><Badge variant={c.active ? "success" : "neutral"}>{c.active ? "Active" : "Inactive"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageShell>
  );
}
