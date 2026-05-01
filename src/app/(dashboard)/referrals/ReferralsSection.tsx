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
import { Plus, Pencil, Trash2, Copy } from "lucide-react";

interface Referral {
  id: string;
  referrerEmail: string;
  refereeEmail: string | null;
  code: string;
  status: string;
  reward: number;
  createdAt: Date;
}

interface ReferralsSectionProps {
  initialReferrals: Referral[];
}

export function ReferralsSection({ initialReferrals }: ReferralsSectionProps) {
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Referral | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Referral | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [referrerEmail, setReferrerEmail] = useState("");
  const [refereeEmail, setRefereeEmail] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [reward, setReward] = useState("");

  const { addToast } = useToast();

  function resetForm() {
    setReferrerEmail("");
    setRefereeEmail("");
    setStatus("PENDING");
    setReward("");
  }

  function populateForm(referral: Referral) {
    setReferrerEmail(referral.referrerEmail);
    setRefereeEmail(referral.refereeEmail || "");
    setStatus(referral.status);
    setReward(referral.reward.toString());
  }

  function openNew() {
    setEditTarget(null);
    resetForm();
    setModalOpen(true);
  }

  function openEdit(referral: Referral) {
    setEditTarget(referral);
    populateForm(referral);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!referrerEmail) {
      addToast("Referrer email is required", "error");
      return;
    }

    setSaving(true);

    try {
      const method = editTarget ? "PATCH" : "POST";
      const url = editTarget
        ? `/api/referrals/${editTarget.id}`
        : "/api/referrals";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerEmail,
          refereeEmail: refereeEmail || null,
          status,
          reward: reward ? parseFloat(reward) : 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Something went wrong", "error");
        return;
      }

      const saved = await res.json();

      if (editTarget) {
        setReferrals((prev) =>
          prev.map((r) => (r.id === saved.id ? { ...r, ...saved } : r))
        );
        addToast("Referral updated", "success");
      } else {
        setReferrals((prev) => [saved, ...prev]);
        addToast("Referral created", "success");
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
      const res = await fetch(`/api/referrals/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Cannot delete referral", "error");
        return;
      }

      setReferrals((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      addToast("Referral deleted", "success");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    addToast("Copied to clipboard", "success");
  }

  const statusVariant: Record<string, "success" | "info" | "warning" | "neutral"> = {
    PENDING: "warning",
    CONVERTED: "info",
    REWARDED: "success",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{referrals.length} referrals</p>
        <Button size="sm" onClick={openNew}>
          <Plus size={15} />
          New Referral
        </Button>
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Code", "Referrer", "Referee", "Status", "Reward", "Created", "Actions"].map(
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
              {referrals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No referrals yet
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-white">
                      <div className="flex items-center gap-2">
                        {r.code}
                        <button
                          onClick={() => copyToClipboard(r.code)}
                          className="text-gray-500 hover:text-gray-300"
                          title="Copy code"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {r.referrerEmail}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {r.refereeEmail ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[r.status] ?? "neutral"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {r.reward > 0 ? `$${r.reward}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(r)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(r)}
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
        title={editTarget ? "Edit Referral" : "New Referral"}
        description={
          editTarget
            ? "Update referral details"
            : "Create a new referral record"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ref-email">Referrer Email *</Label>
            <Input
              id="ref-email"
              type="email"
              value={referrerEmail}
              onChange={(e) => setReferrerEmail(e.target.value)}
              required
              placeholder="referrer@example.com"
            />
          </div>

          <div>
            <Label htmlFor="ref-referee">Referred Email (optional)</Label>
            <Input
              id="ref-referee"
              type="email"
              value={refereeEmail}
              onChange={(e) => setRefereeEmail(e.target.value)}
              placeholder="referee@example.com"
            />
          </div>

          <div>
            <Label htmlFor="ref-status">Status</Label>
            <select
              id="ref-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="PENDING">Pending</option>
              <option value="CONVERTED">Converted</option>
              <option value="REWARDED">Rewarded</option>
            </select>
          </div>

          <div>
            <Label htmlFor="ref-reward">Reward Amount (optional)</Label>
            <Input
              id="ref-reward"
              type="number"
              min="0"
              step="0.01"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="0.00"
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
              {saving
                ? "Saving…"
                : editTarget
                ? "Save changes"
                : "Create referral"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete referral?"
      >
        <p className="text-gray-400 text-sm mb-6">
          Referral code "{deleteTarget?.code}" will be permanently deleted. This cannot be undone.
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
