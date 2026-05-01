import { AdminHeader } from "./AdminHeader";

export function AdminPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminHeader title={title} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </>
  );
}
