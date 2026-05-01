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
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface FormField {
  name: string;
  type: string;
  required: boolean;
}

interface Form {
  id: string;
  name: string;
  fields: FormField[];
  active: boolean;
  createdAt: Date;
}

interface FormsSectionProps {
  initialForms: Form[];
}

export function FormsSection({ initialForms }: FormsSectionProps) {
  const [forms, setForms] = useState<Form[]>(initialForms);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Form | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [active, setActive] = useState(true);

  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [fieldRequired, setFieldRequired] = useState(false);

  const { addToast } = useToast();

  function resetForm() {
    setName("");
    setFields([]);
    setActive(true);
    setFieldName("");
    setFieldType("text");
    setFieldRequired(false);
  }

  function populateForm(form: Form) {
    setName(form.name);
    setFields([...form.fields]);
    setActive(form.active);
  }

  function openNew() {
    setEditTarget(null);
    resetForm();
    setModalOpen(true);
  }

  function openEdit(form: Form) {
    setEditTarget(form);
    populateForm(form);
    setModalOpen(true);
  }

  function addField() {
    if (!fieldName) {
      addToast("Field name is required", "error");
      return;
    }

    setFields((prev) => [
      ...prev,
      { name: fieldName, type: fieldType, required: fieldRequired },
    ]);

    setFieldName("");
    setFieldType("text");
    setFieldRequired(false);
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name) {
      addToast("Form name is required", "error");
      return;
    }

    setSaving(true);

    try {
      const method = editTarget ? "PATCH" : "POST";
      const url = editTarget ? `/api/forms/${editTarget.id}` : "/api/forms";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          fields,
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
        setForms((prev) =>
          prev.map((f) => (f.id === saved.id ? { ...f, ...saved } : f))
        );
        addToast("Form updated", "success");
      } else {
        setForms((prev) => [saved, ...prev]);
        addToast("Form created", "success");
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
      const res = await fetch(`/api/forms/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Cannot delete form", "error");
        return;
      }

      setForms((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      addToast("Form deleted", "success");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{forms.length} forms</p>
        <Button size="sm" onClick={openNew}>
          <Plus size={15} />
          New Form
        </Button>
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Name", "Fields", "Status", "Created", "Actions"].map(
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
              {forms.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No forms yet
                  </td>
                </tr>
              ) : (
                forms.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {f.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {f.fields.length} field{f.fields.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={f.active ? "success" : "neutral"}>
                        {f.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(f.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(f)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(f)}
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
        title={editTarget ? "Edit Form" : "New Form"}
        description={
          editTarget ? "Update form details" : "Create a new form"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="form-name">Form Name *</Label>
            <Input
              id="form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contact Form"
            />
          </div>

          <div>
            <Label>Fields ({fields.length})</Label>
            {fields.length > 0 && (
              <div className="space-y-2 mb-4">
                {fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 bg-white/5 rounded-lg px-3 py-2"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {field.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {field.type}
                        {field.required && " (required)"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="text-gray-500 hover:text-gray-300"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 bg-white/3 rounded-lg p-3">
              <div>
                <Label htmlFor="field-name" className="text-xs">
                  Field Name
                </Label>
                <Input
                  id="field-name"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="Email"
                />
              </div>

              <div>
                <Label htmlFor="field-type" className="text-xs">
                  Field Type
                </Label>
                <select
                  id="field-type"
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fieldRequired}
                  onChange={(e) => setFieldRequired(e.target.checked)}
                  className="w-3 h-3 rounded accent-[var(--tenant-primary)]"
                />
                <span className="text-xs text-gray-300">Required</span>
              </label>

              <Button
                type="button"
                size="sm"
                onClick={addField}
                variant="ghost"
              >
                Add Field
              </Button>
            </div>
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
              {saving ? "Saving…" : editTarget ? "Save changes" : "Create form"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete form?"
      >
        <p className="text-gray-400 text-sm mb-6">
          Form "{deleteTarget?.name}" will be permanently deleted. This cannot be undone.
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
