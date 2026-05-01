import { TenantHeader } from "./TenantHeader";

export function PageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <TenantHeader title={title} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </>
  );
}
