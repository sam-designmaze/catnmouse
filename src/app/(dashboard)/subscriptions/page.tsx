import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { SubscriptionsSection } from "./SubscriptionsSection";

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const subscriptions = await prisma.subscription.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell title="Subscriptions">
      <SubscriptionsSection initialSubscriptions={subscriptions} />
    </PageShell>
  );
}
