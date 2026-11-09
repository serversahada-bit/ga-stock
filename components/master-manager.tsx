"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ActionState } from "@/lib/types";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  Th,
  Td,
  Input,
  Alert,
  Empty,
} from "@/components/ui";
import { SubmitButton, DeleteSubmit } from "@/components/form-bits";

type Item = { id: number; name: string; meta?: string };

type Actions = {
  create: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  update: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  remove: (prev: ActionState, fd: FormData) => Promise<ActionState>;
};

export function MasterManager({
  items,
  actions,
  entityLabel,
  placeholder,
}: {
  items: Item[];
  actions: Actions;
  entityLabel: string;
  placeholder: string;
}) {
  const [createState, createAction] = useActionState<ActionState, FormData>(
    actions.create,
    {},
  );
  const [updateState, updateAction] = useActionState<ActionState, FormData>(
    actions.update,
    {},
  );
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(
    actions.remove,
    {},
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const createFormRef = useRef<HTMLFormElement>(null);

  // Reset form & tutup edit setelah sukses
  useEffect(() => {
    if (createState.ok) createFormRef.current?.reset();
  }, [createState]);
  useEffect(() => {
    if (updateState.ok) setEditingId(null);
  }, [updateState]);

  const flash =
    createState.error ||
    updateState.error ||
    deleteState.error ||
    createState.ok ||
    updateState.ok ||
    deleteState.ok;
  const flashTone =
    createState.error || updateState.error || deleteState.error
      ? "danger"
      : "success";

  return (
    <div className="space-y-5">
      {flash ? <Alert tone={flashTone as "success" | "danger"}>{flash}</Alert> : null}

      <Card>
        <CardHeader title={`Tambah ${entityLabel}`} />
        <CardBody>
          <form
            ref={createFormRef}
            action={createAction}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="min-w-[220px] flex-1">
              <Input name="name" placeholder={placeholder} required maxLength={100} />
            </div>
            <SubmitButton>Tambah</SubmitButton>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={`Daftar ${entityLabel}`}
          subtitle={`${items.length} data`}
        />
        {items.length === 0 ? (
          <Empty>Belum ada {entityLabel.toLowerCase()}.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th className="w-16">#</Th>
                <Th>Nama</Th>
                <Th className="w-40 text-right">Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id}>
                  <Td className="text-muted">{i + 1}</Td>
                  {editingId === item.id ? (
                    <Td colSpan={2}>
                      <form
                        action={updateAction}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <Input
                          name="name"
                          defaultValue={item.name}
                          required
                          maxLength={100}
                          autoFocus
                          className="max-w-xs"
                        />
                        <SubmitButton size="sm" pendingText="…">
                          Simpan
                        </SubmitButton>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="focus-ring text-muted rounded-md px-2.5 py-1 text-xs font-semibold hover:bg-[var(--surface-2)]"
                        >
                          Batal
                        </button>
                      </form>
                    </Td>
                  ) : (
                    <>
                      <Td>
                        <span className="font-medium">
                          {item.name}
                          {item.meta ? (
                            <span className="text-muted ml-2 text-xs">
                              {item.meta}
                            </span>
                          ) : null}
                        </span>
                      </Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(item.id)}
                            className="focus-ring text-brand-600 dark:text-brand-300 rounded-md px-2.5 py-1 text-xs font-semibold hover:bg-brand-500/10"
                          >
                            Edit
                          </button>
                          <form action={deleteAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <DeleteSubmit
                              confirmText={`Hapus ${entityLabel.toLowerCase()} "${item.name}"?`}
                            />
                          </form>
                        </div>
                      </Td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
