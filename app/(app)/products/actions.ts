"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

type Parsed = {
  categoriesId: bigint;
  sku: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  isActive: boolean;
};

function parse(fd: FormData): { data?: Parsed; error?: string } {
  const categoriesIdRaw = String(fd.get("categoriesId") ?? "");
  const sku = String(fd.get("sku") ?? "").trim().toUpperCase();
  const name = String(fd.get("name") ?? "").trim();
  const unit = String(fd.get("unit") ?? "").trim() || "pcs";
  const stock = Number(fd.get("stock"));
  const minStock = Number(fd.get("minStock"));
  const isActive = fd.get("isActive") != null;

  if (!categoriesIdRaw) return { error: "Kategori wajib dipilih." };
  if (!sku) return { error: "SKU wajib diisi." };
  if (sku.length > 50) return { error: "SKU maksimal 50 karakter." };
  if (!name) return { error: "Nama produk wajib diisi." };
  if (name.length > 150) return { error: "Nama maksimal 150 karakter." };
  if (unit.length > 20) return { error: "Satuan maksimal 20 karakter." };
  if (!Number.isInteger(stock) || stock < 0)
    return { error: "Stok harus bilangan bulat ≥ 0." };
  if (!Number.isInteger(minStock) || minStock < 0)
    return { error: "Min stok harus bilangan bulat ≥ 0." };

  return {
    data: {
      categoriesId: BigInt(categoriesIdRaw),
      sku,
      name,
      unit,
      stock,
      minStock,
      isActive,
    },
  };
}

export async function createProduct(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const { data, error } = parse(fd);
  if (error) return { error };

  const cat = await prisma.category.findUnique({ where: { id: data!.categoriesId } });
  if (!cat) return { error: "Kategori tidak valid." };

  const dup = await prisma.product.findUnique({ where: { sku: data!.sku } });
  if (dup) return { error: `SKU "${data!.sku}" sudah dipakai.` };

  await prisma.product.create({ data: data! });
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { ok: "Produk berhasil ditambahkan." };
}

export async function updateProduct(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = BigInt(String(fd.get("id")));
  const { data, error } = parse(fd);
  if (error) return { error };

  const dup = await prisma.product.findFirst({
    where: { sku: data!.sku, NOT: { id } },
  });
  if (dup) return { error: `SKU "${data!.sku}" sudah dipakai.` };

  await prisma.product.update({ where: { id }, data: data! });
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { ok: "Produk berhasil diperbarui." };
}

export async function deleteProduct(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = BigInt(String(fd.get("id")));

  const moves = await prisma.stockMovement.count({ where: { productId: id } });
  if (moves > 0) {
    return {
      error: `Tidak bisa menghapus: produk punya ${moves} histori transaksi. Hapus transaksinya dulu.`,
    };
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { ok: "Produk berhasil dihapus." };
}
