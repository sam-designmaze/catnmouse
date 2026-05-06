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

  const service = await prisma.service.findFirst({
    where: { id, tenantId },
    include: { _count: { select: { orders: true } } },
  });

  if (!service) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(service);
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

  const service = await prisma.service.findFirst({
    where: { id, tenantId },
  });

  if (!service) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name, description, category, subcategory, price, active } = await request.json();

  const updateData: any = {};
  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description || null;
  if (category !== undefined) updateData.category = category;
  if (subcategory !== undefined) updateData.subcategory = subcategory || null;
  if (price !== undefined) {
    const parsedPrice = parseFloat(String(price));
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: "Price must be a valid positive number" },
        { status: 400 }
      );
    }
    updateData.price = parsedPrice;
  }
  if (active !== undefined) updateData.active = active;

  const updated = await prisma.service.update({
    where: { id },
    data: updateData,
    include: { _count: { select: { orders: true } } },
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

  const service = await prisma.service.findFirst({
    where: { id, tenantId },
  });

  if (!service) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete service with existing orders" },
        { status: 409 }
      );
    }
    throw error;
  }
}
