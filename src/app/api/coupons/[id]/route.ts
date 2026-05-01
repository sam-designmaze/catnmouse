import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireTenant(session: any): string | null {
  if (!session || !session.user?.tenantId) return null;
  return session.user.tenantId;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const tenantId = requireTenant(session);

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const coupon = await prisma.coupon.findFirst({
    where: { id, tenantId },
  });

  if (!coupon) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(coupon);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const tenantId = requireTenant(session);

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const coupon = await prisma.coupon.findFirst({
    where: { id, tenantId },
  });

  if (!coupon) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { code, discount, type, usageLimit, expiresAt, active } =
    await request.json();

  const updateData: any = {};
  if (code) updateData.code = code;
  if (discount !== undefined) updateData.discount = parseFloat(String(discount));
  if (type) updateData.type = type;
  if (usageLimit !== undefined)
    updateData.usageLimit = usageLimit ? parseInt(String(usageLimit)) : null;
  if (expiresAt !== undefined)
    updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (active !== undefined) updateData.active = active;

  const updated = await prisma.coupon.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const tenantId = requireTenant(session);

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const coupon = await prisma.coupon.findFirst({
    where: { id, tenantId },
  });

  if (!coupon) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
