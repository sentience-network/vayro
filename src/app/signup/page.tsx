import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-4xl font-extrabold text-ink">BETME</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Earn your way in</h1>
        <p className="mt-2 text-sm text-ink/60">
          Credits from signup, referrals, and usage — never bought, never cashed out.
        </p>
      </div>
      <div className="mt-8">
        <Suspense fallback={<p className="text-center text-sm text-ink/50">Loading…</p>}>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
