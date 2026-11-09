"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

function cleanName(fd: FormData): string {
  return String(fd.get("name") ?? "").trim().toUpperCase();
}

export async function createCategory(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const name = cleanName(fd);
  if (!name) return { error: "Nama kategori wajib diisi." };
  if (name.length > 100) return { error: "Nama maksimal 100 karakter." };

  const exists = await prisma.category.findUnique({ where: { name } });
  if (exists) return { error: `Kategori "${name}" sudah ada.` };

  await prisma.category.create({ data: { name } });
  revalidatePath("/categories");
  return { ok: "Kategori berhasil ditambahkan." };
}

export async function updateCategory(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = BigInt(String(fd.get("id")));
  const name = cleanName(fd);
  if (!name) return { error: "Nama kategori wajib diisi." };
  if (name.length > 100) return { error: "Nama maksimal 100 karakter." };

  const dup = await prisma.category.findFirst({
    where: { name, NOT: { id } },
  });
  if (dup) return { error: `Kategori "${name}" sudah ada.` };

  await prisma.category.update({ where: { id }, data: { name } });
  revalidatePath("/categories");
  return { ok: "Kategori berhasil diperbarui." };
}

export async function deleteCategory(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = BigInt(String(fd.get("id")));

  const count = await prisma.product.count({ where: { categoriesId: id } });
  if (count > 0) {
    return {
      error: `Tidak bisa menghapus: masih ada ${count} produk pada kategori ini.`,
    };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  return { ok: "Kategori berhasil dihapus." };
}
