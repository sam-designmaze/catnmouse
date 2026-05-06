import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if form belongs to tenant
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form || form.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const responses = await prisma.formResponse.findMany({
      where: { formId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      responses.map((r) => ({
        id: r.id,
        data: JSON.parse(r.data),
        createdAt: r.createdAt,
      }))
    );
  } catch (error) {
    console.error("Get responses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if form belongs to tenant
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form || form.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Delete all responses for this form
    await prisma.formResponse.deleteMany({
      where: { formId: id },
    });

    return NextResponse.json({ message: "All responses deleted" });
  } catch (error) {
    console.error("Delete responses error:", error);
    return NextResponse.json(
      { error: "Failed to delete responses" },
      { status: 500 }
    );
  }
}
