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
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  _count: { orders: number };
}

interface ClientsSectionProps {
  initialClients: Client[];
}

export function ClientsSection({ initialClients }: ClientsSectionProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  const { addToast } = useToast();

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setStatus("ACTIVE");
  }

  function populateForm(client: Client) {
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || "");
    setStatus(client.status);
  }

  function openNew() {
    setEditTarget(null);
    resetForm();
    setModalOpen(true);
  }

  function openEdit(client: Client) {
    setEditTarget(client);
    populateForm(client);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editTarget ? "PATCH" : "POST";
      const url = editTarget ? `/api/clients/${editTarget.id}` : "/api/clients";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
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
        setClients((prev) =>
          prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c))
        );
        addToast("Client updated", "success");
      } else {
        setClients((prev) => [{ ...saved, _count: { orders: 0 } }, ...prev]);
        addToast("Client created", "success");
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
      const res = await fetch(`/api/clients/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Cannot delete client", "error");
        return;
      }

      setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      addToast("Client deleted", "success");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">{clients.length} total clients</p>
          <Button size="sm" onClick={openNew}>
            <Plus size={15} />
            New Client
          </Button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-500" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Name", "Email", "Phone", "Orders", "Status", "Joined", "Actions"].map(
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
              {filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {search ? "No clients match your search" : "No clients yet"}
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {c.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {c._count.orders}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={c.status === "ACTIVE" ? "success" : "neutral"}
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(c.createdAt)}
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
        title={editTarget ? "Edit Client" : "New Client"}
        description={
          editTarget
            ? "Update client information"
            : "Add a new client to your dashboard"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client-name">Name *</Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Acme Corp"
            />
          </div>

          <div>
            <Label htmlFor="client-email">Email *</Label>
            <Input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="hello@acme.com"
            />
          </div>

          <div>
            <Label htmlFor="client-phone">Phone</Label>
            <Input
              id="client-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
            />
          </div>

          <div>
            <Label htmlFor="client-status">Status</Label>
            <select
              id="client-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
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
                : "Create client"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete client?"
      >
        <p className="text-gray-400 text-sm mb-6">
          "{deleteTarget?.name}" will be permanently deleted. This cannot be undone.
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
