/** Eyebrow + display h2 used by every zone section. The h2 id labels the section. */
export function SectionHeading({
  id,
  eyebrow,
  title,
}: {
  id: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="eyebrow">{eyebrow}</p>
      <h2
        id={`${id}-title`}
        className="font-display text-xl leading-snug tracking-[0.02em] text-balance md:text-2xl"
      >
        {title}
      </h2>
    </div>
  );
}
