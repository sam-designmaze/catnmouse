"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/branding/GlassCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Subscription {
  id: string;
  name: string;
  price: number;
  interval: string;
  status: string;
  createdAt: Date;
}

interface SubscriptionsSectionProps {
  initialSubscriptions: Subscription[];
}

export function SubscriptionsSection({
  initialSubscriptions,
}: SubscriptionsSectionProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    initialSubscriptions
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [interval, setInterval] = useState("MONTHLY");
  const [status, setStatus] = useState("ACTIVE");

  const { addToast } = useToast();

  function resetForm() {
    setName("");
    setPrice("");
    setInterval("MONTHLY");
    setStatus("ACTIVE");
  }

  function populateForm(sub: Subscription) {
    setName(sub.name);
    setPrice(sub.price.toString());
    setInterval(sub.interval);
    setStatus(sub.status);
  }

  function openNew() {
    setEditTarget(null);
    resetForm();
    setModalOpen(true);
  }

  function openEdit(sub: Subscription) {
    setEditTarget(sub);
    populateForm(sub);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !price) {
      addToast("Name and price are required", "error");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      addToast("Price must be a valid positive number", "error");
      return;
    }

    setSaving(true);

    try {
      const method = editTarget ? "PATCH" : "POST";
      const url = editTarget
        ? `/api/subscriptions/${editTarget.id}`
        : "/api/subscriptions";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: parsedPrice,
          interval,
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Something went wrong", "error");
        return;
      }

      const saved = await res.json();

      if (editTarget) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === saved.id ? { ...s, ...saved } : s))
        );
        addToast("Subscription updated", "success");
      } else {
        setSubscriptions((prev) => [saved, ...prev]);
        addToast("Subscription created", "success");
      }

      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/subscriptions/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Cannot delete subscription", "error");
        return;
      }

      setSubscriptions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      addToast("Subscription deleted", "success");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const statusVariant: Record<string, "success" | "warning" | "neutral"> = {
    ACTIVE: "success",
    INACTIVE: "neutral",
    TRIAL: "warning",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{subscriptions.length} plans</p>
        <Button size="sm" onClick={openNew}>
          <Plus size={15} />
          New Plan
        </Button>
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Name", "Price", "Interval", "Status", "Created", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No subscription plans yet
                  </td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {s.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {formatCurrency(s.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {s.interval}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[s.status] ?? "neutral"}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(s)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(s)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Plan" : "New Plan"}
        description={
          editTarget
            ? "Update subscription plan details"
            : "Create a new subscription plan"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="sub-name">Name *</Label>
            <Input
              id="sub-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Premium Plan"
            />
          </div>

          <div>
            <Label htmlFor="sub-price">Price *</Label>
            <Input
              id="sub-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="99.99"
            />
          </div>

          <div>
            <Label htmlFor="sub-interval">Billing Interval</Label>
            <select
              id="sub-interval"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>

          <div>
            <Label htmlFor="sub-status">Status</Label>
            <select
              id="sub-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="TRIAL">TRIAL</option>
            </select>
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
              {saving
                ? "Saving…"
                : editTarget
                ? "Save changes"
                : "Create plan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete plan?"
      >
        <p className="text-gray-400 text-sm mb-6">
          Plan "{deleteTarget?.name}" will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
