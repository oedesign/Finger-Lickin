"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <section className="max-w-lg text-center">
        <p className="text-brand text-sm font-semibold tracking-[0.16em] uppercase">
          Something went wrong
        </p>
        <h1 className="text-ink mt-3 text-3xl font-bold tracking-tight">
          This page could not be displayed.
        </h1>
        <p className="text-muted mt-4 leading-7">
          Please try again. If the problem continues, share the reference below
          with the site operator.
        </p>
        {error.digest ? (
          <p className="text-muted mt-3 text-sm">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-7">
          <Button onClick={reset}>Try again</Button>
        </div>
      </section>
    </main>
  );
}
