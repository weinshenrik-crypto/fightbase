import { supabase } from "@/lib/supabaseClient";
import { allFighterNames, fighterSlug, upcomingFightsFor } from "@/lib/events";
import { getEvents } from "@/lib/eventsDb";
import { ogCard, loadOgAssets, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

// Die Vorschaukarte eines Fighterprofils.
//
// Die Figur bekommt dieselbe Farbe wie auf der Seite selbst (nameHue aus dem
// Namen) — wer Profil und geteilte Karte nebeneinander sieht, erkennt
// denselben Menschen wieder. Ein Foto steht hier bewusst nicht: siehe
// CLAUDE.md, "Nicht tun".

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Fightbase fighter profile";
export const revalidate = 3600;

export async function generateStaticParams() {
  const events = await getEvents();
  const eventSlugs = allFighterNames(events).map((name) => fighterSlug(name));
  const { data } = await supabase.from("fighters").select("slug");
  const dbSlugs = (data ?? []).map((f) => f.slug).filter(Boolean) as string[];
  return Array.from(new Set([...eventSlugs, ...dbSlugs])).map((slug) => ({
    slug,
  }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const assets = await loadOgAssets();

  const events = await getEvents();
  const { data } = await supabase
    .from("fighters")
    .select("name, sport, nationality")
    .eq("slug", slug)
    .maybeSingle();
  const name =
    data?.name ?? allFighterNames(events).find((n) => fighterSlug(n) === slug);

  if (!name) {
    return ogCard(
      {
        headline: "Fightbase",
        byline: "Combat sports events calendar",
        watermark: "Fightbase",
      },
      assets
    );
  }

  // Der naechste angekuendigte Kampf, falls es einen gibt. Erfunden wird
  // nichts: Steht keiner an, bleibt die Zeile weg.
  const next = upcomingFightsFor(events, name)[0];
  const byline = next
    ? `Next: ${next.main} · ${next.promotion}`
    : "Upcoming fights on Fightbase";

  return ogCard(
    {
      eyebrow: [data?.sport, data?.nationality].filter(Boolean).join(" · ").toUpperCase() || "FIGHTER",
      headline: name,
      byline,
      // Ohne hinterlegte Sportart bleibt der Hintergrund leer: "FIGHTBASE"
      // stuende sonst direkt ueber dem FIGHTBASE im Fuss. Die Figur traegt
      // die Karte dann allein.
      watermark: data?.sport ?? undefined,
      figures: [name],
    },
    assets
  );
}
