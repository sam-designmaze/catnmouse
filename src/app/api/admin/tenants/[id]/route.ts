import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function requireAdmin(session: any) {
  return session?.user?.accountType === "ADMIN";
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: { billing: true, _count: { select: { users: true, clients: true, orders: true } } },
  });
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(tenant);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { name, logoUrl, primaryColor, platformName, status } = body;

  const tenant = await prisma.tenant.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
      ...(primaryColor && { primaryColor }),
      ...(platformName && { platformName }),
      ...(status && { status }),
    },
  });

  return NextResponse.json(tenant);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.tenant.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
