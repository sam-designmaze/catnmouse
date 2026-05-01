import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { ClientsSection } from "./ClientsSection";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const clients = await prisma.client.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <PageShell title="Clients">
      <ClientsSection initialClients={clients} />
    </PageShell>
  );
}
