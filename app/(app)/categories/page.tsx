import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { MasterManager } from "@/components/master-manager";
import { createCategory, updateCategory, deleteCategory } from "./actions";

export default async function CategoriesPage() {
  await requireAdmin();

  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const items = rows.map((c) => ({
    id: Number(c.id),
    name: c.name,
    meta: `${c._count.products} produk`,
  }));

  return (
    <>
      <PageHeader
        title="Kategori"
        subtitle="Kelola kategori produk."
      />
      <MasterManager
        items={items}
        entityLabel="Kategori"
        placeholder="Nama kategori baru…"
        actions={{
          create: createCategory,
          update: updateCategory,
          remove: deleteCategory,
        }}
      />
    </>
  );
}
