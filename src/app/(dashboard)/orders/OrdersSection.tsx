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

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  clientId: string;
  serviceId: string | null;
  client: { id: string; name: string; email: string };
  service: { id: string; name: string } | null;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

interface OrdersSectionProps {
  initialOrders: Order[];
  clients: Client[];
  services: Service[];
}

export function OrdersSection({
  initialOrders,
  clients,
  services,
}: OrdersSectionProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [totalAmount, setTotalAmount] = useState("");

  const { addToast } = useToast();

  function resetForm() {
    setOrderNumber("");
    setClientId("");
    setServiceId("");
    setStatus("PENDING");
    setTotalAmount("");
  }

  function populateForm(order: Order) {
    setOrderNumber(order.orderNumber);
    setClientId(order.clientId);
    setServiceId(order.serviceId || "");
    setStatus(order.status);
    setTotalAmount(order.totalAmount.toString());
  }

  function openNew() {
    setEditTarget(null);
    resetForm();
    setModalOpen(true);
  }

  function openEdit(order: Order) {
    setEditTarget(order);
    populateForm(order);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!orderNumber || !clientId) {
      addToast("Order number and client are required", "error");
      return;
    }

    const parsedAmount = parseFloat(totalAmount || "0");
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      addToast("Total amount must be a valid number", "error");
      return;
    }

    setSaving(true);

    try {
      const method = editTarget ? "PATCH" : "POST";
      const url = editTarget
        ? `/api/orders/${editTarget.id}`
        : "/api/orders";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          clientId,
          serviceId: serviceId || null,
          status,
          totalAmount: parsedAmount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Something went wrong", "error");
        return;
      }

      const saved = await res.json();

      if (editTarget) {
        setOrders((prev) =>
          prev.map((o) => (o.id === saved.id ? { ...o, ...saved } : o))
        );
        addToast("Order updated", "success");
      } else {
        setOrders((prev) => [saved, ...prev]);
        addToast("Order created", "success");
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
      const res = await fetch(`/api/orders/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Cannot delete order", "error");
        return;
      }

      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      addToast("Order deleted", "success");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const orderStatusVariant: Record<string, "success" | "warning" | "neutral"> = {
    COMPLETED: "success",
    PROCESSING: "warning",
    PENDING: "neutral",
    CANCELLED: "neutral",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{orders.length} total orders</p>
        <Button size="sm" onClick={openNew}>
          <Plus size={15} />
          New Order
        </Button>
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Order #", "Client", "Service", "Amount", "Status", "Created", "Actions"].map(
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
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {o.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {o.client.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {o.service?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={orderStatusVariant[o.status] ?? "neutral"}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(o)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(o)}
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
        title={editTarget ? "Edit Order" : "New Order"}
        description={
          editTarget
            ? "Update order details"
            : "Create a new order for a client"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="order-number">Order Number *</Label>
            <Input
              id="order-number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
              placeholder="ORD-001"
            />
          </div>

          <div>
            <Label htmlFor="order-client">Client *</Label>
            <select
              id="order-client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="order-service">Service</Label>
            <select
              id="order-service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="">None</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="order-amount">Total Amount</Label>
            <Input
              id="order-amount"
              type="number"
              min="0"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="order-status">Status</Label>
            <select
              id="order-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
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
                : "Create order"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete order?"
      >
        <p className="text-gray-400 text-sm mb-6">
          Order "{deleteTarget?.orderNumber}" will be permanently deleted. This cannot be undone.
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
