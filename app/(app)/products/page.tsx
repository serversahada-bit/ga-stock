import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Input, Button } from "@/components/ui";
import { ProductManager, type ProductRow } from "./product-manager";
import type { Prisma } from "@prisma/client";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const search = (q ?? "").trim();

  const where: Prisma.ProductWhereInput = search
    ? {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { category: { name: { contains: search } } },
        ],
      }
    : {};

  const [rows, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { sku: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const products: ProductRow[] = rows.map((p) => ({
    id: Number(p.id),
    sku: p.sku,
    name: p.name,
    unit: p.unit,
    stock: p.stock,
    minStock: p.minStock,
    isActive: p.isActive,
    categoriesId: Number(p.categoriesId),
    categoryName: p.category.name,
  }));

  const cats = categories.map((c) => ({ id: Number(c.id), name: c.name }));

  return (
    <>
      <PageHeader
        title="Produk"
        subtitle="Master barang: SKU, stok, min stok, dan status."
      />

      <form method="GET" className="mb-5 flex flex-wrap items-center gap-2">
        <div className="min-w-[220px] flex-1 sm:max-w-xs">
          <Input
            name="q"
            defaultValue={search}
            placeholder="Cari nama / SKU / kategori…"
          />
        </div>
        <Button type="submit" variant="secondary">
          Cari
        </Button>
        {search ? (
          <a
            href="/products"
            className="focus-ring text-muted rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
          >
            Reset
          </a>
        ) : null}
      </form>

      <ProductManager products={products} categories={cats} />
    </>
  );
}
