"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

function parseOccurred(fd: FormData): Date {
  const raw = String(fd.get("occurredAt") ?? "").trim();
  if (!raw) return new Date();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
}

export async function createOutbound(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();

  const productId = BigInt(String(fd.get("productId") ?? "0"));
  const divisionId = BigInt(String(fd.get("divisionId") ?? "0"));
  const qty = Number(fd.get("qty"));
  const note = String(fd.get("note") ?? "").trim() || null;
  const occurredAt = parseOccurred(fd);

  if (!productId) return { error: "Produk wajib dipilih." };
  if (!divisionId) return { error: "Divisi wajib dipilih." };
  if (!Number.isInteger(qty) || qty < 1)
    return { error: "Qty harus bilangan bulat ≥ 1." };
  if (note && note.length > 255) return { error: "Catatan maksimal 255 karakter." };

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Produk tidak ditemukan.");

      // Kurangi stok secara atomik hanya jika mencukupi.
      const res = await tx.product.updateMany({
        where: { id: productId, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (res.count === 0) {
        throw new Error(`Stok tidak cukup. Stok saat ini: ${product.stock}`);
      }

      await tx.stockMovement.create({
        data: {
          productId,
          divisionId,
          type: "OUTBOUND",
          qty,
          note,
          occurredAt,
          userId: BigInt(user.userId),
        },
      });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal menyimpan outbound." };
  }

  revalidatePath("/outbound");
  revalidatePath("/dashboard");
  return { ok: "Outbound tersimpan. Stok produk berkurang." };
}

export async function deleteOutbound(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = BigInt(String(fd.get("id")));

  try {
    await prisma.$transaction(async (tx) => {
      const m = await tx.stockMovement.findFirst({
        where: { id, type: "OUTBOUND" },
      });
      if (!m) throw new Error("Data outbound tidak ditemukan.");

      await tx.product.update({
        where: { id: m.productId },
        data: { stock: { increment: m.qty } },
      });
      await tx.stockMovement.delete({ where: { id } });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal menghapus outbound." };
  }

  revalidatePath("/outbound");
  revalidatePath("/dashboard");
  return { ok: "Outbound dihapus. Stok produk dikembalikan." };
}
