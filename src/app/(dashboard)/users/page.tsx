import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { UsersSection } from "./UsersSection";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.tenantId) {
    return <PageShell title="Users">Access denied</PageShell>;
  }

  const users = await prisma.user.findMany({
    where: { tenantId: session.user.tenantId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell title="Team Members">
      <UsersSection initialUsers={users} currentUserId={session.user.id} />
    </PageShell>
  );
}
