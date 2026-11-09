"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Th,
  Td,
  Input,
  Select,
  Label,
  Alert,
  Empty,
  Badge,
} from "@/components/ui";
import { SubmitButton, DeleteSubmit } from "@/components/form-bits";

type Product = { id: number; name: string; sku: string; stock: number };
type Division = { id: number; name: string };
export type TxRow = {
  id: number;
  productName: string;
  divisionName: string | null;
  qty: number;
  note: string | null;
  occurredAt: string;
};

export function TxManager({
  kind,
  products,
  divisions,
  rows,
  createAction,
  deleteAction,
}: {
  kind: "INBOUND" | "OUTBOUND";
  products: Product[];
  divisions?: Division[];
  rows: TxRow[];
  createAction: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  deleteAction: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const [createState, create] = useActionState<ActionState, FormData>(createAction, {});
  const [deleteState, remove] = useActionState<ActionState, FormData>(deleteAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (createState.ok) formRef.current?.reset();
  }, [createState]);

  const isOut = kind === "OUTBOUND";
  const flash =
    createState.error || deleteState.error || createState.ok || deleteState.ok;
  const tone =
    createState.error || deleteState.error ? "danger" : "success";

  return (
    <div className="space-y-5">
      {flash ? <Alert tone={tone as "success" | "danger"}>{flash}</Alert> : null}

      <Card>
        <CardHeader
          title={isOut ? "Catat Barang Keluar" : "Catat Barang Masuk"}
          subtitle={
            isOut
              ? "Stok berkurang & tercatat per divisi."
              : "Stok bertambah & tercatat sebagai histori."
          }
        />
        <CardBody>
          {products.length === 0 ? (
            <Empty>Belum ada produk. Tambahkan produk terlebih dahulu.</Empty>
          ) : (
            <form
              ref={formRef}
              action={create}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <div className={isOut ? "" : "sm:col-span-2"}>
                <Label>Produk</Label>
                <Select name="productId" required defaultValue="">
                  <option value="" disabled>
                    Pilih produk…
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name} (stok {p.stock})
                    </option>
                  ))}
                </Select>
              </div>

              {isOut ? (
                <div>
                  <Label>Divisi</Label>
                  <Select name="divisionId" required defaultValue="">
                    <option value="" disabled>
                      Pilih divisi…
                    </option>
                    {(divisions ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}

              <div>
                <Label>Qty</Label>
                <Input name="qty" type="number" min={1} defaultValue={1} required />
              </div>

              <div>
                <Label>Waktu</Label>
                <Input name="occurredAt" type="datetime-local" />
              </div>

              <div className="sm:col-span-2">
                <Label>Catatan (opsional)</Label>
                <Input name="note" maxLength={255} placeholder="mis. no. dokumen / keterangan" />
              </div>

              <div className="sm:col-span-2">
                <SubmitButton variant={isOut ? "primary" : "primary"}>
                  {isOut ? "Simpan Outbound" : "Simpan Inbound"}
                </SubmitButton>
              </div>
            </form>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Histori Terakhir"
          subtitle={`${rows.length} transaksi terbaru`}
        />
        {rows.length === 0 ? (
          <Empty>Belum ada transaksi.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Waktu</Th>
                <Th>Produk</Th>
                {isOut ? <Th>Divisi</Th> : null}
                <Th className="text-right">Qty</Th>
                <Th>Catatan</Th>
                <Th className="text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td className="text-muted whitespace-nowrap">{r.occurredAt}</Td>
                  <Td className="font-medium">{r.productName}</Td>
                  {isOut ? (
                    <Td className="text-muted">{r.divisionName ?? "-"}</Td>
                  ) : null}
                  <Td className="text-right">
                    <Badge tone={isOut ? "danger" : "success"}>
                      {isOut ? "-" : "+"}
                      {r.qty}
                    </Badge>
                  </Td>
                  <Td className="text-muted max-w-[200px] truncate">
                    {r.note ?? "-"}
                  </Td>
                  <Td className="text-right">
                    <form action={remove}>
                      <input type="hidden" name="id" value={r.id} />
                      <DeleteSubmit confirmText="Hapus transaksi ini? Stok akan disesuaikan." />
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
