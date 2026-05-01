import { GradientBg } from "@/components/branding/GradientBg";
import { getTenantFromHeaders } from "@/lib/tenant";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantFromHeaders();
  const color = tenant?.primaryColor ?? "#06b6d4";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GradientBg color={color} />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
