"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, CreditCard, BarChart3, Settings, Shield } from "lucide-react";

const navItems = [
  { href: "/admin/tenants", label: "Tenants", icon: Building2 },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen flex flex-col shrink-0 border-r border-white/8 bg-[#0a0e27]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Wayfront Admin</p>
          <p className="text-purple-400 text-xs">Platform Control</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-3 mb-2">
          Management
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-purple-500/18 text-purple-300"
                      : "text-gray-400 hover:text-white hover:bg-white/6"
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-5 py-4 border-t border-white/8">
        <p className="text-xs text-gray-600">Wayfront Platform <span className="text-gray-500">v1.0</span></p>
      </div>
    </aside>
  );
}
