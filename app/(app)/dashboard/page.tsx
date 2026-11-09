import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Th,
  Td,
  Badge,
  Stat,
  PageHeader,
  Empty,
} from "@/components/ui";
import { DashboardFilter } from "@/components/dashboard-filter";
import { OutboundChart, type ChartDatum } from "@/components/outbound-chart";
import { formatNumber } from "@/lib/format";

function clampMonth(v: string | undefined): number {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : new Date().getMonth() + 1;
}
function clampYear(v: string | undefined, years: number[]): number {
  const n = Number(v);
  return years.includes(n) ? n : new Date().getFullYear();
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; group_by?: string }>;
}) {
  const user = await currentUser();
  const isAdmin = user?.role === "admin";

  // Produk + kategori untuk tabel stok
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const lowCount = products.filter(
    (p) => p.isActive && p.stock <= p.minStock,
  ).length;

  const stockTable = (
    <Card>
      <CardHeader
        title="Stok Saat Ini"
        subtitle="Daftar produk & kuantitas terkini"
        right={<Badge tone="brand">{isAdmin ? "ADMIN" : "VIEW"}</Badge>}
      />
      <div className="max-h-[420px] overflow-y-auto">
        <Table>
          <thead className="bg-surface sticky top-0">
            <tr>
              <Th>Produk</Th>
              <Th>Kategori</Th>
              <Th className="text-right">Stok</Th>
              <Th className="text-right">Min</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <Td colSpan={5}>
                  <Empty>Belum ada produk.</Empty>
                </Td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={Number(p.id)}>
                  <Td className="font-medium">{p.name}</Td>
                  <Td className="text-muted">{p.category.name}</Td>
                  <Td className="text-right font-semibold tabular-nums">
                    {p.stock}{" "}
                    <span className="text-muted font-normal">{p.unit}</span>
                  </Td>
                  <Td className="text-muted text-right tabular-nums">
                    {p.minStock}
                  </Td>
                  <Td>
                    {!p.isActive ? (
                      <Badge tone="neutral">Nonaktif</Badge>
                    ) : p.stock <= p.minStock ? (
                      <Badge tone="danger">Low</Badge>
                    ) : (
                      <Badge tone="success">OK</Badge>
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  );

  // ---- Viewer: cukup tabel stok ----
  if (!isAdmin) {
    return (
      <>
        <PageHeader
          title={`Halo, ${user?.name ?? ""}`}
          subtitle="Ringkasan stok gudang."
        />
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Total Produk" value={products.length} tone="brand" />
          <Stat label="Stok Menipis" value={lowCount} tone="danger" />
        </div>
        {stockTable}
      </>
    );
  }

  // ---- Admin: statistik + chart + laporan ----
  const now = new Date();
  const years = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i);
  const sp = await searchParams;
  const month = clampMonth(sp.month);
  const year = clampYear(sp.year, years);
  const groupBy: "product" | "division" =
    sp.group_by === "division" ? "division" : "product";

  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const outWhere = {
    type: "OUTBOUND" as const,
    occurredAt: { gte: start, lte: end },
  };

  const divisions = await prisma.division.findMany();
  const divName = new Map(divisions.map((d) => [Number(d.id), d.name]));
  const prodName = new Map(products.map((p) => [Number(p.id), p.name]));

  // Total outbound bulan ini
  const totalOut = await prisma.stockMovement.aggregate({
    _sum: { qty: true },
    where: outWhere,
  });

  // Statistik chart: group by produk / divisi
  const grouped = await prisma.stockMovement.groupBy({
    by: groupBy === "division" ? ["divisionId"] : ["productId"],
    where: outWhere,
    _sum: { qty: true },
    orderBy: { _sum: { qty: "desc" } },
  });

  const chartData: ChartDatum[] = grouped.map((g) => {
    const qty = g._sum.qty ?? 0;
    if (groupBy === "division") {
      const id = g.divisionId != null ? Number(g.divisionId) : null;
      return { label: id != null ? (divName.get(id) ?? "-") : "Tanpa divisi", qty };
    }
    const id = Number(g.productId);
    return { label: prodName.get(id) ?? "-", qty };
  });

  // Laporan stok keluar per divisi (divisi -> produk -> qty)
  const perDivProd = await prisma.stockMovement.groupBy({
    by: ["divisionId", "productId"],
    where: outWhere,
    _sum: { qty: true },
  });

  const report = new Map<
    string,
    { division: string; items: { product: string; qty: number }[] }
  >();
  for (const row of perDivProd) {
    const key = row.divisionId != null ? String(Number(row.divisionId)) : "null";
    const dname =
      row.divisionId != null
        ? (divName.get(Number(row.divisionId)) ?? "-")
        : "Tanpa divisi";
    if (!report.has(key)) report.set(key, { division: dname, items: [] });
    report.get(key)!.items.push({
      product: prodName.get(Number(row.productId)) ?? "-",
      qty: row._sum.qty ?? 0,
    });
  }
  const reportList = [...report.values()].map((r) => ({
    ...r,
    items: r.items.sort((a, b) => b.qty - a.qty),
    total: r.items.reduce((s, it) => s + it.qty, 0),
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan stok & aktivitas gudang."
      />

      {/* Stat tiles */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total Produk" value={products.length} tone="brand" />
        <Stat label="Stok Menipis" value={lowCount} tone="danger" />
        <Stat label="Total Divisi" value={divisions.length} tone="warning" />
        <Stat
          label="Keluar Bulan Ini"
          value={formatNumber(totalOut._sum.qty ?? 0)}
          hint="total unit outbound"
          tone="success"
        />
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardBody>
          <DashboardFilter
            month={month}
            year={year}
            groupBy={groupBy}
            years={years}
          />
        </CardBody>
      </Card>

      {/* Chart + tabel stok */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Statistik Keluar Bulanan"
            subtitle={`Qty keluar terbanyak per ${groupBy === "division" ? "divisi" : "produk"}`}
          />
          <CardBody>
            {chartData.length === 0 ? (
              <Empty>Tidak ada data outbound pada periode ini.</Empty>
            ) : (
              <OutboundChart data={chartData.slice(0, 12)} />
            )}
          </CardBody>
        </Card>

        {stockTable}
      </div>

      {/* Laporan per divisi */}
      <Card>
        <CardHeader
          title="Laporan Stok Keluar per Divisi"
          subtitle="Rincian outbound per divisi pada periode terpilih"
        />
        <CardBody className="space-y-6">
          {reportList.length === 0 ? (
            <Empty>Tidak ada data outbound pada periode ini.</Empty>
          ) : (
            reportList.map((r, i) => (
              <div key={i}>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold">
                    Divisi: <span className="text-brand-600 dark:text-brand-300">{r.division}</span>
                  </h4>
                  <Badge tone="brand">Total {r.total}</Badge>
                </div>
                <Table>
                  <thead>
                    <tr>
                      <Th>Produk</Th>
                      <Th className="text-right">Total Qty Keluar</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.items.map((it, j) => (
                      <tr key={j}>
                        <Td>{it.product}</Td>
                        <Td className="text-right font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                          -{it.qty}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </>
  );
}
