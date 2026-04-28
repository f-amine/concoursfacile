"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "~/lib/utils";
import {
  EyebrowLabel,
  SectionHeading,
  SectionLead,
} from "~/components/blocks/landing-primitives";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SectionWithMockupProps {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  imageSrc: string;
  reverseLayout?: boolean;
  label?: string;
}

const SectionWithMockup: React.FC<SectionWithMockupProps> = ({
  title,
  description,
  imageSrc,
  reverseLayout = false,
  label,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    const image = imageRef.current;
    const imageWrapper = imageWrapperRef.current;
    const orb = orbRef.current;
    const ribbon = ribbonRef.current;
    const text = textRef.current;
    if (!section || !image || !imageWrapper || !orb || !ribbon || !text) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance — text rises in, image scales in with a longer curve
        const textItems = text.querySelectorAll("[data-reveal]");
        gsap.from(textItems, {
          y: 28,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 90%", once: true },
        });

        gsap.from(image, {
          y: 60,
          scale: 0.94,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 90%", once: true },
        });

        // Scroll-linked vertical parallax on the image
        gsap.to(image, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        // Idle breathing on the glow orb
        gsap.to(orb, {
          scale: 1.18,
          opacity: 0.55,
          duration: 4.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // Ribbon drifts when section enters view — diagonal sweep
        gsap.fromTo(
          ribbon,
          { xPercent: reverseLayout ? 40 : -40, yPercent: 20, opacity: 0 },
          {
            xPercent: reverseLayout ? -20 : 20,
            yPercent: -15,
            opacity: 1,
            duration: 2.4,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 70%", once: true },
          },
        );
      });
    }, section);

    // Mouse 3D tilt — follows cursor over the image container
    const handleMove = (event: MouseEvent) => {
      const rect = imageWrapper.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(image, {
        rotationY: x * 8,
        rotationX: -y * 8,
        transformPerspective: 1200,
        duration: 0.7,
        ease: "power2.out",
      });
    };
    const handleLeave = () => {
      gsap.to(image, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.9,
        ease: "power3.out",
      });
    };
    imageWrapper.addEventListener("mousemove", handleMove);
    imageWrapper.addEventListener("mouseleave", handleLeave);

    return () => {
      imageWrapper.removeEventListener("mousemove", handleMove);
      imageWrapper.removeEventListener("mouseleave", handleLeave);
      ctx.revert();
    };
  }, [reverseLayout]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-24 md:py-32"
    >
      {/* Ambient background light — brand blue with a kiss of green */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: reverseLayout
            ? "radial-gradient(ellipse 60% 60% at 20% 50%, rgba(31,77,193,0.07), transparent 65%), radial-gradient(ellipse 30% 40% at 30% 75%, rgba(67,184,112,0.05), transparent 70%)"
            : "radial-gradient(ellipse 60% 60% at 80% 50%, rgba(31,77,193,0.07), transparent 65%), radial-gradient(ellipse 30% 40% at 70% 25%, rgba(67,184,112,0.05), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <div
          className={cn(
            "grid grid-cols-1 items-center gap-14 md:grid-cols-[1fr_1fr] md:gap-16 lg:gap-20",
            reverseLayout && "md:grid-flow-col-dense",
          )}
        >
          {/* Text column */}
          <div
            ref={textRef}
            className={cn(
              "flex max-w-xl flex-col gap-5",
              reverseLayout && "md:col-start-2",
            )}
          >
            {label ? (
              <EyebrowLabel data-reveal>{label}</EyebrowLabel>
            ) : null}
            <SectionHeading data-reveal>{title}</SectionHeading>
            <SectionLead data-reveal>{description}</SectionLead>
          </div>

          {/* Image column */}
          <div
            ref={imageWrapperRef}
            className={cn(
              "relative mx-auto w-full max-w-[520px]",
              reverseLayout && "md:col-start-1",
            )}
            style={{ perspective: "1200px" }}
          >
            {/* Breathing glow orb behind the image — brand blue */}
            <div
              ref={orbRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 translate-y-6 rounded-[48px] opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(31,77,193,0.45), transparent 60%)",
                filter: "blur(40px)",
              }}
            />

            {/* Drifting diagonal ribbon accent — green checkmark sweep */}
            <div
              ref={ribbonRef}
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-20 top-1/2 -z-10 h-px origin-center"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(67,184,112,0.55), rgba(31,77,193,0.45), transparent)",
                transform: "rotate(-8deg)",
              }}
            />

            {/* Image with 3D tilt */}
            <div
              ref={imageRef}
              className="relative overflow-hidden rounded-[32px] border border-[#1f4dc1]/12 shadow-[0_40px_90px_-25px_rgba(31,77,193,0.30),0_15px_40px_-15px_rgba(67,184,112,0.18)]"
              style={{
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              <div
                role="img"
                aria-label=""
                className="aspect-[3/4] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${imageSrc})` }}
              />

              {/* Subtle inner specular highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(130deg, rgba(255,255,255,0.5) 0%, transparent 35%)",
                }}
              />

              {/* Hairline border highlight on top edge — brand-tinted */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(31,77,193,0.45), transparent)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionWithMockup;
