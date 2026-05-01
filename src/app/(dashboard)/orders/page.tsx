import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { OrdersSection } from "./OrdersSection";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;

  const [orders, clients, services] = await Promise.all([
    prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: { client: true, service: true },
    }),
    prisma.client.findMany({
      where: { tenantId },
      select: { id: true, name: true, email: true },
    }),
    prisma.service.findMany({
      where: { tenantId },
      select: { id: true, name: true, price: true },
    }),
  ]);

  return (
    <PageShell title="Orders">
      <OrdersSection initialOrders={orders} clients={clients} services={services} />
    </PageShell>
  );
}
