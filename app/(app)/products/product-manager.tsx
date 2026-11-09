"use client";

import { useActionState, useEffect, useState } from "react";
import type { ActionState } from "@/lib/types";
import {
  Card,
  CardHeader,
  Table,
  Th,
  Td,
  Input,
  Select,
  Label,
  Badge,
  Alert,
  Empty,
  Button,
} from "@/components/ui";
import { SubmitButton, DeleteSubmit } from "@/components/form-bits";
import { Modal } from "@/components/modal";
import { createProduct, updateProduct, deleteProduct } from "./actions";

export type ProductRow = {
  id: number;
  sku: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  isActive: boolean;
  categoriesId: number;
  categoryName: string;
};

type Category = { id: number; name: string };

function ProductForm({
  categories,
  product,
  action,
  onDone,
}: {
  categories: Category[];
  product?: ProductRow;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Nama produk</Label>
          <Input name="name" defaultValue={product?.name} required maxLength={150} />
        </div>

        <div>
          <Label>SKU</Label>
          <Input name="sku" defaultValue={product?.sku} required maxLength={50} />
        </div>

        <div>
          <Label>Kategori</Label>
          <Select name="categoriesId" defaultValue={product?.categoriesId ?? ""} required>
            <option value="" disabled>
              Pilih kategori…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Satuan</Label>
          <Input name="unit" defaultValue={product?.unit ?? "pcs"} maxLength={20} />
        </div>

        <div>
          <Label>Stok</Label>
          <Input
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            required
          />
        </div>

        <div>
          <Label>Min. stok</Label>
          <Input
            name="minStock"
            type="number"
            min={0}
            defaultValue={product?.minStock ?? 0}
            required
          />
        </div>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product ? product.isActive : true}
            className="h-4 w-4 rounded border-[var(--border)] accent-[var(--color-brand-600)]"
          />
          <span className="text-sm">Produk aktif</span>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Batal
        </Button>
        <SubmitButton>{product ? "Simpan perubahan" : "Tambah produk"}</SubmitButton>
      </div>
    </form>
  );
}

export function ProductManager({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: Category[];
}) {
  const [modal, setModal] = useState<{ mode: "create" | "edit"; product?: ProductRow } | null>(null);
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(
    deleteProduct,
    {},
  );

  const close = () => setModal(null);

  return (
    <div className="space-y-5">
      {deleteState.error ? <Alert tone="danger">{deleteState.error}</Alert> : null}
      {deleteState.ok ? <Alert tone="success">{deleteState.ok}</Alert> : null}

      <Card>
        <CardHeader
          title="Daftar Produk"
          subtitle={`${products.length} produk`}
          right={
            categories.length > 0 ? (
              <Button onClick={() => setModal({ mode: "create" })}>
                + Tambah Produk
              </Button>
            ) : null
          }
        />

        {categories.length === 0 ? (
          <Empty>
            Belum ada kategori. Buat kategori dulu sebelum menambah produk.
          </Empty>
        ) : products.length === 0 ? (
          <Empty>Tidak ada produk ditemukan.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>SKU</Th>
                <Th>Nama</Th>
                <Th>Kategori</Th>
                <Th className="text-right">Stok</Th>
                <Th className="text-right">Min</Th>
                <Th>Status</Th>
                <Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <Td className="font-mono text-xs">{p.sku}</Td>
                  <Td className="font-medium">{p.name}</Td>
                  <Td className="text-muted">{p.categoryName}</Td>
                  <Td className="text-right font-semibold tabular-nums">
                    {p.stock} <span className="text-muted font-normal">{p.unit}</span>
                  </Td>
                  <Td className="text-muted text-right tabular-nums">{p.minStock}</Td>
                  <Td>
                    {!p.isActive ? (
                      <Badge tone="neutral">Nonaktif</Badge>
                    ) : p.stock <= p.minStock ? (
                      <Badge tone="danger">Low</Badge>
                    ) : (
                      <Badge tone="success">OK</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: "edit", product: p })}
                        className="focus-ring text-brand-600 dark:text-brand-300 rounded-md px-2.5 py-1 text-xs font-semibold hover:bg-brand-500/10"
                      >
                        Edit
                      </button>
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <DeleteSubmit confirmText={`Hapus produk "${p.name}"?`} />
                      </form>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={modal !== null}
        onClose={close}
        title={modal?.mode === "edit" ? "Edit Produk" : "Tambah Produk"}
      >
        {modal ? (
          <ProductForm
            key={modal.product?.id ?? "new"}
            categories={categories}
            product={modal.product}
            action={modal.mode === "edit" ? updateProduct : createProduct}
            onDone={close}
          />
        ) : null}
      </Modal>
    </div>
  );
}
