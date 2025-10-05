import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-[var(--teal-50)] dark:bg-[var(--teal-950)] text-[var(--teal-900)] dark:text-[var(--teal-100)] overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute -top-60 -left-60 w-[40rem] h-[40rem] bg-[color:rgb(20_184_166_/_0.2)] rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-60 -right-60 w-[40rem] h-[40rem] bg-[color:rgb(20_184_166_/_0.3)] rounded-full blur-3xl opacity-50" />
      <div className="absolute top-1/2 left-1/4 w-[30rem] h-[30rem] bg-[color:rgb(153_246_228_/_0.2)] rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[color:rgb(94_234_212_/_0.2)] rounded-full blur-3xl opacity-40 animate-pulse" />

      <main className="relative z-10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full max-w-xl space-y-8">
          {/* Heading */}
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-[var(--teal-900)] dark:text-[var(--teal-50)] mb-4">
              NourishNote
            </h1>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-[var(--teal-700)] dark:text-[var(--teal-200)]">
              Welcome back
            </h2>
            {/* Shared width wrapper so this aligns with the form */}
            <div className="mx-auto w-full max-w-[28rem]">
              <p className="mt-1 mb-4 text-base text-[var(--teal-700)]/80 dark:text-[var(--teal-200)]/80 text-center translate-x-1">
                Please enter your credentials to access your account.
              </p>
            </div>
          </div>

          {/* Form shares the same max width */}
          <div className="mx-auto w-full max-w-[28rem]">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
