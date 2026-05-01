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

  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const tenantId = requireTenant(session);

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { invoiceNumber, clientId, amount, dueDate, status } =
    await request.json();

  if (!invoiceNumber || !clientId || amount === undefined) {
    return NextResponse.json(
      { error: "Invoice number, client, and amount are required" },
      { status: 400 }
    );
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, tenantId },
  });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId,
      amount: parseFloat(String(amount)),
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      status: status || "DRAFT",
      tenantId,
    },
    include: { client: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
