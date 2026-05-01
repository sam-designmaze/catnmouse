import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function requireAdmin(session: any) {
  if (!session || session.user?.accountType !== "ADMIN") return false;
  return true;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenants = await prisma.tenant.findMany({
    include: { billing: true, _count: { select: { users: true, clients: true, orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tenants);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, subdomain, primaryColor, platformName } = body;

  if (!name || !subdomain) {
    return NextResponse.json({ error: "name and subdomain required" }, { status: 400 });
  }

  const existing = await prisma.tenant.findUnique({ where: { subdomain } });
  if (existing) return NextResponse.json({ error: "Subdomain already taken" }, { status: 409 });

  const tenant = await prisma.tenant.create({
    data: {
      name,
      subdomain,
      primaryColor: primaryColor ?? "#06b6d4",
      platformName: platformName ?? "Wayfront",
      billing: {
        create: {
          plan: "STARTER",
          monthlyRate: 99,
          status: "TRIAL",
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  return NextResponse.json(tenant, { status: 201 });
}
