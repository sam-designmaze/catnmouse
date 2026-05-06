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

  const gateways = await prisma.paymentGateway.findMany({
    where: { tenantId },
    select: {
      id: true,
      provider: true,
      active: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  return NextResponse.json(gateways);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const tenantId = requireTenant(session);

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { provider } = await request.json();

  if (!provider || !["stripe", "paypal"].includes(provider)) {
    return NextResponse.json(
      { error: "Invalid provider" },
      { status: 400 }
    );
  }

  const gateway = await prisma.paymentGateway.findFirst({
    where: { tenantId, provider },
  });

  if (!gateway) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.paymentGateway.delete({ where: { id: gateway.id } });

  return NextResponse.json({ success: true });
}
