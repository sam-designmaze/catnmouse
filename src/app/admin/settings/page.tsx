import { AdminPageShell } from "@/components/layout/AdminPageShell";
import { GlassCard } from "@/components/branding/GlassCard";

export default function AdminSettingsPage() {
  return (
    <AdminPageShell title="Platform Settings">
      <div className="max-w-xl">
        <GlassCard>
          <h2 className="text-white font-semibold mb-2">Platform Configuration</h2>
          <p className="text-gray-400 text-sm mb-6">Configure global platform settings</p>
          <div className="space-y-4 text-sm text-gray-400">
            <div className="flex justify-between py-3 border-b border-white/8">
              <span>Platform Name</span><span className="text-white font-medium">Wayfront</span>
            </div>
            <div className="flex justify-between py-3 border-b border-white/8">
              <span>Version</span><span className="text-white font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between py-3 border-b border-white/8">
              <span>Database</span><span className="text-white font-medium">SQLite</span>
            </div>
            <div className="flex justify-between py-3">
              <span>Auth Provider</span><span className="text-white font-medium">NextAuth v4</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </AdminPageShell>
  );
}
