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

  const orders = await prisma.order.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { client: true, service: true },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const tenantId = requireTenant(session);

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderNumber, clientId, serviceId, status, totalAmount } =
    await request.json();

  if (!orderNumber || !clientId) {
    return NextResponse.json(
      { error: "Order number and client are required" },
      { status: 400 }
    );
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, tenantId },
  });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  if (serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, tenantId },
    });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      clientId,
      serviceId: serviceId || null,
      status: status || "PENDING",
      totalAmount: totalAmount || 0,
      tenantId,
    },
    include: { client: true, service: true },
  });

  return NextResponse.json(order, { status: 201 });
}
