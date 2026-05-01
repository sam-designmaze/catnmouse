import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { ServicesSection } from "./ServicesSection";

export default async function ServicesPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const services = await prisma.service.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <PageShell title="Services">
      <ServicesSection initialServices={services} />
    </PageShell>
  );
}
