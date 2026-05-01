import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.accountType !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [tenantCount, activeCount, totalClients, totalOrders, billings] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
    prisma.client.count(),
    prisma.order.count(),
    prisma.tenantBilling.findMany({ where: { status: "ACTIVE" } }),
  ]);

  const totalMrr = billings.reduce((s, b) => s + b.monthlyRate, 0);

  return NextResponse.json({
    tenantCount,
    activeCount,
    totalClients,
    totalOrders,
    totalMrr,
    arr: totalMrr * 12,
  });
}
