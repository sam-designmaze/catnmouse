import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.accountType !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tenantId } = body;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const ownerUser = await prisma.user.findFirst({
    where: { tenantId: tenant.id, role: "OWNER" },
  });

  if (!ownerUser) {
    return NextResponse.json({ error: "No owner user found for this tenant" }, { status: 404 });
  }

  // Return the subdomain URL — the admin would sign in with the owner's credentials
  // In a production system you'd create a time-limited token here
  const redirectUrl = `http://${tenant.subdomain}.localhost:3000/dashboard`;

  return NextResponse.json({
    tenantName: tenant.name,
    subdomain: tenant.subdomain,
    ownerEmail: ownerUser.email,
    redirectUrl,
  });
}
