import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <section className="max-w-lg text-center">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          404
        </p>
        <h1 className="text-ink mt-3 text-3xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted mt-4 leading-7">
          The page you requested does not exist.
        </p>
        <Link
          className="bg-brand hover:bg-brand-dark mt-7 inline-flex min-h-11 items-center rounded-full px-5 font-semibold text-white"
          href="/"
        >
          Return to the foundation page
        </Link>
      </section>
    </main>
  );
}
