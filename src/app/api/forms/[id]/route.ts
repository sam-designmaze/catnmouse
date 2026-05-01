import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const form = await prisma.form.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });

  if (!form) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name, fields, active } = body;

  const updated = await prisma.form.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(fields !== undefined && { fields: JSON.stringify(fields) }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json({
    ...updated,
    fields: JSON.parse(updated.fields),
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const form = await prisma.form.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });

  if (!form) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.form.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
