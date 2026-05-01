import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getTenantBySubdomain } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const headersList = await headers();
  const subdomain =
    headersList.get("x-tenant-subdomain") ??
    process.env.NEXT_PUBLIC_DEFAULT_TENANT_SUBDOMAIN ??
    "domainshighway";

  const tenant = await getTenantBySubdomain(subdomain);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const existing = await prisma.user.findFirst({ where: { email, tenantId: tenant.id } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, tenantId: tenant.id },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
