import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { TxManager, type TxRow } from "@/components/tx-manager";
import { formatDateTime } from "@/lib/format";
import { createOutbound, deleteOutbound } from "./actions";

export default async function OutboundPage() {
  await requireAdmin();

  const [products, divisions, rows] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.division.findMany({ orderBy: { name: "asc" } }),
    prisma.stockMovement.findMany({
      where: { type: "OUTBOUND" },
      include: { product: true, division: true },
      orderBy: { occurredAt: "desc" },
      take: 30,
    }),
  ]);

  const history: TxRow[] = rows.map((r) => ({
    id: Number(r.id),
    productName: r.product?.name ?? "-",
    divisionName: r.division?.name ?? null,
    qty: r.qty,
    note: r.note,
    occurredAt: formatDateTime(r.occurredAt),
  }));

  return (
    <>
      <PageHeader
        title="Outbound"
        subtitle="Barang keluar → stok berkurang + histori per divisi."
      />
      <TxManager
        kind="OUTBOUND"
        products={products.map((p) => ({
          id: Number(p.id),
          name: p.name,
          sku: p.sku,
          stock: p.stock,
        }))}
        divisions={divisions.map((d) => ({ id: Number(d.id), name: d.name }))}
        rows={history}
        createAction={createOutbound}
        deleteAction={deleteOutbound}
      />
    </>
  );
}
