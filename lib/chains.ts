import chains from "@/data/chains.json";

const LIST = chains as unknown as { match: string[] }[];

export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// one key per chain: all name variants listed in data/chains.json share a key
export function chainKey(name: string) {
  const n = norm(name);
  const hit = LIST.find((c) => c.match.includes(n));
  return hit ? hit.match[0] : n;
}