import { prisma } from "./prisma";
import { headers } from "next/headers";

export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  logoUrl: string | null;
  primaryColor: string;
  platformName: string;
  status: string;
}

export async function getTenantFromHeaders(): Promise<TenantConfig | null> {
  const headersList = await headers();
  const subdomain = headersList.get("x-tenant-subdomain")
    ?? process.env.NEXT_PUBLIC_DEFAULT_TENANT_SUBDOMAIN
    ?? "domainshighway";

  return getTenantBySubdomain(subdomain);
}

export async function getTenantBySubdomain(subdomain: string): Promise<TenantConfig | null> {
  if (!subdomain || subdomain === "localhost" || subdomain === "admin") return null;

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      subdomain: true,
      logoUrl: true,
      primaryColor: true,
      platformName: true,
      status: true,
    },
  });

  return tenant;
}
