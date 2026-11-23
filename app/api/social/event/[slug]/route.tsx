import { getEventBySlug } from "@/lib/eventsDb";
import { supabase } from "@/lib/supabaseClient";
import { storyCard, type FighterPhoto } from "@/lib/socialCard";

// Ein Event als Hochformat-Bild fuer Story, Reel und TikTok (1080 x 1920).
//
//   /api/social/event/<slug>          englisch
//   /api/social/event/<slug>?lang=de  deutsch
//
// Gesammelt mit Bildunterschrift unter /admin/social.

export const revalidate = 3600;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const lang = new URL(req.url).searchParams.get("lang") === "de" ? "de" : "en";
  const event = await getEventBySlug(slug);
  if (!event) return new Response("Not found", { status: 404 });

  let people: FighterPhoto[] = [];
  if (event.fighters) {
    const { data } = await supabase
      .from("fighters")
      .select("name, photo_url, photo_credit")
      .in("name", event.fighters);
    people = (data ?? []).map((f) => ({
      name: f.name,
      photoUrl: f.photo_url,
      credit: f.photo_credit,
    }));
  }

  const res = await storyCard(event, people, lang);
  res.headers.set(
    "Content-Disposition",
    `inline; filename="fightbase-${slug}${lang === "de" ? "-de" : ""}.png"`
  );
  return res;
}
