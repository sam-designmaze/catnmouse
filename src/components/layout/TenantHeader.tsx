"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, HelpCircle, Search, Sparkles, LogOut, Settings, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function TenantHeader({ title }: { title?: string }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/8 bg-[#0a0e27]/60 backdrop-blur-md shrink-0">
      <h1 className="text-white font-bold text-xl">{title}</h1>

      <div className="flex items-center gap-1">
        {[
          { icon: Search, label: "Search" },
          { icon: Sparkles, label: "AI Assistant" },
          { icon: HelpCircle, label: "Help" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            aria-label={label}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-all"
          >
            <Icon size={18} />
          </button>
        ))}

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-all"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-2" />

        {/* User avatar dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/8 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--tenant-primary)] to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {(session?.user?.name ?? session?.user?.email ?? "U")[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-300 hidden md:block">
              {session?.user?.name ?? session?.user?.email}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl shadow-2xl shadow-black/50 py-1 z-50">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-white text-sm font-medium">{session?.user?.name}</p>
                <p className="text-gray-500 text-xs">{session?.user?.email}</p>
              </div>
              <a
                href="/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/6 transition-all"
              >
                <Settings size={15} />
                Settings
              </a>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
