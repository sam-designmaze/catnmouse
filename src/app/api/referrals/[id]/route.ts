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

  const referral = await prisma.referral.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });

  if (!referral) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { referrerEmail, refereeEmail, reward, status } = body;

  const updated = await prisma.referral.update({
    where: { id },
    data: {
      ...(referrerEmail !== undefined && { referrerEmail }),
      ...(refereeEmail !== undefined && { refereeEmail }),
      ...(reward !== undefined && { reward: parseFloat(reward) }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(updated);
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

  const referral = await prisma.referral.findFirst({
    where: { id, tenantId: session.user.tenantId },
  });

  if (!referral) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.referral.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
