import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { id: true, name: true, subdomain: true, logoUrl: true, primaryColor: true, platformName: true, status: true },
  });

  return NextResponse.json(tenant);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, logoUrl, primaryColor, platformName } = body;

  const tenant = await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: {
      ...(name && { name }),
      ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
      ...(primaryColor && { primaryColor }),
      ...(platformName && { platformName }),
    },
  });

  return NextResponse.json(tenant);
}
