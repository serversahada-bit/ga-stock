"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function DashboardFilter({
  month,
  year,
  groupBy,
  years,
}: {
  month: number;
  year: number;
  groupBy: "product" | "division";
  years: number[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    router.push(`/dashboard?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-muted text-sm font-medium">Bulan</span>
        <Select
          value={month}
          onChange={(e) => setParam("month", e.target.value)}
          className="w-auto"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted text-sm font-medium">Tahun</span>
        <Select
          value={year}
          onChange={(e) => setParam("year", e.target.value)}
          className="w-auto"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted text-sm font-medium">Kelompok</span>
        <Select
          value={groupBy}
          onChange={(e) => setParam("group_by", e.target.value)}
          className="w-auto"
        >
          <option value="product">Produk</option>
          <option value="division">Divisi</option>
        </Select>
      </div>
    </div>
  );
}
