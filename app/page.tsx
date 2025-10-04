import Link from "next/link";
import { Button } from "@/components/supa_components/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">NourishNote</h1>
        <p className="text-muted-foreground">A simple, timed journaling app to help you reflect and grow.</p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
