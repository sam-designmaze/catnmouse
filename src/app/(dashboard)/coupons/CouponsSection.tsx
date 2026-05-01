"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/branding/GlassCard";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: Date | null;
  active: boolean;
  createdAt: Date;
}

interface CouponsSectionProps {
  initialCoupons: Coupon[];
}

export function CouponsSection({ initialCoupons }: CouponsSectionProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("PERCENTAGE");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);

  const { addToast } = useToast();

  function resetForm() {
    setCode("");
    setDiscount("");
    setType("PERCENTAGE");
    setUsageLimit("");
    setExpiresAt("");
    setActive(true);
  }

  function populateForm(coupon: Coupon) {
    setCode(coupon.code);
    setDiscount(coupon.discount.toString());
    setType(coupon.type);
    setUsageLimit(coupon.usageLimit?.toString() || "");
    setExpiresAt(
      coupon.expiresAt ? coupon.expiresAt.toISOString().split("T")[0] : ""
    );
    setActive(coupon.active);
  }

  function openNew() {
    setEditTarget(null);
    resetForm();
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditTarget(coupon);
    populateForm(coupon);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!code || discount === "") {
      addToast("Code and discount are required", "error");
      return;
    }

    const parsedDiscount = parseFloat(discount);
    if (isNaN(parsedDiscount) || parsedDiscount < 0) {
      addToast("Discount must be a valid positive number", "error");
      return;
    }

    setSaving(true);

    try {
      const method = editTarget ? "PATCH" : "POST";
      const url = editTarget
        ? `/api/coupons/${editTarget.id}`
        : "/api/coupons";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          discount: parsedDiscount,
          type,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          expiresAt: expiresAt || null,
          active,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Something went wrong", "error");
        return;
      }

      const saved = await res.json();

      if (editTarget) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c))
        );
        addToast("Coupon updated", "success");
      } else {
        setCoupons((prev) => [saved, ...prev]);
        addToast("Coupon created", "success");
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
      const res = await fetch(`/api/coupons/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Cannot delete coupon", "error");
        return;
      }

      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      addToast("Coupon deleted", "success");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const activeVariant: Record<string, "success" | "neutral"> = {
    "true": "success",
    "false": "neutral",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{coupons.length} coupons</p>
        <Button size="sm" onClick={openNew}>
          <Plus size={15} />
          New Coupon
        </Button>
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Code", "Discount", "Type", "Usage", "Expires", "Status", "Actions"].map(
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
              {coupons.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No coupons yet
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-white">
                      {c.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {c.discount}
                      {c.type === "PERCENTAGE" ? "%" : "$"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {c.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {c.usageCount}
                      {c.usageLimit ? ` / ${c.usageLimit}` : " / ∞"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {c.expiresAt ? formatDate(c.expiresAt) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={activeVariant[c.active.toString()]}>
                        {c.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(c)}
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
        title={editTarget ? "Edit Coupon" : "New Coupon"}
        description={
          editTarget
            ? "Update coupon details"
            : "Create a new discount coupon"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="coupon-code">Code *</Label>
            <Input
              id="coupon-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              placeholder="SUMMER20"
            />
          </div>

          <div>
            <Label htmlFor="coupon-discount">Discount *</Label>
            <Input
              id="coupon-discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              required
              placeholder="20"
            />
          </div>

          <div>
            <Label htmlFor="coupon-type">Type</Label>
            <select
              id="coupon-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount ($)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="coupon-limit">Usage Limit (blank = unlimited)</Label>
            <Input
              id="coupon-limit"
              type="number"
              min="1"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="100"
            />
          </div>

          <div>
            <Label htmlFor="coupon-expires">Expiry Date (optional)</Label>
            <Input
              id="coupon-expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--tenant-primary)]"
            />
            <span className="text-sm text-gray-300">Active</span>
          </label>

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
                : "Create coupon"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete coupon?"
      >
        <p className="text-gray-400 text-sm mb-6">
          Coupon "{deleteTarget?.code}" will be permanently deleted. This cannot be undone.
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
