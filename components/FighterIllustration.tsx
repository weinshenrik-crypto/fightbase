import { nameHue } from "@/lib/events";

export default function FighterIllustration({
  name,
  size = 44,
  photoUrl,
}: {
  name: string;
  size?: number;
  photoUrl?: string | null;
}) {
  const hue = nameHue(name);

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          objectFit: "cover",
          border: `1px solid hsl(${hue}, 40%, 32%)`,
        }}
        className="rounded-full shrink-0"
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        background: `hsl(${hue}, 40%, 20%)`,
        border: `1px solid hsl(${hue}, 40%, 32%)`,
      }}
      className="rounded-full flex items-center justify-center shrink-0 overflow-hidden"
    >
      <div
        style={{
          width: "78%",
          height: "78%",
          backgroundColor: `hsl(${hue}, 70%, 68%)`,
          WebkitMaskImage: "url(/fighter-mask.png)",
          maskImage: "url(/fighter-mask.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    </div>
  );
}
