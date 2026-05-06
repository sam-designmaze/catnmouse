"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/branding/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  price: number;
  active: boolean;
  createdAt: Date;
  _count: { orders: number };
}

interface ServicesSectionProps {
  initialServices: Service[];
}

export function ServicesSection({ initialServices }: ServicesSectionProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [active, setActive] = useState(true);

  const { addToast } = useToast();

  function resetForm() {
    setName("");
    setDescription("");
    setCategory("General");
    setSubcategory("");
    setPrice("");
    setActive(true);
  }

  function populateForm(service: Service) {
    setName(service.name);
    setDescription(service.description || "");
    setCategory(service.category);
    setSubcategory(service.subcategory || "");
    setPrice(service.price.toString());
    setActive(service.active);
  }

  function openNew() {
    setEditTarget(null);
    resetForm();
    setModalOpen(true);
  }

  function openEdit(service: Service) {
    setEditTarget(service);
    populateForm(service);
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
      const url = editTarget ? `/api/services/${editTarget.id}` : "/api/services";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          category,
          subcategory: subcategory || null,
          price: parsedPrice,
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
        setServices((prev) =>
          prev.map((s) => (s.id === saved.id ? { ...s, ...saved } : s))
        );
        addToast("Service updated", "success");
      } else {
        setServices((prev) => [{ ...saved, _count: { orders: 0 } }, ...prev]);
        addToast("Service created", "success");
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
      const res = await fetch(`/api/services/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Cannot delete service", "error");
        return;
      }

      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      addToast("Service deleted", "success");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{services.length} services</p>
        <Button size="sm" onClick={openNew}>
          <Plus size={15} />
          New Service
        </Button>
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Name", "Category", "Description", "Price", "Orders", "Status", "Actions"].map(
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
              {services.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No services yet
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {s.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <Badge variant="neutral">{s.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                      {s.description ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {formatCurrency(s.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {s._count.orders}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={s.active ? "success" : "neutral"}>
                        {s.active ? "Active" : "Inactive"}
                      </Badge>
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
        title={editTarget ? "Edit Service" : "New Service"}
        description={
          editTarget
            ? "Update service information"
            : "Add a new service to offer your clients"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="service-name">Name *</Label>
            <Input
              id="service-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Web Design"
            />
          </div>

          <div>
            <Label htmlFor="service-description">Description</Label>
            <textarea
              id="service-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Professional web design services..."
              rows={3}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service-category">Category</Label>
              <select
                id="service-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
                style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}
              >
                <option value="General" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>General</option>
                <option value="Software" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>Software</option>
                <option value="Consulting" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>Consulting</option>
                <option value="Design" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>Design</option>
                <option value="Marketing" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>Marketing</option>
                <option value="Support" style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>Support</option>
              </select>
            </div>
            <div>
              <Label htmlFor="service-subcategory">Sub-Category</Label>
              <Input
                id="service-subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g., Web Design, Mobile App"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="service-price">Price *</Label>
            <Input
              id="service-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="99.99"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--tenant-primary)]"
            />
            <span className="text-sm text-gray-300">
              Active (available for orders)
            </span>
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
                : "Create service"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete service?"
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
