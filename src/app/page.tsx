import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <section className="border-line bg-surface w-full max-w-2xl rounded-3xl border px-7 py-12 shadow-sm sm:px-12 sm:py-16">
        <p className="text-brand mb-6 text-sm font-semibold tracking-[0.16em] uppercase">
          Application foundation
        </p>
        <h1 className="text-ink text-4xl font-bold tracking-tight sm:text-6xl">
          Finger-Lickin
        </h1>
        <p className="text-muted mt-6 max-w-prose text-base leading-7 sm:text-lg">
          The technical foundation is in place. Customer, restaurant, and
          operations experiences will be built in later phases.
        </p>
        <div className="mt-9">
          <Button disabled>Storefront coming soon</Button>
        </div>
      </section>
    </main>
  );
}
