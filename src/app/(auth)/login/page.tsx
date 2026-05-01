"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/branding/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/components/branding/TenantProvider";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const tenant = useTenant();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tenantSubdomain, setTenantSubdomain] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_TENANT_SUBDOMAIN ?? "domainshighway"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn(
      isAdmin ? "admin-credentials" : "tenant-credentials",
      {
        email,
        password,
        tenantSubdomain: isAdmin ? undefined : tenantSubdomain,
        redirect: false,
      }
    );

    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push(isAdmin ? "/admin/tenants" : "/dashboard");
    }
  }

  return (
    <GlassCard padding="lg">
      {/* Logo / Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "var(--tenant-primary)" }}
          >
            {(tenant?.name ?? "W")[0]}
          </div>
          <div className="text-left">
            <p className="text-white font-bold text-lg leading-none">
              {tenant?.name ?? "Wayfront"}
            </p>
            <p className="text-gray-500 text-xs">Powered by {tenant?.platformName ?? "Wayfront"}</p>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
      </div>

      {/* Account type toggle */}
      <div className="flex rounded-xl bg-white/5 p-1 mb-6">
        <button
          type="button"
          onClick={() => setIsAdmin(false)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            !isAdmin
              ? "bg-[var(--tenant-primary)] text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Agency Login
        </button>
        <button
          type="button"
          onClick={() => setIsAdmin(true)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            isAdmin
              ? "bg-purple-500 text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Admin Login
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isAdmin && (
          <div>
            <Label htmlFor="tenant">Tenant/Organization</Label>
            <select
              id="tenant"
              value={tenantSubdomain}
              onChange={(e) => setTenantSubdomain(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]"
            >
              <option value="domainshighway">Domains Highway</option>
              <option value="webflow">WebFlow Agency</option>
              <option value="saasaccel">SaaS Accelerator</option>
            </select>
          </div>
        )}
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
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
          style={
            isAdmin
              ? { background: "#a78bfa" }
              : { background: "var(--tenant-primary)" }
          }
        >
          <LogIn size={18} />
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {!isAdmin && (
        <p className="text-center text-gray-500 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-[var(--tenant-primary)] hover:underline"
          >
            Register
          </a>
        </p>
      )}
    </GlassCard>
  );
}
