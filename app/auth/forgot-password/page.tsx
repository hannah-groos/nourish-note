import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function Page() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--teal-50)] dark:bg-[var(--teal-950)] text-[var(--teal-900)] dark:text-[var(--teal-100)]">
      <div className="w-full max-w-md mx-auto">
        {/* Brand header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">NourishNote</h1>
          </div>
        </div>

        {/* Container around the form */}
        <div className="bg-white dark:bg-[rgba(26,50,44,0.5)] p-6 md:p-8 rounded-xl shadow-sm border border-[var(--teal-100)] dark:border-[rgba(26,50,44,1)]">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Forgot Password?</h2>
            <p className="mt-3 text-[color:rgb(19_78_74_/_0.8)] dark:text-[color:rgb(240_253_250_/_0.8)]">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {/* Existing form logic and handling */}
          <ForgotPasswordForm />

          <div className="mt-6 text-center">
            <a href="/auth/login" className="font-medium text-[var(--teal-500)] hover:text-[var(--teal-600)]">
              ← Back to Log In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
