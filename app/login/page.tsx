import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="bg-brand-600 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white">
            GA
          </div>
          <h1 className="text-2xl font-bold">GA Stock</h1>
          <p className="text-muted mt-1 text-sm">
            Masuk untuk mengelola stok gudang.
          </p>
        </div>

        <div className="bg-surface border-token rounded-2xl border p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="text-muted mt-6 text-center text-xs">
          GA Stock — versi Next.js
        </p>
      </div>
    </div>
  );
}
