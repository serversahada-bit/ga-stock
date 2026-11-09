/**
 * Prisma mengembalikan id Laravel (bigint) sebagai BigInt JS yang tidak bisa
 * diserialisasi ke komponen client. Helper ini mengubah BigInt -> Number
 * secara rekursif. Aman karena id pada aplikasi ini jauh di bawah MAX_SAFE_INTEGER.
 */
export function serialize<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) =>
      typeof v === "bigint" ? Number(v) : v,
    ),
  );
}
