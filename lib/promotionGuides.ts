// Redaktioneller Inhalt für die Promotion-Landingpages.
//
// Gegenstück zu lib/sportGuides.ts: dort geht es um die Sportart, hier um den
// Veranstalter. Wer nach "OKTAGON" sucht, will wissen, wer das ist, wie deren
// Kalender aufgebaut ist und wo man das sieht — nicht nur eine Terminliste.
//
// Gleiche Regel wie bei den Sport-Guides: keine amtierenden Champions, keine
// Termine, keine Zahlen, die nächstes Jahr falsch sind. Struktur, Regelwerk und
// Kalenderlogik ändern sich selten — genau das steht hier drin.

import type { GuideSection } from "./sportGuides";

export type PromotionGuide = {
  /** Zwei bis drei Sätze unter der Überschrift, vor der Eventliste. */
  lede: string;
  sections: GuideSection[];
};

export const PROMOTION_GUIDES: Record<string, PromotionGuide> = {
  UFC: {
    lede: "The UFC is the largest mixed martial arts promotion in the world and holds the deepest roster in every weight class. It runs an event most weekends of the year, which makes its schedule the backbone of the MMA calendar.",
    sections: [
      {
        heading: "How the calendar is structured",
        body: "Events come in two formats. Numbered cards — UFC 300, UFC 301 and so on — are the pay-per-view shows, usually built around two or three title fights and staged in large arenas. Fight Nights carry the rest of the schedule and are included with a regular subscription in most markets. A third tier, the Contender Series, runs as a talent showcase rather than a public event: fighters compete for a roster contract instead of a ranking.",
      },
      {
        heading: "Rules and rankings",
        body: "Bouts follow the Unified Rules of MMA: three five-minute rounds, five for main events and title fights, with three judges scoring each round. Divisions run from strawweight to heavyweight for men and strawweight to bantamweight for women. Rankings are compiled by a panel of media voters rather than by a sanctioning body, so they guide matchmaking without binding it — the promotion books the fights it wants to sell.",
      },
      {
        heading: "Where to watch",
        body: "Broadcast rights are sold per territory and are renegotiated every few years, so the same card can sit behind a different service depending on where you are. Fight weeks follow a fixed rhythm: press conference midweek, weigh-ins the morning before, prelims a few hours ahead of the main card. Each event page on Fightbase lists the broadcaster we have on record.",
      },
    ],
  },

  "ONE Championship": {
    lede: "ONE Championship is the largest combat sports promotion in Asia and the only major organisation that puts mixed martial arts, Muay Thai, kickboxing and submission grappling on the same card. Founded in Singapore in 2011, it built its roster around Thai and Japanese striking talent rather than importing an existing MMA model.",
    sections: [
      {
        heading: "Four sports, one event",
        body: "A single ONE card can open with a grappling match, move through Muay Thai and kickboxing bouts and finish with an MMA title fight. Each discipline keeps its own ruleset, but ONE runs its Muay Thai in four-ounce open-finger gloves over three rounds rather than the traditional five in boxing gloves — a deliberate change that produces more finishes and less scoring by accumulation. Grappling bouts are submission-only with no points.",
      },
      {
        heading: "Series and venues",
        body: "The ONE Fight Night series is the flagship, scheduled so that a Bangkok event lands in prime time for a North American audience. Lumpinee Stadium in Bangkok serves as the regular home for the numbered Friday cards, with larger shows staged in arenas across Asia and, increasingly, in the United States and Japan. Weight is managed by hydration testing rather than a single pre-fight weigh-in, which rules out the extreme cuts common elsewhere.",
      },
      {
        heading: "Following the schedule",
        body: "ONE announces cards in tranches and frequently adds bouts in the final weeks, so a card seen a month out is rarely the card that runs. Regional broadcast partners differ substantially between Asia, Europe and North America. Fightbase lists the confirmed bouts and the broadcaster on record for each event.",
      },
    ],
  },

  OKTAGON: {
    lede: "OKTAGON MMA is the dominant promotion in the Czech Republic and Slovakia and now the biggest MMA operation in Central Europe. It grew from small hall shows into sold-out arenas and football stadiums in under a decade, and has spent recent years pushing into Germany and the United Kingdom.",
    sections: [
      {
        heading: "What sets it apart",
        body: "OKTAGON built its audience on production and storytelling rather than on importing established names, and it runs a genuine home-crowd circuit: Prague, Brno, Ostrava and Bratislava carry the core of the calendar, with German dates in Frankfurt, Oberhausen and Düsseldorf added as the promotion expanded. Its summer stadium shows are among the largest MMA events staged anywhere in Europe by attendance.",
      },
      {
        heading: "The tournament format",
        body: "Alongside regular numbered events, OKTAGON runs a season-long elimination tournament that pays out a single large prize to the winner. Eight fighters in a weight class enter, the bracket plays out across several events over the year, and the final lands on a major card. It gives the calendar a through-line that one-off matchmaking does not, and it is the main reason a given event can matter beyond its own headline bout.",
      },
      {
        heading: "Where to watch",
        body: "Events are sold as pay-per-view in the Czech and Slovak markets through the promotion's own platform, with separate arrangements for German, British and international viewers. Announcement-to-event lead times are short compared with the UFC, and undercards fill in over the final weeks.",
      },
    ],
  },

  GLORY: {
    lede: "GLORY is the leading kickboxing promotion outside Japan, built on the Dutch tradition that produced most of the sport's modern heavyweight generation. It stages regular numbered events plus one-night Grand Prix tournaments, mostly in the Netherlands and Germany.",
    sections: [
      {
        heading: "The ruleset",
        body: "GLORY bouts run three three-minute rounds, five for title fights, under a ruleset that allows punches, kicks and knees but not elbows. The clinch is broken almost immediately, which keeps the pace high and separates the sport clearly from Muay Thai. An extra round is fought if the judges score a non-title bout even. Divisions run from flyweight to heavyweight, with the heavyweight and lightweight classes historically the deepest.",
      },
      {
        heading: "Grand Prix nights",
        body: "The Grand Prix format puts four or eight fighters in a bracket decided over a single evening — a fighter has to win two or three times in a few hours. It is the format K-1 made famous, and it produces a different kind of matchmaking than a normal card: pacing and damage management matter as much as the individual matchup. These nights are usually the promotion's biggest events of the year.",
      },
      {
        heading: "Following the schedule",
        body: "GLORY runs roughly one event a month, announced a couple of months in advance, with the full card confirmed closer to the date. Streaming is handled through the promotion's own service in most territories, with regional television partners in the Netherlands and neighbouring markets.",
      },
    ],
  },

  "K-1": {
    lede: "K-1 is the Japanese promotion that turned kickboxing into a stadium sport in the 1990s and gave the sport its dominant tournament format. After a financial collapse and a rebuild, it now runs primarily in Japan with a focus on the lighter weight classes.",
    sections: [
      {
        heading: "The original format",
        body: "K-1's founding idea was a one-night, eight-man heavyweight tournament open to fighters from any striking discipline — karate, Muay Thai, boxing, kickboxing — under a single unified ruleset. Three rounds, no elbows, minimal clinch. That format defined competitive kickboxing for two decades, and every Grand Prix run anywhere since is a descendant of it.",
      },
      {
        heading: "The modern promotion",
        body: "The original organisation ceased operating in the early 2010s. The relaunched K-1 kept the name, the tournament structure and the ruleset but shifted its centre of gravity from international heavyweights to Japanese fighters in the lighter divisions, where the domestic talent pool is strongest. Krush operates as the feeder circuit, and fighters typically move up from there.",
      },
      {
        heading: "Following the schedule",
        body: "Events are staged almost entirely in Japan, with the largest cards at Saitama Super Arena and the Tokyo halls. Cards are announced a few weeks out and international streaming access varies considerably by event — this is the promotion in this list where checking the broadcaster before the day matters most.",
      },
    ],
  },

  "Matchroom Boxing": {
    lede: "Matchroom is one of the two promoters that shape the British boxing calendar and a significant force internationally. It holds contracts with a large stable of fighters and puts on cards across the UK, the United States and the Middle East.",
    sections: [
      {
        heading: "What a promoter actually does",
        body: "In boxing there is no league and no central schedule. Promoters hold fighter contracts, negotiate with sanctioning bodies over titles, sell the event to a broadcaster and put the card together. That means a fight only happens when both fighters' promoters and both broadcasters agree — the reason marquee bouts take years to arrange and announced fights routinely collapse.",
      },
      {
        heading: "The Matchroom calendar",
        body: "Cards run most months, typically on a Saturday night timed for prime time in the home market. Big domestic nights land in British arenas; American cards are built around the fighters signed on that side. Summer brings smaller outdoor shows staged at the company's own site rather than in an arena, which serve as a proving ground for prospects rather than a title-fight venue.",
      },
      {
        heading: "Titles and where to watch",
        body: "Matchroom fighters compete for belts sanctioned by the WBA, WBC, IBF and WBO, plus domestic and European titles that function as the ladder beneath them. The promotion sells its output globally through a single streaming partner rather than territory-by-territory, which makes it one of the more predictable schedules to follow. A headline bout is not final until both fighters make weight the day before.",
      },
    ],
  },

  "Queensberry Promotions": {
    lede: "Queensberry is Frank Warren's promotional company and the long-standing counterweight to Matchroom in British boxing. It has promoted at the top of the domestic sport for decades and holds contracts with a substantial share of Britain's champions and prospects.",
    sections: [
      {
        heading: "Where it sits in the sport",
        body: "British boxing is effectively split between two promotional stables, and the fights fans most want are frequently the ones that cross that line. Cross-promotional cards do happen, but each one is negotiated individually, and the broadcast split is usually the hardest part. Understanding which side a fighter is on explains most of why a given matchup exists or does not.",
      },
      {
        heading: "The calendar",
        body: "Queensberry runs regular cards in British arenas, with the largest nights in London, Manchester and Cardiff, plus dates staged in the Middle East where funding has drawn a share of the sport's biggest events. Shows are built around one or two headline bouts with a supporting card of domestic titles and prospects.",
      },
      {
        heading: "Following it",
        body: "Cards are announced two to three months out with the undercard filled in piecemeal. Broadcast in the UK runs through a subscription television partner, with international rights sold separately. As everywhere in boxing, the fight is real once the weigh-in is done.",
      },
    ],
  },

  "Riyadh Season": {
    lede: "Riyadh Season is Saudi Arabia's entertainment programme, and since it entered boxing it has become the single biggest force in how the sport's major fights get made. Its significance is not that it promotes fighters — it does not — but that it pays both sides enough to bypass the promotional deadlock that had blocked those fights for years.",
    sections: [
      {
        heading: "Why it changed the sport",
        body: "Boxing's biggest bouts historically failed because rival promoters and broadcasters could not agree on terms. Riyadh Season sidesteps that by funding the event outright and buying the participation of fighters from opposing stables, then licensing the broadcast. Cards built this way often stack several genuinely competitive world-level fights on one night, which conventional economics rarely allows.",
      },
      {
        heading: "Card formats",
        body: "Alongside standard cards, Riyadh Season has run team-versus-team events in which fighters from two promotional camps face each other across the whole night, with the promotions themselves framed as the competitors. Events are staged mainly in Riyadh, with dates in Los Angeles, London and New York as the programme expanded outside Saudi Arabia.",
      },
      {
        heading: "Following the schedule",
        body: "Cards are announced further ahead than most boxing events and change more than most, since assembling fighters from several stables means several separate negotiations. Broadcast partners differ per event and per territory. Fightbase lists bouts only once the promotion has confirmed them.",
      },
    ],
  },

  IBJJF: {
    lede: "The International Brazilian Jiu-Jitsu Federation runs the sport's main competitive circuit and sets the ruleset most gi tournaments worldwide follow. Its events are open-entry championships with hundreds of brackets, not invitational shows.",
    sections: [
      {
        heading: "How the tournaments work",
        body: "Competitors are divided by belt rank, age group, weight class and gender, so a single championship runs an enormous number of separate brackets over several days. Black belt adult divisions are the ones that draw attention, but they sit on the same schedule as every other bracket. Each weight class also feeds an open-weight division, where the winner is decided regardless of size — traditionally the most prestigious title of the event.",
      },
      {
        heading: "The scoring system",
        body: "Matches are won by submission or, failing that, on points: two for a takedown or sweep, three for passing the guard, four for mount or taking the back. Advantages break ties when neither competitor scores. The system rewards positional progression toward a dominant position rather than submission attempts alone, which is what distinguishes IBJJF competition from submission-only rulesets.",
      },
      {
        heading: "The major championships",
        body: "The circuit is built around a handful of majors: the World Championship in California, the Pan Championship, the European Open in Lisbon, and separate No-Gi editions of each. These are the events where world titles are decided; the rest of the calendar is a dense schedule of regional opens that competitors use to qualify and accumulate ranking points.",
      },
    ],
  },

  ADCC: {
    lede: "The Abu Dhabi Combat Club runs the most prestigious no-gi grappling championship in the world. It is held only every two years, which makes qualification itself a multi-year process and each edition a genuine landmark rather than another date on a circuit.",
    sections: [
      {
        heading: "The ruleset",
        body: "ADCC matches are long and split into two halves. In the first half no points are awarded at all — only submissions and penalties count — which removes any incentive to build an early lead and sit on it. Points come into play only in the second half. The format deliberately pushes competitors toward finishing rather than managing a scoreline, and it is the main reason ADCC matches look different from tournament jiu-jitsu.",
      },
      {
        heading: "Getting in",
        body: "Entry is by invitation or through continental trials held across the world in the run-up to the championship. Invitations go to established names; everyone else fights through a one-day trial bracket for a single qualifying spot. Alongside the weight divisions there is an absolute division open to any competitor regardless of size, and a superfight in which the previous edition's champion defends against a chosen challenger.",
      },
      {
        heading: "Why the gap between editions matters",
        body: "Because the championship runs biennially, the field reshuffles substantially between editions and competitors plan years around it. In the intervening period the same athletes appear across other grappling promotions, so an ADCC year concentrates attention in a way the rest of the sport's calendar does not.",
      },
    ],
  },

  IJF: {
    lede: "The International Judo Federation governs the sport worldwide and runs the World Judo Tour, the circuit on which Olympic qualification is decided. Unlike a promotion, it does not sign athletes — national federations enter them, and results feed a single world ranking list.",
    sections: [
      {
        heading: "The tour structure",
        body: "The World Judo Tour is tiered. Grand Prix events sit at the entry level, Grand Slams above them, and the Masters is restricted to the top-ranked judoka in each weight class. The World Championships sit above all of them. Each tier awards more ranking points than the one below, so where an athlete competes matters as much as how they place.",
      },
      {
        heading: "Why the ranking is the point",
        body: "Olympic qualification in judo runs through the world ranking list rather than a separate qualifying tournament. Athletes accumulate points across a two-year window, which is why the tour calendar fills up in the run-up to a Games and why judoka travel to events that would otherwise not be worth the trip. National quotas cap how many athletes one country can send per weight class regardless of ranking.",
      },
      {
        heading: "How a match is won",
        body: "A contest is won outright by ippon — a throw landing an opponent largely on their back with control, an immobilisation held for twenty seconds, or a submission by strangle or armlock. A lesser throw scores waza-ari, and two of those equal ippon. Penalties are given for passivity and for prohibited grips or techniques; three end the contest. Tied contests go to golden score, sudden death with no time limit.",
      },
    ],
  },

  UWW: {
    lede: "United World Wrestling is the sport's international governing body, running the World Championships, the Ranking Series and the qualification path to the Olympics across three separate styles.",
    sections: [
      {
        heading: "Three styles, one federation",
        body: "Freestyle allows attacks on the legs and the use of the legs to trip or hold. Greco-Roman prohibits both entirely — everything happens above the waist, which is why it produces the high-amplitude throws the style is known for. Women's wrestling is contested in freestyle. All three run their own weight classes and their own world titles, and the World Championships covers all of them across a single event week.",
      },
      {
        heading: "Scoring",
        body: "Bouts are two three-minute periods. Points come from takedowns, exposing an opponent's back to the mat, reversals and pushing an opponent out of the circle, with more points for higher-amplitude throws. A bout ends early on a pin, or by technical superiority once the points gap reaches ten in freestyle or eight in Greco-Roman. If the score is level, criteria decide it — the wrestler who scored the highest-value single move wins.",
      },
      {
        heading: "The calendar",
        body: "The season builds through Ranking Series events and continental championships toward the World Championships. In Olympic cycles, dedicated qualification tournaments allocate the remaining places by weight class, and those events carry far more weight than their tier suggests. Entries come from national federations rather than from the athletes directly.",
      },
    ],
  },

  "World Taekwondo": {
    lede: "World Taekwondo governs the Olympic form of the sport and runs the international competition circuit, including the Grand Prix series and the World Championships. It is the body whose ranking determines who qualifies for the Games.",
    sections: [
      {
        heading: "How scoring works",
        body: "Competitors wear electronic body protectors and headgear that register valid contact automatically, with judges handling technical points that sensors cannot assess. Body kicks score more than punches, head kicks more than body kicks, and spinning techniques add a bonus — which is why the sport rewards high and turning kicks so heavily. Three rounds of two minutes, with an instant video review each side may request.",
      },
      {
        heading: "The competition circuit",
        body: "The Grand Prix series is restricted to the highest-ranked athletes in each Olympic weight class and carries the most ranking points outside the World Championships. Open tournaments across each continent make up the rest of the calendar and are where the ranking is built. Olympic weight categories are fewer than the world championship categories, so athletes often compete in one division domestically and another internationally.",
      },
      {
        heading: "Qualification",
        body: "Olympic places are allocated through the world ranking and through continental qualification tournaments, with each country limited in how many athletes it can enter per weight class. As in judo, this makes the ordinary tour calendar consequential: results at a routine open two years out can decide who is in the field at the Games.",
      },
    ],
  },

  "WKF Karate 1": {
    lede: "Karate 1 is the World Karate Federation's international circuit, comprising the Premier League and the second-tier Series A. It is the main competitive stage for sport karate and the source of the world ranking.",
    sections: [
      {
        heading: "Kumite and kata",
        body: "Every event runs two entirely different competitions. Kumite is sparring, contested by weight class with controlled contact. Kata is a solo performance of a set form, scored by judges on technical execution and athletic performance against the recognised standard for that form. Both award world ranking points and both have individual and team versions.",
      },
      {
        heading: "How kumite is scored",
        body: "Three point values apply: one for a punch to the body or head, two for a kick to the body, three for a kick to the head or for a score following a takedown. Excessive contact is penalised — control is part of the technique, not incidental to it. A bout ends early if one competitor establishes an eight-point lead; otherwise the higher score after the time limit wins, and the first competitor to score breaks a tie.",
      },
      {
        heading: "The circuit",
        body: "Premier League events are the top tier and carry the most ranking points; Series A events sit below them and are where competitors build toward Premier League entry. The World Championships sit above both. Karate appeared at the Olympic Games in Tokyo and was not retained on the programme afterwards, so unlike judo or taekwondo this circuit is not currently an Olympic qualification path — the WKF calendar is the sport's competitive summit in its own right.",
      },
    ],
  },
};
