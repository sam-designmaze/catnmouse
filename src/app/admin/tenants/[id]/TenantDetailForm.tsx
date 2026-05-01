"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  logoUrl: string | null;
  primaryColor: string;
  platformName: string;
  status: string;
}

export function TenantDetailForm({ tenant }: { tenant: TenantData }) {
  const router = useRouter();
  const [name, setName] = useState(tenant.name);
  const [logoUrl, setLogoUrl] = useState(tenant.logoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor);
  const [platformName, setPlatformName] = useState(tenant.platformName);
  const [status, setStatus] = useState(tenant.status);
  const [saving, setSaving] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/admin/tenants/${tenant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, logoUrl, primaryColor, platformName, status }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  }

  async function handleImpersonate() {
    setImpersonating(true);
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: tenant.id }),
    });
    const data = await res.json();
    if (data.redirectUrl) {
      window.open(data.redirectUrl, "_blank");
    }
    setImpersonating(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-semibold">Edit Tenant</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleImpersonate}
          disabled={impersonating}
        >
          <UserCheck size={15} />
          {impersonating ? "Opening…" : "Impersonate"}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Business name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Subdomain</Label>
            <Input value={tenant.subdomain} disabled className="opacity-50 cursor-not-allowed" />
          </div>
        </div>
        <div>
          <Label>Logo URL</Label>
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Platform name</Label>
            <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
        <div>
          <Label>Accent color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/15"
            />
            <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving} style={{ background: "#a78bfa" }}>
            <Save size={16} />
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {saved && <span className="text-green-400 text-sm">Saved!</span>}
        </div>
      </form>
    </div>
  );
}
