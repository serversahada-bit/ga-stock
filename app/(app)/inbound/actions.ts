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

export async function createInbound(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();

  const productId = BigInt(String(fd.get("productId") ?? "0"));
  const qty = Number(fd.get("qty"));
  const note = String(fd.get("note") ?? "").trim() || null;
  const occurredAt = parseOccurred(fd);

  if (!productId) return { error: "Produk wajib dipilih." };
  if (!Number.isInteger(qty) || qty < 1)
    return { error: "Qty harus bilangan bulat ≥ 1." };
  if (note && note.length > 255) return { error: "Catatan maksimal 255 karakter." };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Produk tidak ditemukan." };

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId,
        divisionId: null,
        type: "INBOUND",
        qty,
        note,
        occurredAt,
        userId: BigInt(user.userId),
      },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: qty } },
    }),
  ]);

  revalidatePath("/inbound");
  revalidatePath("/dashboard");
  return { ok: "Inbound tersimpan. Stok produk bertambah." };
}

export async function deleteInbound(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = BigInt(String(fd.get("id")));

  try {
    await prisma.$transaction(async (tx) => {
      const m = await tx.stockMovement.findFirst({
        where: { id, type: "INBOUND" },
      });
      if (!m) throw new Error("Data inbound tidak ditemukan.");

      // Kurangi stok hanya jika stok sekarang masih >= qty (belum terpakai outbound).
      const res = await tx.product.updateMany({
        where: { id: m.productId, stock: { gte: m.qty } },
        data: { stock: { decrement: m.qty } },
      });
      if (res.count === 0) {
        throw new Error(
          "Tidak bisa hapus: stok saat ini lebih kecil dari qty inbound (sudah terpakai outbound).",
        );
      }

      await tx.stockMovement.delete({ where: { id } });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal menghapus inbound." };
  }

  revalidatePath("/inbound");
  revalidatePath("/dashboard");
  return { ok: "Inbound dihapus. Stok produk dikurangi kembali." };
}
