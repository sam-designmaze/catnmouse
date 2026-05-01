import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const forms = await prisma.form.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(forms);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, fields, active } = body;

  if (!name) {
    return NextResponse.json({ error: "Form name is required" }, { status: 400 });
  }

  const form = await prisma.form.create({
    data: {
      name,
      fields: JSON.stringify(fields || []),
      active: active !== false,
      tenantId: session.user.tenantId,
    },
  });

  return NextResponse.json({
    ...form,
    fields: JSON.parse(form.fields),
  });
}
