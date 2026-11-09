import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { MasterManager } from "@/components/master-manager";
import { createDivision, updateDivision, deleteDivision } from "./actions";

export default async function DivisionsPage() {
  await requireAdmin();

  const rows = await prisma.division.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { movements: true } } },
  });

  const items = rows.map((d) => ({
    id: Number(d.id),
    name: d.name,
    meta: `${d._count.movements} transaksi`,
  }));

  return (
    <>
      <PageHeader title="Divisi" subtitle="Kelola divisi tujuan outbound." />
      <MasterManager
        items={items}
        entityLabel="Divisi"
        placeholder="Nama divisi baru…"
        actions={{
          create: createDivision,
          update: updateDivision,
          remove: deleteDivision,
        }}
      />
    </>
  );
}
