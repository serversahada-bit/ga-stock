import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { TxManager, type TxRow } from "@/components/tx-manager";
import { formatDateTime } from "@/lib/format";
import { createInbound, deleteInbound } from "./actions";

export default async function InboundPage() {
  await requireAdmin();

  const [products, rows] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.stockMovement.findMany({
      where: { type: "INBOUND" },
      include: { product: true },
      orderBy: { occurredAt: "desc" },
      take: 30,
    }),
  ]);

  const history: TxRow[] = rows.map((r) => ({
    id: Number(r.id),
    productName: r.product?.name ?? "-",
    divisionName: null,
    qty: r.qty,
    note: r.note,
    occurredAt: formatDateTime(r.occurredAt),
  }));

  return (
    <>
      <PageHeader
        title="Inbound"
        subtitle="Barang masuk → stok bertambah + histori."
      />
      <TxManager
        kind="INBOUND"
        products={products.map((p) => ({
          id: Number(p.id),
          name: p.name,
          sku: p.sku,
          stock: p.stock,
        }))}
        rows={history}
        createAction={createInbound}
        deleteAction={deleteInbound}
      />
    </>
  );
}
