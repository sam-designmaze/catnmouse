import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/branding/GlassCard";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function FormsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const forms = await prisma.form.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });

  return (
    <PageShell title="Forms">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{forms.length} forms</p>
        <Button size="sm"><Plus size={15} />New Form</Button>
      </div>
      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Name", "Fields", "Status", "Created"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forms.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No forms yet</td></tr>
              ) : forms.map((f) => {
                let fieldCount = 0;
                try { fieldCount = JSON.parse(f.fields).length; } catch { /* ignore */ }
                return (
                  <tr key={f.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{f.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{fieldCount} fields</td>
                    <td className="px-6 py-4"><Badge variant={f.active ? "success" : "neutral"}>{f.active ? "Active" : "Inactive"}</Badge></td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(f.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageShell>
  );
}
