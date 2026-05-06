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
import { Plus, Pencil, Trash2, Link as LinkIcon } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
  clientId: string;
  client: { id: string; name: string; email: string };
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

interface InvoicesSectionProps {
  initialInvoices: Invoice[];
  clients: Client[];
  services: Service[];
}

export function InvoicesSection({ initialInvoices, clients, services }: InvoicesSectionProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paymentLinking, setPaymentLinking] = useState<string | null>(null);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [serviceId, setServiceId] = useState("");

  const { addToast } = useToast();

  function resetForm() {
    setInvoiceNumber("");
    setClientId("");
    setAmount("");
    setDueDate("");
    setStatus("DRAFT");
  }

  function populateForm(invoice: Invoice) {
    setInvoiceNumber(invoice.invoiceNumber);
    setClientId(invoice.clientId);
    setAmount(invoice.amount.toString());
    setDueDate(invoice.dueDate.toISOString().split("T")[0]);
    setStatus(invoice.status);
  }

  function openNew() {
    setEditTarget(null);
    resetForm();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split("T")[0]);
    setModalOpen(true);
  }

  function openEdit(invoice: Invoice) {
    setEditTarget(invoice);
    populateForm(invoice);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!invoiceNumber || !clientId || !amount || !dueDate) {
      addToast("All fields are required", "error");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      addToast("Amount must be a valid positive number", "error");
      return;
    }

    setSaving(true);

    try {
      const method = editTarget ? "PATCH" : "POST";
      const url = editTarget
        ? `/api/invoices/${editTarget.id}`
        : "/api/invoices";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          clientId,
          amount: parsedAmount,
          dueDate,
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
        setInvoices((prev) =>
          prev.map((i) => (i.id === saved.id ? { ...i, ...saved } : i))
        );
        addToast("Invoice updated", "success");
      } else {
        setInvoices((prev) => [saved, ...prev]);
        addToast("Invoice created", "success");
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
      const res = await fetch(`/api/invoices/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Cannot delete invoice", "error");
        return;
      }

      setInvoices((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      addToast("Invoice deleted", "success");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleCreatePaymentLink(invoice: Invoice) {
    setPaymentLinking(invoice.id);

    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pay`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Failed to create payment link", "error");
        return;
      }

      const { url } = await res.json();
      await navigator.clipboard.writeText(url);
      addToast("Payment link copied to clipboard", "success");
    } catch (error) {
      addToast("Failed to create payment link", "error");
    } finally {
      setPaymentLinking(null);
    }
  }

  const invoiceStatusVariant: Record<string, "success" | "warning" | "neutral"> = {
    PAID: "success",
    SENT: "neutral",
    OVERDUE: "warning",
    DRAFT: "neutral",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{invoices.length} total invoices</p>
        <Button size="sm" onClick={openNew}>
          <Plus size={15} />
          New Invoice
        </Button>
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Invoice #", "Client", "Amount", "Status", "Due Date", "Created", "Actions"].map(
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
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No invoices yet
                  </td>
                </tr>
              ) : (
                invoices.map((i) => (
                  <tr
                    key={i.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {i.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {i.client.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {formatCurrency(i.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={invoiceStatusVariant[i.status] ?? "neutral"}>
                        {i.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(i.dueDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(i.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {i.status === "DRAFT" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCreatePaymentLink(i)}
                            disabled={paymentLinking === i.id}
                            title="Create payment link for client"
                          >
                            <LinkIcon size={13} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(i)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(i)}
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
        title={editTarget ? "Edit Invoice" : "New Invoice"}
        description={
          editTarget
            ? "Update invoice details"
            : "Create a new invoice"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="invoice-number">Invoice Number *</Label>
            <Input
              id="invoice-number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
              placeholder="INV-001"
            />
          </div>

          <div>
            <Label htmlFor="invoice-client">Client *</Label>
            <select
              id="invoice-client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              style={{
                backgroundColor: '#1f2937',
                borderColor: '#374151',
                color: '#f3f4f6'
              }}
              className="w-full border rounded-xl px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>
                Select a client
              </option>
              {clients.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="invoice-amount">Amount *</Label>
            <Input
              id="invoice-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="invoice-service">Service (Optional)</Label>
            <select
              id="invoice-service"
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                if (e.target.value) {
                  const service = services.find((s) => s.id === e.target.value);
                  if (service) {
                    setAmount(service.price.toString());
                  }
                }
              }}
              style={{
                backgroundColor: '#1f2937',
                borderColor: '#374151',
                color: '#f3f4f6'
              }}
              className="w-full border rounded-xl px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>
                Select a service
              </option>
              {services.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}
                >
                  {s.name} - ${s.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="invoice-duedate">Due Date *</Label>
            <Input
              id="invoice-duedate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="invoice-status">Status</Label>
            <select
              id="invoice-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                backgroundColor: '#1f2937',
                borderColor: '#374151',
                color: '#f3f4f6'
              }}
              className="w-full border rounded-xl px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
            >
              <option value="DRAFT" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>DRAFT</option>
              <option value="SENT" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>SENT</option>
              <option value="PAID" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>PAID</option>
              <option value="OVERDUE" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>OVERDUE</option>
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
                : "Create invoice"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete invoice?"
      >
        <p className="text-gray-400 text-sm mb-6">
          Invoice "{deleteTarget?.invoiceNumber}" will be permanently deleted. This cannot be undone.
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
