import type { ComponentPropsWithoutRef, ReactNode } from "react";

/* Recurring landing micro-patterns. Extracted so every section pulls from the
 * same source instead of re-implementing the eyebrow pill / display heading
 * inline. Each section was its own slightly-different copy until polish. */

const HUE_STYLE = {
  blue: {
    border: "border-[#1f4dc1]/20",
    bg: "bg-[#1f4dc1]/[0.06]",
    text: "text-[#1f4dc1]",
  },
  green: {
    border: "border-[#43b870]/25",
    bg: "bg-[#43b870]/[0.10]",
    text: "text-[#236d44]",
  },
} as const;

type EyebrowLabelProps = ComponentPropsWithoutRef<"span"> & {
  hue?: "blue" | "green";
  children: ReactNode;
};

export function EyebrowLabel({
  children,
  hue = "blue",
  className,
  ...rest
}: EyebrowLabelProps) {
  const tone = HUE_STYLE[hue];
  return (
    <span
      {...rest}
      className={`inline-flex rounded-full border px-4 py-1 text-[11px] font-medium uppercase tracking-[0.25em] ${tone.border} ${tone.bg} ${tone.text} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

type SectionHeadingProps = ComponentPropsWithoutRef<"h2"> & {
  children: ReactNode;
};

export function SectionHeading({
  children,
  className,
  ...rest
}: SectionHeadingProps) {
  return (
    <h2
      {...rest}
      className={`text-3xl font-semibold leading-[1.1] tracking-tight text-[#0b1530] sm:text-4xl lg:text-[3.25rem] ${className ?? ""}`}
    >
      {children}
    </h2>
  );
}

type SectionLeadProps = ComponentPropsWithoutRef<"p"> & {
  children: ReactNode;
};

export function SectionLead({
  children,
  className,
  ...rest
}: SectionLeadProps) {
  return (
    <p
      {...rest}
      className={`text-base leading-relaxed text-[#5b6b8a] sm:text-lg ${className ?? ""}`}
    >
      {children}
    </p>
  );
}
