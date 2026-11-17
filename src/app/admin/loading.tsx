import { PropertyCardSkeleton } from "@/components/property-card-skeleton";

export default function Loading() {
  return (
    <main
      className="shell py-16"
      aria-busy="true"
      aria-label="Carregando painel"
    >
      <div className="h-5 w-28 animate-pulse rounded-full bg-[var(--surface-muted)]" />
      <div className="mt-5 h-16 max-w-xl animate-pulse rounded-2xl bg-[var(--surface-muted)]" />
      <section className="mt-12 grid gap-5 md:grid-cols-3">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </section>
    </main>
  );
}
