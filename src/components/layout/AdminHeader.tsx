"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function AdminHeader({ title }: { title?: string }) {
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
      <div className="flex items-center gap-3">
        <Shield size={18} className="text-purple-400" />
        <h1 className="text-white font-semibold text-lg">{title}</h1>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/8 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            {(session?.user?.name ?? "A")[0].toUpperCase()}
          </div>
          <span className="text-sm text-gray-300 hidden md:block">{session?.user?.name ?? "Admin"}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-2xl py-1 z-50">
            <div className="px-4 py-3 border-b border-white/8">
              <p className="text-white text-sm font-medium">{session?.user?.name}</p>
              <p className="text-purple-400 text-xs">Platform Admin</p>
            </div>
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
    </header>
  );
}
