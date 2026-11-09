"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

function cleanName(fd: FormData): string {
  return String(fd.get("name") ?? "").trim().toUpperCase();
}

export async function createDivision(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const name = cleanName(fd);
  if (!name) return { error: "Nama divisi wajib diisi." };
  if (name.length > 100) return { error: "Nama maksimal 100 karakter." };

  const exists = await prisma.division.findUnique({ where: { name } });
  if (exists) return { error: `Divisi "${name}" sudah ada.` };

  await prisma.division.create({ data: { name } });
  revalidatePath("/divisions");
  return { ok: "Divisi berhasil ditambahkan." };
}

export async function updateDivision(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = BigInt(String(fd.get("id")));
  const name = cleanName(fd);
  if (!name) return { error: "Nama divisi wajib diisi." };
  if (name.length > 100) return { error: "Nama maksimal 100 karakter." };

  const dup = await prisma.division.findFirst({ where: { name, NOT: { id } } });
  if (dup) return { error: `Divisi "${name}" sudah ada.` };

  await prisma.division.update({ where: { id }, data: { name } });
  revalidatePath("/divisions");
  return { ok: "Divisi berhasil diperbarui." };
}

export async function deleteDivision(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = BigInt(String(fd.get("id")));

  // Histori outbound yang terkait akan kehilangan referensi divisi (di-set null).
  await prisma.division.delete({ where: { id } });
  revalidatePath("/divisions");
  return { ok: "Divisi berhasil dihapus." };
}
