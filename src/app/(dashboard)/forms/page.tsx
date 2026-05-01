import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { FormsSection } from "./FormsSection";

export default async function FormsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = session!.user.tenantId!;
  const forms = await prisma.form.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  const parsedForms = forms.map((f) => ({
    ...f,
    fields: (() => {
      try {
        return JSON.parse(f.fields);
      } catch {
        return [];
      }
    })(),
  }));

  return (
    <PageShell title="Forms">
      <FormsSection initialForms={parsedForms} />
    </PageShell>
  );
}
