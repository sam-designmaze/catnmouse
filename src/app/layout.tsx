import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getTenantFromHeaders } from "@/lib/tenant";
import { TenantProvider } from "@/components/branding/TenantProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "White-label SaaS Platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantFromHeaders();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={
        tenant?.primaryColor
          ? ({ "--tenant-primary": tenant.primaryColor } as React.CSSProperties)
          : undefined
      }
    >
      <body className="min-h-screen">
        <TenantProvider config={tenant}>{children}</TenantProvider>
      </body>
    </html>
  );
}
