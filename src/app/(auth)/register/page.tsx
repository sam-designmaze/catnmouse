"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/branding/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/components/branding/TenantProvider";
import { UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const tenant = useTenant();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }

    await signIn("tenant-credentials", {
      email,
      password,
      tenantSubdomain:
        process.env.NEXT_PUBLIC_DEFAULT_TENANT_SUBDOMAIN ?? "domainshighway",
      redirect: false,
    });

    router.push("/dashboard");
  }

  return (
    <GlassCard padding="lg">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "var(--tenant-primary)" }}
          >
            {(tenant?.name ?? "W")[0]}
          </div>
          <p className="text-white font-bold text-lg">{tenant?.name ?? "Wayfront"}</p>
        </div>
        <h1 className="text-2xl font-bold text-white">Create an account</h1>
        <p className="text-gray-400 text-sm mt-1">
          Join {tenant?.name ?? "the platform"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          <UserPlus size={18} />
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-[var(--tenant-primary)] hover:underline">
          Sign in
        </a>
      </p>
    </GlassCard>
  );
}
