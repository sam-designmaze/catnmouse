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

  const services = await prisma.service.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const tenantId = requireTenant(session);

  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, category, subcategory, price, active } = await request.json();

  if (!name || price === undefined) {
    return NextResponse.json(
      { error: "Name and price are required" },
      { status: 400 }
    );
  }

  const parsedPrice = parseFloat(String(price));
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return NextResponse.json(
      { error: "Price must be a valid positive number" },
      { status: 400 }
    );
  }

  const service = await prisma.service.create({
    data: {
      name,
      description: description || null,
      category: category || "General",
      subcategory: subcategory || null,
      price: parsedPrice,
      active: active ?? true,
      tenantId,
    },
    include: { _count: { select: { orders: true } } },
  });

  return NextResponse.json(service, { status: 201 });
}
