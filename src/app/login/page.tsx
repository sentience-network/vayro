import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-4xl font-extrabold text-ink">BETME</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/60">
          Demo: <span className="font-semibold">demo@betme.app</span> / demo1234
        </p>
      </div>
      <div className="mt-8">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
