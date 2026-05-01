"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTenant } from "@/components/branding/TenantProvider";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText,
  CreditCard,
  Tag,
  Share2,
  Briefcase,
  ClipboardList,
  Settings,
} from "lucide-react";

const navSections = [
  {
    label: "Activity",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/orders", label: "Orders", icon: ShoppingCart },
      { href: "/clients", label: "Clients", icon: Users },
    ],
  },
  {
    label: "Billing",
    items: [
      { href: "/invoices", label: "Invoices", icon: FileText },
      { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/coupons", label: "Coupons", icon: Tag },
      { href: "/referrals", label: "Referrals", icon: Share2 },
    ],
  },
  {
    label: "Setup",
    items: [
      { href: "/services", label: "Services", icon: Briefcase },
      { href: "/forms", label: "Forms", icon: ClipboardList },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function TenantSidebar() {
  const pathname = usePathname();
  const tenant = useTenant();

  return (
    <aside className="w-64 h-screen flex flex-col shrink-0 border-r border-white/8 bg-[#0a0e27]/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        {tenant?.logoUrl ? (
          <img src={tenant.logoUrl} alt={tenant.name} className="h-8 w-auto" />
        ) : (
          <>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: "var(--tenant-primary)" }}
            >
              {(tenant?.name ?? "W")[0]}
            </div>
            <span className="text-white font-semibold text-sm truncate">
              {tenant?.name ?? "Dashboard"}
            </span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-3 mb-2">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                        active
                          ? "text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/6"
                      )}
                      style={
                        active
                          ? {
                              background: `color-mix(in srgb, var(--tenant-primary) 18%, transparent)`,
                              color: "var(--tenant-primary)",
                            }
                          : {}
                      }
                    >
                      <Icon size={17} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Powered by */}
      <div className="px-5 py-4 border-t border-white/8">
        <p className="text-xs text-gray-600">
          Powered by{" "}
          <span className="text-gray-500 font-medium">
            {tenant?.platformName ?? "Wayfront"}
          </span>
        </p>
      </div>
    </aside>
  );
}
