import { BRAND } from "@/lib/brand";

export function Wordmark({ className = "" }: { className?: string }) {
  const [first, ...rest] = BRAND.split(" ");

  return (
    <span className={`font-display ${className}`}>
      <span className="font-semibold tracking-tight">{first}</span>
      {rest.length > 0 && (
        <span className="ml-[0.25em] italic text-accent">{rest.join(" ")}</span>
      )}
    </span>
  );
}