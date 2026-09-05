// Redaktioneller Inhalt für die Sport-Landingpages.
//
// Zweck: Die Seiten bestanden aus einem Satz plus Eventliste. Das reicht weder
// jemandem, der die Sportart noch nicht kennt, noch einer Suchmaschine, die
// entscheiden soll, wofür die Seite steht.
//
// Bewusst zeitlos gehalten — Regelwerke, Verbände und Übertragungswege ändern
// sich selten. Keine amtierenden Champions, keine Termine, nichts, was in drei
// Monaten still veraltet. Aktuelle Daten kommen aus der events-Tabelle.

export type GuideSection = {
  heading: string;
  body: string;
};

export type SportGuide = {
  /** Zwei bis drei Sätze unter der Überschrift, vor der Eventliste. */
  lede: string;
  sections: GuideSection[];
};

export const SPORT_GUIDES: Record<string, SportGuide> = {
  MMA: {
    lede: "Mixed martial arts combines striking and grappling under one ruleset, which is why a fight can be decided by a knockout, a submission or the judges' scorecards. Most of the world's top fighters are spread across a handful of promotions that each run their own calendar.",
    sections: [
      {
        heading: "How a fight is decided",
        body: "Bouts run three five-minute rounds, or five for main events and title fights. A fight ends early by knockout, technical knockout, submission or a doctor stoppage. If it goes the distance, three judges score each round independently under the Unified Rules, with the round going to whoever did more damage and controlled where the fight took place. Weight classes run from strawweight up to heavyweight.",
      },
      {
        heading: "Who runs the major events",
        body: "The UFC holds the deepest roster and runs an event nearly every week, splitting them between numbered pay-per-views and Fight Nights. ONE Championship is the largest promotion in Asia and stages MMA alongside Muay Thai and kickboxing on the same cards. PFL runs a season-and-playoff format rather than one-off matchmaking. In Europe, OKTAGON, KSW and Cage Warriors draw the biggest crowds, and Cage Warriors in particular has a long record of producing fighters who go on to the UFC.",
      },
      {
        heading: "Where to watch",
        body: "Broadcast rights are split by region and change every few years, so the same card can sit behind a different service depending on where you are. Promotions increasingly sell directly through their own apps or through a single streaming partner per territory. Each event page on Fightbase lists the broadcaster we have on record for that card.",
      },
    ],
  },

  Boxing: {
    lede: "Boxing has no single governing body. Four sanctioning organisations hand out world titles, promoters build the cards, and broadcasters decide which fights reach an audience — which is why the biggest bouts often take years to arrange.",
    sections: [
      {
        heading: "Why there are four world champions",
        body: "The WBA, WBC, IBF and WBO each sanction their own world title in every weight class, so one division can hold four champions at once. A fighter who collects all four is called undisputed, which is rare and usually short-lived: the bodies require mandatory defences against their own top contenders, and a champion who takes a different fight instead is stripped. The Ring Magazine belt sits outside this system and is awarded editorially rather than sanctioned.",
      },
      {
        heading: "Who makes the fights",
        body: "Promoters hold the contracts and put the cards together. Matchroom and Queensberry dominate British boxing, Top Rank, Premier Boxing Champions and Golden Boy carry much of the American schedule, and Saudi-funded Riyadh Season has spent recent years buying fights across promotional lines that previously could not be made. Because a bout needs both sides' promoters and broadcasters to agree, announced fights routinely move or collapse.",
      },
      {
        heading: "Reading the schedule",
        body: "Major cards land on Saturday nights, timed for prime time in their home market — which means a US main event often starts in the early hours of Sunday in Europe. Undercards are announced piecemeal in the weeks beforehand, and a headline bout is not final until both fighters have made weight the day before.",
      },
    ],
  },

  "Muay Thai": {
    lede: "Muay Thai is Thailand's national sport and the most complete striking ruleset in combat sports, allowing punches, kicks, elbows, knees and the clinch. It is also the hardest schedule to follow, because the sport's home is a nightly stadium programme rather than a series of announced events.",
    sections: [
      {
        heading: "The art of eight limbs",
        body: "Fighters use fists, elbows, knees and shins, and the clinch is not broken up the way it is in kickboxing. Traditional stadium scoring rewards visible damage, balance and dominance rather than volume, and it weights the later rounds most heavily — which is why a fighter can lose the first two rounds and still win. Bouts open with the wai khru ram muay, a ritual dance honouring the fighter's teacher.",
      },
      {
        heading: "Stadiums and promotions",
        body: "Lumpinee and Rajadamnern in Bangkok are the sport's two historic stadiums and run cards most nights of the week. Rajadamnern World Series is their flagship Saturday production, using open scoring and a shorter format built for broadcast. ONE Championship stages Muay Thai world titles on its Fight Night and Friday Fights cards, also out of Lumpinee. Outside Thailand, Thai Fight, Yokkao and Enfusion carry the sport in Europe and Asia.",
      },
      {
        heading: "Why this calendar is short",
        body: "Most Muay Thai happens on a rolling nightly schedule that is set days ahead, not months, and individual bouts are often confirmed the same week. Listing every stadium card would bury the events that people actually plan around. We list the announced title fights and broadcast series instead, which is why this page is shorter than the MMA or boxing ones.",
      },
    ],
  },

  Kickboxing: {
    lede: "Kickboxing sits between boxing and Muay Thai: punches and kicks, but no elbows and no sustained clinch. The differences between rulesets matter more than in most sports, because the same fighter can look very different under K-1 rules than under Oriental rules.",
    sections: [
      {
        heading: "The rulesets",
        body: "K-1 rules — the format used by most major promotions — allow punches, kicks and knees, permit only a brief clinch, and cap knee strikes. Oriental rules sit closer to Muay Thai and allow more clinch work. Low kicks to the thigh are legal in both and are often what decides a fight late. Rounds are usually three minutes, with three rounds for regular bouts and five for titles.",
      },
      {
        heading: "Who runs the major events",
        body: "GLORY is the sport's leading promotion in Europe and runs both regular cards and one-night tournaments. ONE Championship stages kickboxing world titles alongside its MMA and Muay Thai bouts. K-1 remains the reference point in Japan, where the sport draws its largest arena crowds, and Enfusion runs a broad European circuit that has produced many of GLORY's later signings.",
      },
      {
        heading: "Tournaments and titles",
        body: "Kickboxing has kept the one-night tournament alive longer than most combat sports: eight fighters, three fights, one evening. Grand Prix events carry more weight than a standard title defence for exactly that reason, and they are usually announced further in advance than regular cards.",
      },
    ],
  },

  "Jiu-Jitsu": {
    lede: "Brazilian jiu-jitsu is decided on the ground, by submission or by points earned for improving position. The competitive calendar splits into two worlds: the tournament circuit run by the IBJJF, and invitational events built around individual matchups.",
    sections: [
      {
        heading: "Gi and no-gi",
        body: "In the gi, competitors wear the traditional jacket and trousers and can grip them — which slows the pace and opens up chokes that use the collar and sleeves. No-gi removes those grips, so the game moves faster and leans on body locks and leg entanglements. Most competitors train both, but the two are scored as separate divisions and reward different games.",
      },
      {
        heading: "How matches are scored",
        body: "IBJJF rules award points for takedowns, sweeps, guard passes, mount and back control, with an advantage recorded for a near-miss that did not quite complete. A submission ends the match regardless of the score. Competitors are divided by belt, age and weight, so a single championship runs hundreds of brackets over several days.",
      },
      {
        heading: "The major events",
        body: "The IBJJF runs the sport's championship structure — Worlds, Pans, Europeans and the No-Gi Worlds — across both gi and no-gi. ADCC is the most prestigious submission grappling event and is held every two years, using a scoring system that penalises passivity and rewards submission attempts. Polaris and the UFC Fight Pass Invitational build cards around single superfights rather than brackets.",
      },
    ],
  },

  Judo: {
    lede: "Judo is an Olympic sport governed worldwide by a single federation, which makes its calendar the most predictable in combat sports. Events feed a world ranking, and that ranking decides who qualifies for the Olympic Games.",
    sections: [
      {
        heading: "How a contest is won",
        body: "A throw that lands an opponent largely on their back with control scores ippon and ends the contest immediately. A less complete throw scores waza-ari, and two waza-ari add up to ippon. Contests can also be won by pinning for twenty seconds, or by submission from a strangle or an armlock. Penalties, called shido, are given for passivity and non-combativity, and three end the contest.",
      },
      {
        heading: "The World Judo Tour",
        body: "The International Judo Federation runs a tiered circuit. Grand Prix events sit at the entry level of the tour, Grand Slams rank above them, and the World Judo Masters is limited to the highest-ranked judoka in each weight class. The World Championships sit above all of them in every non-Olympic year. Points from each tier are weighted differently in the world ranking.",
      },
      {
        heading: "Why the ranking matters",
        body: "Olympic places are allocated by world ranking rather than a single qualifying tournament, so the tour events across the four-year cycle are the qualification process. That is why top judoka travel to Grand Slams that look unremarkable on paper — the points are the point.",
      },
    ],
  },

  Wrestling: {
    lede: "Wrestling is one of the oldest Olympic sports and runs three separate disciplines under one federation. Its international calendar is built around a Ranking Series that feeds the World Championships and, in turn, Olympic qualification.",
    sections: [
      {
        heading: "Three disciplines",
        body: "Freestyle allows attacks on the whole body, including leg attacks, and is contested by both men and women. Greco-Roman forbids any hold below the waist, which forces the action into upper-body throws and makes it the most explosive of the three. Women's wrestling follows freestyle rules. Each has its own weight classes and its own world titles.",
      },
      {
        heading: "How a bout is scored",
        body: "Two three-minute periods. Points come from takedowns, exposing an opponent's back, reversals and pushing an opponent out of the circle. A bout ends early by fall — both shoulders held to the mat — or by technical superiority once a wrestler leads by ten points in freestyle or eight in Greco-Roman.",
      },
      {
        heading: "The international calendar",
        body: "United World Wrestling runs a Ranking Series of tournaments through the year, with the World Championships as the season's final event and the last chance to earn ranking points. Continental championships for Europe, Asia, Africa, Oceania and the Americas sit alongside them. Seeding at the World Championships comes from ranking points, which is why wrestlers who have already qualified still enter mid-season events.",
      },
    ],
  },

  Karate: {
    lede: "Competitive karate under the World Karate Federation is split into two very different disciplines: kumite, which is sparring, and kata, which is a solo form judged on execution. The Karate 1 circuit is where the world rankings are decided.",
    sections: [
      {
        heading: "Kumite and kata",
        body: "Kumite is fought to controlled contact and scored on technique: one point for a punch, two for a kick to the body, three for a kick to the head or for scoring after a takedown. Excessive contact is penalised, so the sport rewards precision and timing rather than power. Kata is performed solo — a set sequence of movements against imagined opponents — and judged on technical accuracy and athletic quality, with competitors going head to head and the better performance advancing.",
      },
      {
        heading: "The Karate 1 circuit",
        body: "The WKF runs two tiers. Premier League events are the top level and draw the strongest fields. Series A events sit below them and award fewer ranking points, which makes them the place where newer competitors build a ranking. Both feed the world rankings that determine seeding at the World Championships and continental events.",
      },
      {
        heading: "Karate and the Olympics",
        body: "Karate appeared at the Olympic Games once, in Tokyo in 2020, and was not included in Paris 2024 or Los Angeles 2028. The WKF continues to run its own world championship cycle and the Karate 1 circuit independently of the Olympic programme, and the sport's ranking system remains built around them.",
      },
    ],
  },

  Taekwondo: {
    lede: "Olympic taekwondo is a kicking sport, scored electronically and fought at a pace that rewards speed and reach over power. World Taekwondo runs the international calendar, and its Grand Prix series is the highest tier.",
    sections: [
      {
        heading: "How scoring works",
        body: "Competitors wear instrumented body protectors and headgear, and impacts are registered by a Protector and Scoring System rather than by judges alone. A body kick scores two points, a head kick three, and a turning kick adds a bonus — so a spinning head kick is worth five. Punches to the body score one but are rarely decisive. Judges still rule on technical points, and video review is available on request.",
      },
      {
        heading: "The Grand Prix series",
        body: "The Grand Prix is limited to the highest-ranked athletes in each Olympic weight class and runs as a short series through the year, closing with the Grand Prix Final. Grand Prix Challenge events sit one tier below and offer a route in for athletes outside the top rankings. The World Championships run on their own cycle alongside the series.",
      },
      {
        heading: "Olympic weight classes",
        body: "The Olympic programme uses four weight classes per gender, fewer than the World Championships, which run eight. That compression is why some world champions have no Olympic division that fits them, and why athletes move weight in the years before a Games.",
      },
    ],
  },
};
