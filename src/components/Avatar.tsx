import { avatarStyle } from "@/lib/social";

export function Avatar({
  name,
  hue,
  size = "md",
}: {
  name: string;
  hue: number;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";
  return (
    <div
      className={`${dims} flex shrink-0 items-center justify-center rounded-full font-display font-bold text-lime`}
      style={avatarStyle(hue)}
      aria-hidden
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
