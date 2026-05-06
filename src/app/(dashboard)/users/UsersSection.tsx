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
import { Plus, Pencil, Trash2, Copy, Eye } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: Date;
}

interface UsersSectionProps {
  initialUsers: User[];
  currentUserId: string;
}

export function UsersSection({ initialUsers, currentUserId }: UsersSectionProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("MEMBER");

  const { addToast } = useToast();

  function resetForm() {
    setEmail("");
    setName("");
    setRole("MEMBER");
    setTempPassword("");
  }

  function populateForm(user: User) {
    setEmail(user.email);
    setName(user.name || "");
    setRole(user.role);
  }

  function openNew() {
    setEditTarget(null);
    resetForm();
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditTarget(user);
    populateForm(user);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !name) {
      addToast("Email and name are required", "error");
      return;
    }

    setSaving(true);

    try {
      if (editTarget) {
        const res = await fetch(`/api/users/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, role }),
        });

        if (!res.ok) {
          const data = await res.json();
          addToast(data.error ?? "Something went wrong", "error");
          return;
        }

        const updated = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
        );
        addToast("User updated", "success");
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, role }),
        });

        if (!res.ok) {
          const data = await res.json();
          addToast(data.error ?? "Something went wrong", "error");
          return;
        }

        const created = await res.json();
        setTempPassword(created.tempPassword);
        setUsers((prev) => [created, ...prev]);
        addToast("User created successfully!", "success");
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
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        addToast(data.error ?? "Cannot delete user", "error");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      addToast("User deleted", "success");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function copyTempPassword() {
    navigator.clipboard.writeText(tempPassword);
    addToast("Temporary password copied to clipboard", "success");
  }

  const roleVariant: Record<string, "success" | "info" | "warning" | "neutral"> = {
    ADMIN: "success",
    MEMBER: "info",
    VIEWER: "neutral",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{users.length} team members</p>
        <Button size="sm" onClick={openNew}>
          <Plus size={15} />
          Invite User
        </Button>
      </div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
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
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users yet
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {u.name?.[0] || "?"}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {u.name || "Unknown"}
                        </span>
                        {u.id === currentUserId && (
                          <span className="text-xs text-gray-500">(You)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={roleVariant[u.role] ?? "neutral"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.id !== currentUserId && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(u)}
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setDeleteTarget(u)}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </>
                        )}
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
        onClose={() => {
          setModalOpen(false);
          setTempPassword("");
        }}
        title={editTarget ? "Edit User" : "Invite User"}
        description={
          editTarget ? "Update user details" : "Add a new team member"
        }
      >
        {tempPassword ? (
          <div className="space-y-4">
            <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg">
              <p className="font-semibold mb-2">User created successfully!</p>
              <p className="text-sm mb-3">
                Share this temporary password with the user:
              </p>
              <div className="flex items-center gap-2 bg-black/30 rounded px-3 py-2">
                <code className="font-mono text-sm flex-1">{tempPassword}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyTempPassword}
                >
                  <Copy size={13} />
                </Button>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setModalOpen(false);
                setTempPassword("");
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="user-name">Name *</Label>
              <Input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
              />
            </div>

            {!editTarget && (
              <div>
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jane@example.com"
                />
              </div>
            )}

            <div>
              <Label htmlFor="user-role">Role</Label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--tenant-primary)] focus:ring-1 focus:ring-[var(--tenant-primary)]/50 transition-all"
              >
                <option value="VIEWER">Viewer (Read-only)</option>
                <option value="MEMBER">Member (Edit)</option>
                <option value="ADMIN">Admin (Full access)</option>
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
                  : "Invite user"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove user?"
      >
        <p className="text-gray-400 text-sm mb-6">
          User "{deleteTarget?.name}" will be removed from your team. They can no
          longer access your account.
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
            {deleting ? "Removing…" : "Remove user"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
