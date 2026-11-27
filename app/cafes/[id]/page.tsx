import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Globe,
  MapPin,
  Navigation,
  Phone,
  Sun,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { BackLink } from "@/components/back-link";
import { CafeCover } from "@/components/cafe-cover";
import { CafeMap } from "@/components/cafe-map";
import { OpenBadge } from "@/components/open-badge";
import { SaveButton } from "@/components/save-button";
import { ShareButton } from "@/components/share-button";
import { StatusState } from "@/components/status-state";
import { getCafeById, nearbyCafes, reverseGeocode, snapshotCafe, type Cafe } from "@/lib/cafes";
import { getFeatured } from "@/lib/featured";
import { prettyHours } from "@/lib/hours";
import { directionsUrl, placeUrl } from "@/lib/places";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";



export const instant = false;

function Fact({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

const dist = (km: number) =>
  km < 1 ? `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m` : `${km.toFixed(1)} km`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = snapshotCafe(id);
  if (!c) return {};

  const where = c.address || "Bengaluru";
  const description = `${c.name}, ${where}. Hours, details and directions.`;

  return {
    title: c.name,
    description,
    openGraph: { title: `${c.name} | ${BRAND}`, description, type: "website" },
  };
}

export default async function CafeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let cafe: Cafe | null = null;
  try {
    cafe = await getCafeById(id);
  } catch {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <BackLink />
        <StatusState kind="busy" />
      </main>
    );
  }
  if (!cafe) notFound();

  const extra = getFeatured(id, cafe.name);
  const address = cafe.address || (await reverseGeocode(cafe.lat, cafe.lng));
  const images = extra?.images ?? [];
  const website = cafe.website?.startsWith("http") ? cafe.website : undefined;
  const hoursLines = cafe.openingHours
    ? prettyHours(cafe.openingHours).split(" · ")
    : [];
  const nearby = nearbyCafes(cafe);
  const pin = [{ id: cafe.id, name: cafe.name, lat: cafe.lat, lng: cafe.lng }];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 pb-28 lg:pb-16">
      <BackLink />

      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Cafe
      </p>
      <h1 className="font-display mt-2 text-4xl sm:text-6xl">{cafe.name}</h1>
      {extra?.tagline && (
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {extra.tagline}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <OpenBadge id={cafe.id} hours={cafe.openingHours} />
        {cafe.wifi && (
          <span className="inline-flex items-center gap-2 rounded-full bg-sky/50 px-3.5 py-1.5 text-sm">
            <Wifi className="size-4 text-accent" /> WiFi
          </span>
        )}
        {cafe.outdoorSeating && (
          <span className="inline-flex items-center gap-2 rounded-full bg-sky/50 px-3.5 py-1.5 text-sm">
            <Sun className="size-4 text-accent" /> Outdoor seating
          </span>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* left: the cafe itself */}
        <div className="min-w-0">
          {images.length > 0 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {images.slice(0, 5).map((src, i) => (
                  <div
                    key={src}
                    className={`relative overflow-hidden rounded-2xl bg-secondary ${
                      i === 0
                        ? "aspect-[4/3] sm:col-span-2 sm:row-span-2"
                        : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${cafe.name} interior ${i + 1}`}
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {extra?.photoCredit && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {extra.photoCredit}
                </p>
              )}
            </>
          ) : (
            <div className="relative aspect-[16/8] overflow-hidden rounded-3xl">
              <CafeCover name={cafe.name} large className="h-full w-full" />
              <span className="absolute bottom-3 right-4 text-sm text-foreground/60">
                Photos coming soon
              </span>
            </div>
          )}

          {extra?.offers && extra.offers.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-3xl">Offers</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {extra.offers.map((o) => (
                  <div
                    key={o.title}
                    className="rounded-2xl border border-sky-deep/40 bg-sky/30 p-5"
                  >
                    <p className="font-medium">{o.title}</p>
                    {o.details && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {o.details}
                      </p>
                    )}
                    {o.validTill && (
                      <p className="mt-2 text-xs uppercase tracking-widest text-accent">
                        Valid till {o.validTill}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {extra?.coffeeTypes && extra.coffeeTypes.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-3xl">Coffee they serve</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {extra.coffeeTypes.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </section>
          )}

          {extra?.menu && extra.menu.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-3xl">Menu</h2>
              <div className="mt-6 grid gap-10 sm:grid-cols-2">
                {extra.menu.map((section) => (
                  <div key={section.category}>
                    <h3 className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
                      {section.category}
                    </h3>
                    <ul className="space-y-4">
                      {section.items.map((item) => (
                        <li key={item.name}>
                          <div className="flex items-baseline justify-between gap-4">
                            <span className="font-medium">{item.name}</span>
                            {item.price != null && (
                              <span className="text-sm">₹{item.price}</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {extra.updatedAt && (
                <p className="mt-6 text-xs text-muted-foreground">
                  Menu and offers last updated {extra.updatedAt}
                </p>
              )}
            </section>
          )}

          {!extra && (
            <section className="mt-12 rounded-2xl border border-dashed border-border p-8 text-center">
              <h2 className="font-display text-2xl">
                Menu and coffee details coming soon
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We only have the basics for this cafe so far.
              </p>
            </section>
          )}

          {nearby.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-3xl">Nearby cafes</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {nearby.map((n) => (
                  <Link
                    key={n.id}
                    href={`/cafes/${n.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition hover:bg-sky/30"
                  >
                    <span className="font-display flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky/60 text-xl">
                      {n.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-display block truncate text-lg leading-tight">
                        {n.name}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {n.address || "Tap for details"}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-sky/50 px-2.5 py-1 text-xs font-medium">
                      {dist(n.distanceKm)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* right: info card and map */}
        <aside className="order-first lg:order-last lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6">
            <ul className="space-y-4">
              <Fact icon={MapPin}>{address || "Address not listed"}</Fact>
              {hoursLines.length > 0 && (
                <Fact icon={Clock}>
                  {hoursLines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </Fact>
              )}
              {cafe.phone && (
                <Fact icon={Phone}>
                  <a
                    href={`tel:${cafe.phone.replace(/\s+/g, "")}`}
                    className="hover:underline"
                  >
                    {cafe.phone}
                  </a>
                </Fact>
              )}
              {website && (
                <Fact icon={Globe}>
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Website
                  </a>
                </Fact>
              )}
            </ul>

            <div className="mt-6 grid gap-2">
              <a
                href={directionsUrl(cafe)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground transition hover:opacity-90"
              >
                <Navigation className="size-4" /> Get directions
              </a>
              <a
                href={placeUrl(cafe)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm transition hover:bg-sky/40"
              >
                See photos & reviews
              </a>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <SaveButton cafe={cafe} labelled />
              <ShareButton name={cafe.name} />
            </div>
          </div>

          <div className="mt-4 h-60 overflow-hidden rounded-3xl border border-border">
            <CafeMap cafes={pin} />
          </div>
        </aside>
      </div>

      <p className="mt-16 text-xs text-muted-foreground">
        Cafe data © OpenStreetMap contributors
      </p>

      {/* phone: always-visible actions */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <a
            href={directionsUrl(cafe)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm text-primary-foreground"
          >
            <Navigation className="size-4" /> Directions
          </a>
          <SaveButton cafe={cafe} labelled />
        </div>
      </div>
    </main>
  );
}