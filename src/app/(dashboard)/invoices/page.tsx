import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { InvoicesSection } from "./InvoicesSection";

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;

  const [invoices, clients, services] = await Promise.all([
    prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
    prisma.client.findMany({
      where: { tenantId },
      select: { id: true, name: true, email: true },
    }),
    prisma.service.findMany({
      where: { tenantId, active: true },
      select: { id: true, name: true, price: true },
    }),
  ]);

  return (
    <PageShell title="Invoices">
      <InvoicesSection initialInvoices={invoices} clients={clients} services={services} />
    </PageShell>
  );
}
