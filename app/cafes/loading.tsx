export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
      <div className="mt-6 h-14 w-72 animate-pulse rounded-xl bg-secondary" />
      <p className="mt-4 text-muted-foreground">Finding cafes…</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,560px)_1fr]">
        <div className="grid content-start gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-secondary" />
          ))}
        </div>
        <div className="hidden h-[70vh] animate-pulse rounded-3xl bg-secondary lg:block" />
      </div>
    </main>
  );
}