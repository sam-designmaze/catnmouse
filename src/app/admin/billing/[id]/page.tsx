"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/branding/GlassCard";
import { AdminPageShell } from "@/components/layout/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CreditCard, ArrowRight } from "lucide-react";

const PLANS = {
  STARTER: { name: "Starter", rate: 99 },
  PRO: { name: "Professional", rate: 199 },
  ENTERPRISE: { name: "Enterprise", rate: 499 },
};

interface BillingData {
  id: string;
  plan: string;
  monthlyRate: number;
  status: string;
  nextBillingDate: string;
  lastPaymentDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  tenant: {
    id: string;
    name: string;
    primaryColor: string;
  };
}

export default function BillingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [tenantId, setTenantId] = useState<string>("");
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setTenantId(id);
    })();
  }, [params]);

  useEffect(() => {
    if (!tenantId) return;

    const fetchBilling = async () => {
      try {
        const res = await fetch(`/api/admin/tenants/${tenantId}`);
        if (!res.ok) throw new Error("Failed to fetch billing");

        const data = await res.json();
        setBilling(data.billing);
        setSelectedPlan(data.billing.plan);
      } catch (error) {
        addToast("Failed to load billing information", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, [tenantId, addToast]);

  async function handleUpgradePlan(plan: string) {
    if (!tenantId) return;
    setUpgrading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, tenantId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create checkout");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      addToast((error as Error).message || "Failed to upgrade plan", "error");
    } finally {
      setUpgrading(false);
    }
  }

  async function handleManagePortal() {
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to open portal");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      addToast((error as Error).message || "Failed to open customer portal", "error");
    }
  }

  if (loading) {
    return (
      <AdminPageShell title="Billing">
        <div className="text-center py-12">
          <p className="text-gray-400">Loading...</p>
        </div>
      </AdminPageShell>
    );
  }

  if (!billing) {
    return (
      <AdminPageShell title="Billing">
        <div className="text-center py-12">
          <p className="text-gray-400">Billing information not found</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title={`Billing: ${billing.tenant.name}`}>
      <div className="max-w-2xl space-y-6">
        {/* Current Plan */}
        <GlassCard>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${billing.tenant.primaryColor}25` }}
              >
                <CreditCard size={20} style={{ color: billing.tenant.primaryColor }} />
              </div>
              <div>
                <h2 className="text-white font-semibold">Current Plan</h2>
                <p className="text-gray-400 text-sm">Manage your subscription</p>
              </div>
            </div>
            <Badge variant="info">{billing.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Plan</p>
              <p className="text-white text-lg font-semibold">
                {PLANS[billing.plan as keyof typeof PLANS]?.name || billing.plan}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Monthly Rate</p>
              <p className="text-white text-lg font-semibold">${billing.monthlyRate}/mo</p>
            </div>
            {billing.lastPaymentDate && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Last Payment</p>
                <p className="text-white text-sm">
                  {new Date(billing.lastPaymentDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-400 text-sm mb-1">Next Billing</p>
              <p className="text-white text-sm">
                {new Date(billing.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {billing.stripeCustomerId && (
            <Button
              variant="ghost"
              onClick={handleManagePortal}
              className="w-full justify-between"
            >
              Manage Subscription
              <ArrowRight size={16} />
            </Button>
          )}
        </GlassCard>

        {/* Upgrade Plans */}
        <div>
          <h3 className="text-white font-semibold mb-4">Upgrade Plan</h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isCurrent = billing.plan === key;
              const isDowngrade =
                Object.keys(PLANS).indexOf(key) <
                Object.keys(PLANS).indexOf(billing.plan);

              return (
                <GlassCard
                  key={key}
                  padding="md"
                  className={isCurrent ? "border border-[var(--tenant-primary)]" : ""}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-semibold">{plan.name}</h4>
                      <p className="text-gray-400 text-sm">${plan.rate}/month</p>
                    </div>
                    <Button
                      onClick={() => handleUpgradePlan(key)}
                      disabled={
                        isCurrent ||
                        isDowngrade ||
                        upgrading ||
                        !billing.stripeCustomerId
                      }
                      size="sm"
                    >
                      {isCurrent ? "Current Plan" : isDowngrade ? "Downgrade" : upgrading ? "Processing..." : "Upgrade"}
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {!billing.stripeCustomerId && (
          <GlassCard>
            <p className="text-gray-400 text-sm mb-3">
              This tenant doesn't have Stripe set up yet. Payment functionality will be available once configured.
            </p>
          </GlassCard>
        )}
      </div>
    </AdminPageShell>
  );
}
