import Link from "next/link"

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--teal-50)] dark:bg-[var(--teal-950)] text-[var(--teal-900)] dark:text-[var(--teal-100)]">
      {/* subtle noise */}
      <div className="noise-overlay" />

      {/* top nav */}
      <div className="absolute top-0 left-0 w-full p-12 sm:p-16 flex justify-between items-center z-20">
        <h2 className="text-3xl sm:text-4xl font-bold">NourishNote</h2>
        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-10 py-4 text-xl sm:text-2xl bg-transparent border border-[var(--teal-200)] dark:border-[var(--teal-800)] text-[var(--teal-900)] dark:text-[var(--teal-100)] font-bold rounded-xl shadow-sm hover:bg-[var(--teal-100)] dark:hover:bg-[var(--teal-900)] transition-colors duration-300"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center px-10 py-4 text-xl sm:text-2xl bg-[var(--teal-500)] text-white font-bold rounded-xl shadow-lg hover:bg-[var(--teal-600)] transition-colors duration-300"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* ambient blobs */}
      <div className="absolute -top-60 -left-60 w-[40rem] h-[40rem] bg-[color:rgb(20_184_166_/_0.2)] rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-60 -right-60 w-[40rem] h-[40rem] bg-[color:rgb(20_184_166_/_0.3)] rounded-full blur-3xl opacity-50" />
      <div className="absolute top-1/2 left-1/4 w-[30rem] h-[30rem] bg-[color:rgb(153_246_228_/_0.2)] rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[color:rgb(94_234_212_/_0.2)] rounded-full blur-3xl opacity-40 animate-pulse" />

      {/* hero */}
      <section className="text-center z-10">
        <div className="flex flex-col items-center">
          <img
            src="/images/branding/mmlogo.png"
            alt="NourishNote logo"
            className="block -mb-20 h-48 sm:h-64 md:h-80 w-auto"
          />
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-8 font-sans">NourishNote</h1>
          <div className="h-12 flex items-center">
            <p className="text-lg sm:text-xl md:text-2xl text-[var(--teal-600)] dark:text-[var(--teal-300)] overflow-hidden whitespace-nowrap border-r-4 border-r-[var(--teal-500)] animate-typing">
              Built to inspire mindful living.
            </p>
          </div>
          <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-[color:rgb(19_78_74_/_0.8)] dark:text-[color:rgb(240_253_250_/_0.8)] mt-12 mb-16">
            NourishNote helps you understand your eating patterns, fostering a healthier relationship with food and a better lifestyle through guided journaling.
          </p>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--teal-400)] to-[var(--teal-600)] rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
            <Link
              href="/auth/sign-up"
              className="relative inline-flex items-center justify-center px-14 py-6 bg-[var(--teal-500)] text-white text-2xl font-bold rounded-xl shadow-2xl hover:bg-[var(--teal-600)] transition-colors duration-300"
            >
              Start Your Journey
              <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}


