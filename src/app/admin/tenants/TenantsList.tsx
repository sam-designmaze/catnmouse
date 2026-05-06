"use client";

import { useState } from "react";
import { GlassCard } from "@/components/branding/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { Plus, ExternalLink } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  CANCELLED: "danger",
};

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  primaryColor: string;
  status: string;
  createdAt: Date;
  billing: {
    plan: string;
    monthlyRate: number;
  } | null;
  _count: {
    users: number;
    clients: number;
    orders: number;
  };
}

interface TenantsListProps {
  tenants: Tenant[];
}

export function TenantsList({ tenants: initialTenants }: TenantsListProps) {
  const [tenants, setTenants] = useState(initialTenants);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#06b6d4");
  const [platformName, setPlatformName] = useState("Wayfront");
  const { addToast } = useToast();

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !subdomain) {
      addToast("Name and subdomain are required", "error");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subdomain,
          primaryColor,
          platformName,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        addToast(error.error || "Failed to create tenant", "error");
        return;
      }

      const created = await res.json();
      setTenants((prev) => [created, ...prev]);
      addToast("Tenant created successfully!", "success");
      setModalOpen(false);
      setName("");
      setSubdomain("");
      setPrimaryColor("#06b6d4");
      setPlatformName("Wayfront");
    } catch (error) {
      addToast("Failed to create tenant", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm">
            {tenants.length} tenants on the platform
          </p>
        </div>
        <Button
          size="sm"
          style={{ background: "#a78bfa" }}
          onClick={() => setModalOpen(true)}
        >
          <Plus size={15} />
          Create Tenant
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Tenants", value: tenants.length },
          {
            label: "Active",
            value: tenants.filter((t) => t.status === "ACTIVE").length,
          },
          {
            label: "Total MRR",
            value: `$${tenants.reduce(
              (s, t) => s + (t.billing?.monthlyRate ?? 0),
              0
            )}/mo`,
          },
        ].map((stat) => (
          <GlassCard key={stat.label} padding="md">
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-white text-2xl font-bold">{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {[
                  "Tenant",
                  "Subdomain",
                  "Plan",
                  "Users",
                  "Clients",
                  "Orders",
                  "Status",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: t.primaryColor }}
                      >
                        {t.name[0]}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {t.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-400">
                    {t.subdomain}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        t.billing?.plan === "ENTERPRISE"
                          ? "purple"
                          : t.billing?.plan === "PRO"
                          ? "info"
                          : "neutral"
                      }
                    >
                      {t.billing?.plan ?? "—"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {t._count.users}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {t._count.clients}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {t._count.orders}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[t.status] ?? "neutral"}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatDate(t.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a href={`/admin/tenants/${t.id}`}>
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                      </a>
                      <a
                        href={`http://${t.subdomain}.localhost:3000/dashboard`}
                        target="_blank"
                      >
                        <Button size="sm" variant="ghost">
                          <ExternalLink size={13} />
                        </Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Create Tenant Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Tenant"
        description="Add a new tenant to the platform"
      >
        <form onSubmit={handleCreateTenant} className="space-y-4">
          <div>
            <Label htmlFor="tenant-name">Tenant Name *</Label>
            <Input
              id="tenant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Acme Corp"
            />
          </div>

          <div>
            <Label htmlFor="tenant-subdomain">Subdomain *</Label>
            <Input
              id="tenant-subdomain"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
              required
              placeholder="acmecorp"
              pattern="[a-z0-9]+"
              title="Only lowercase letters and numbers"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: {subdomain || "subdomain"}.localhost:3000
            </p>
          </div>

          <div>
            <Label htmlFor="tenant-color">Brand Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="tenant-color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/15"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#06b6d4"
                className="font-mono flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tenant-platform">Platform Name</Label>
            <Input
              id="tenant-platform"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="Wayfront"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Tenant"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
