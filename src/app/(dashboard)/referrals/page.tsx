import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { ReferralsSection } from "./ReferralsSection";

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const referrals = await prisma.referral.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell title="Referrals">
      <ReferralsSection initialReferrals={referrals} />
    </PageShell>
  );
}
