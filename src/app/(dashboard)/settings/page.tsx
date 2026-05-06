"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/branding/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { PageShell } from "@/components/layout/PageShell";
import { useTenant } from "@/components/branding/TenantProvider";
import { Save, Palette, Unlink, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const tenant = useTenant();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#06b6d4");
  const [platformName, setPlatformName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [gateways, setGateways] = useState<any[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setLogoUrl(tenant.logoUrl ?? "");
      setPrimaryColor(tenant.primaryColor);
      setPlatformName(tenant.platformName);
    }
  }, [tenant]);

  useEffect(() => {
    loadGateways();
  }, []);

  async function loadGateways() {
    setLoadingGateways(true);
    try {
      const res = await fetch("/api/payment-gateways");
      if (res.ok) {
        const data = await res.json();
        setGateways(data);
      }
    } catch (error) {
      console.error("Failed to load gateways:", error);
    } finally {
      setLoadingGateways(false);
    }
  }

  async function handleDisconnect(provider: string) {
    setDisconnecting(provider);
    try {
      const res = await fetch("/api/payment-gateways", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (res.ok) {
        setGateways((prev) => prev.filter((g) => g.provider !== provider));
        addToast(`${provider} disconnected`, "success");
      } else {
        addToast("Failed to disconnect", "error");
      }
    } finally {
      setDisconnecting(null);
    }
  }

  function handleConnectStripe() {
    window.location.href = "/api/payment-gateways/stripe/auth";
  }

  function handleConnectPayPal() {
    window.location.href = "/api/payment-gateways/paypal/auth";
  }

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
      <div className="max-w-2xl space-y-6">
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

        {/* Payment Gateways Section */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
              <CreditCard size={20} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Payment Gateways</h2>
              <p className="text-gray-400 text-sm">Connect payment providers to accept payments</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Stripe */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div>
                <h3 className="text-white font-medium flex items-center gap-2">
                  Stripe
                  {gateways.find((g) => g.provider === "stripe") && (
                    <Badge variant="success">Connected</Badge>
                  )}
                </h3>
                <p className="text-gray-400 text-sm">Accept payments with Stripe</p>
              </div>
              {gateways.find((g) => g.provider === "stripe") ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDisconnect("stripe")}
                  disabled={disconnecting === "stripe"}
                >
                  <Unlink size={14} />
                  {disconnecting === "stripe" ? "Disconnecting…" : "Disconnect"}
                </Button>
              ) : (
                <Button size="sm" onClick={handleConnectStripe}>
                  Connect with Stripe
                </Button>
              )}
            </div>

            {/* PayPal */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div>
                <h3 className="text-white font-medium flex items-center gap-2">
                  PayPal
                  {gateways.find((g) => g.provider === "paypal") && (
                    <Badge variant="success">Connected</Badge>
                  )}
                </h3>
                <p className="text-gray-400 text-sm">Accept payments with PayPal</p>
              </div>
              {gateways.find((g) => g.provider === "paypal") ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDisconnect("paypal")}
                  disabled={disconnecting === "paypal"}
                >
                  <Unlink size={14} />
                  {disconnecting === "paypal" ? "Disconnecting…" : "Disconnect"}
                </Button>
              ) : (
                <Button size="sm" onClick={handleConnectPayPal}>
                  Connect with PayPal
                </Button>
              )}
            </div>
          </div>

          <p className="text-gray-400 text-xs mt-6 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            💡 Click "Connect" to authorize {gateways.length === 0 ? "a payment gateway" : "another gateway"} using OAuth. Your API credentials are securely stored and never shared.
          </p>
        </GlassCard>
      </div>
    </PageShell>
  );
}
