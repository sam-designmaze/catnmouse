import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getTenantFromHeaders } from "@/lib/tenant";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get tenant from subdomain
  const tenant = await getTenantFromHeaders();
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // Try to find by ID first
  let form = await prisma.form.findFirst({
    where: { id, tenantId: tenant.id, active: true },
  });

  // If not found by ID, try to find by name (slug match)
  if (!form) {
    form = await prisma.form.findFirst({
      where: {
        tenantId: tenant.id,
        active: true,
        name: {
          contains: id.replace(/^form-/, "").replace(/-/g, " "),
        },
      },
    });
  }

  if (!form) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...form,
    fields: JSON.parse(form.fields),
  });
}

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
