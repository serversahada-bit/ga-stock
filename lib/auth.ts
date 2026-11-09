import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/session";

/** Ambil user dari session, atau null bila belum login. */
export async function currentUser(): Promise<SessionPayload | null> {
  return getSession();
}

/** Wajib login. Redirect ke /login bila belum. */
export async function requireUser(): Promise<SessionPayload> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

/** Wajib login + role admin. Redirect / abort bila tidak memenuhi. */
export async function requireAdmin(): Promise<SessionPayload> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export function isAdmin(user: SessionPayload | null): boolean {
  return user?.role === "admin";
}
