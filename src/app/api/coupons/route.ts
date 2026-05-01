import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireTenant(session: any): string | null {
  if (!session || !session.user?.tenantId) return null;
  return session.user.tenantId;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const tenantId = requireTenant(session);

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = await prisma.coupon.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(coupons);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const tenantId = requireTenant(session);

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, discount, type, usageLimit, expiresAt, active } =
    await request.json();

  if (!code || discount === undefined) {
    return NextResponse.json(
      { error: "Code and discount are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.coupon.findFirst({
    where: { code, tenantId },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Coupon code already exists" },
      { status: 409 }
    );
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discount: parseFloat(String(discount)),
      type: type || "PERCENTAGE",
      usageLimit: usageLimit ? parseInt(String(usageLimit)) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active: active ?? true,
      tenantId,
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}
