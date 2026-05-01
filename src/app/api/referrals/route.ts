import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const referrals = await prisma.referral.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(referrals);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { referrerEmail, refereeEmail, reward, status } = body;

  if (!referrerEmail) {
    return NextResponse.json(
      { error: "Referrer email is required" },
      { status: 400 }
    );
  }

  // Generate unique code
  let code = "";
  let attempts = 0;
  while (!code && attempts < 10) {
    const candidate = `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const exists = await prisma.referral.findUnique({
      where: { code: candidate },
    });
    if (!exists) code = candidate;
    attempts++;
  }

  if (!code) {
    return NextResponse.json(
      { error: "Failed to generate referral code" },
      { status: 500 }
    );
  }

  const referral = await prisma.referral.create({
    data: {
      referrerEmail,
      refereeEmail: refereeEmail || null,
      code,
      status: status || "PENDING",
      reward: reward ? parseFloat(reward) : 0,
      tenantId: session.user.tenantId,
    },
  });

  return NextResponse.json(referral);
}
