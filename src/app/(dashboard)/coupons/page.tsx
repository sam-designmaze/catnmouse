import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { CouponsSection } from "./CouponsSection";

export default async function CouponsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const coupons = await prisma.coupon.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell title="Coupons">
      <CouponsSection initialCoupons={coupons} />
    </PageShell>
  );
}
