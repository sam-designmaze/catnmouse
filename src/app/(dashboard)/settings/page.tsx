"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/branding/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/layout/PageShell";
import { useTenant } from "@/components/branding/TenantProvider";
import { Save, Palette } from "lucide-react";

export default function SettingsPage() {
  const tenant = useTenant();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#06b6d4");
  const [platformName, setPlatformName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setLogoUrl(tenant.logoUrl ?? "");
      setPrimaryColor(tenant.primaryColor);
      setPlatformName(tenant.platformName);
    }
  }, [tenant]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    document.documentElement.style.setProperty("--tenant-primary", primaryColor);

    await fetch("/api/tenant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, logoUrl, primaryColor, platformName }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <PageShell title="Settings">
      <div className="max-w-xl">
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--tenant-primary)]/15 flex items-center justify-center" style={{ background: `${primaryColor}25` }}>
              <Palette size={20} style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-white font-semibold">Branding & Identity</h2>
              <p className="text-gray-400 text-sm">Customize how your platform looks to clients</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <Label htmlFor="name">Business name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Domains Highway" />
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
            <div>
              <Label htmlFor="platformName">Platform name (shown in &quot;Powered by&quot;)</Label>
              <Input id="platformName" value={platformName} onChange={(e) => setPlatformName(e.target.value)} placeholder="Wayfront" />
            </div>
            <div>
              <Label htmlFor="primaryColor">Accent color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value);
                    document.documentElement.style.setProperty("--tenant-primary", e.target.value);
                  }}
                  className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/15"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value);
                    document.documentElement.style.setProperty("--tenant-primary", e.target.value);
                  }}
                  placeholder="#06b6d4"
                  className="font-mono"
                />
              </div>
              <div className="mt-2 h-8 rounded-lg" style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}80)` }} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving} size="md">
                <Save size={16} />
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {saved && <span className="text-green-400 text-sm">Saved successfully!</span>}
            </div>
          </form>
        </GlassCard>
      </div>
    </PageShell>
  );
}
