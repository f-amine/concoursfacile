"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
  type SVGProps,
} from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  type Transition,
  type VariantLabels,
  type Target,
  type TargetAndTransition,
  type Variants,
} from "framer-motion";
import Link from "next/link";

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface RotatingTextProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof motion.span>,
    "children" | "transition" | "initial" | "animate" | "exit"
  > {
  texts: string[];
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | VariantLabels | TargetAndTransition;
  exit?: Target | VariantLabels;
  animatePresenceMode?: "sync" | "wait";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "characters" | "words" | "lines" | (string & {});
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2200,
      staggerDuration = 0.01,
      staggerFrom = "last",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    },
    ref,
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        try {
          const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
          return Array.from(segmenter.segment(text), (segment) => segment.segment);
        } catch (error) {
          console.error("Intl.Segmenter failed, falling back to simple split:", error);
          return text.split("");
        }
      }
      return text.split("");
    };

    const elements = useMemo(() => {
      const currentText: string = texts[currentTextIndex] ?? "";
      if (splitBy === "characters") {
        const words = currentText.split(/(\s+)/);
        let charCount = 0;
        return words
          .filter((part) => part.length > 0)
          .map((part) => {
            const isSpace = /^\s+$/.test(part);
            const chars = isSpace ? [part] : splitIntoCharacters(part);
            const startIndex = charCount;
            charCount += chars.length;
            return { characters: chars, isSpace: isSpace, startIndex: startIndex };
          });
      }
      if (splitBy === "words") {
        return currentText
          .split(/(\s+)/)
          .filter((word) => word.length > 0)
          .map((word, i) => ({
            characters: [word],
            isSpace: /^\s+$/.test(word),
            startIndex: i,
          }));
      }
      if (splitBy === "lines") {
        return currentText.split("\n").map((line, i) => ({
          characters: [line],
          isSpace: false,
          startIndex: i,
        }));
      }
      return currentText.split(splitBy).map((part, i) => ({
        characters: [part],
        isSpace: false,
        startIndex: i,
      }));
    }, [texts, currentTextIndex, splitBy]);

    const totalElements = useMemo(
      () => elements.reduce((sum, el) => sum + el.characters.length, 0),
      [elements],
    );

    const getStaggerDelay = useCallback(
      (index: number, total: number): number => {
        if (total <= 1 || !staggerDuration) return 0;
        const stagger = staggerDuration;
        switch (staggerFrom) {
          case "first":
            return index * stagger;
          case "last":
            return (total - 1 - index) * stagger;
          case "center": {
            const center = (total - 1) / 2;
            return Math.abs(center - index) * stagger;
          }
          case "random":
            return Math.random() * (total - 1) * stagger;
          default:
            if (typeof staggerFrom === "number") {
              const fromIndex = Math.max(0, Math.min(staggerFrom, total - 1));
              return Math.abs(fromIndex - index) * stagger;
            }
            return index * stagger;
        }
      },
      [staggerFrom, staggerDuration],
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        onNext?.(newIndex);
      },
      [onNext],
    );

    const next = useCallback(() => {
      const nextIndex =
        currentTextIndex === texts.length - 1
          ? loop
            ? 0
            : currentTextIndex
          : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const prevIndex =
        currentTextIndex === 0
          ? loop
            ? texts.length - 1
            : currentTextIndex
          : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
      },
      [texts.length, currentTextIndex, handleIndexChange],
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) handleIndexChange(0);
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
      next,
      previous,
      jumpTo,
      reset,
    ]);

    useEffect(() => {
      if (!auto || texts.length <= 1) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto, texts.length]);

    return (
      <motion.span
        className={cn(
          "relative inline-flex flex-wrap whitespace-pre-wrap pb-[10px] align-bottom",
          mainClassName,
        )}
        {...rest}
        layout
      >
        <span className="sr-only">{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.div
            key={currentTextIndex}
            className={cn(
              "relative inline-flex flex-wrap",
              splitBy === "lines"
                ? "w-full flex-col items-start"
                : "flex-row items-baseline",
            )}
            layout
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {elements.map((elementObj, elementIndex) => (
              <span
                key={elementIndex}
                className={cn(
                  "inline-flex",
                  splitBy === "lines" ? "w-full" : "",
                  splitLevelClassName,
                )}
                style={{ whiteSpace: "pre" }}
              >
                {elementObj.characters.map((char, charIndex) => {
                  const globalIndex = elementObj.startIndex + charIndex;
                  return (
                    <motion.span
                      key={`${char}-${charIndex}`}
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(globalIndex, totalElements),
                      }}
                      className={cn(
                        "inline-block leading-none tracking-tight",
                        elementLevelClassName,
                      )}
                    >
                      {char === " " ? " " : char}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    );
  },
);
RotatingText.displayName = "RotatingText";

const ShinyText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => (
  <span className={cn("relative inline-block overflow-hidden", className)}>
    {text}
    <span
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(90deg, transparent, rgba(31,77,193,0.18), transparent)",
        animation: "shine 2s infinite linear",
        opacity: 0.7,
        pointerEvents: "none",
      }}
    />
  </span>
);

const ChevronDownIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="ml-1 inline-block h-3 w-3 transition-transform duration-200 group-hover:rotate-180"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const MenuIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-6 w-6"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const CloseIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-6 w-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

interface NavLinkProps {
  href?: string;
  children: ReactNode;
  hasDropdown?: boolean;
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

const NavLink: React.FC<NavLinkProps> = ({
  href = "#",
  children,
  hasDropdown = false,
  className = "",
  onClick,
}) => (
  <motion.a
    href={href}
    onClick={onClick}
    className={cn(
      "group relative flex items-center py-1 text-sm font-medium text-[#3d4a6b] transition-colors duration-200 hover:text-[#1f4dc1]",
      className,
    )}
    whileHover="hover"
  >
    {children}
    {hasDropdown && <ChevronDownIcon />}
    {!hasDropdown && (
      <motion.div
        className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-[#1f4dc1]"
        variants={{
          initial: { scaleX: 0, originX: 0.5 },
          hover: { scaleX: 1, originX: 0.5 },
        }}
        initial="initial"
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    )}
  </motion.a>
);

interface Dot {
  x: number;
  y: number;
  baseColor: string;
  targetOpacity: number;
  currentOpacity: number;
  opacitySpeed: number;
  baseRadius: number;
  currentRadius: number;
}

const InteractiveHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  const dotsRef = useRef<Dot[]>([]);
  const gridRef = useRef<Record<string, number[]>>({});
  const canvasSizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const mousePositionRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const DOT_SPACING = 25;
  const BASE_OPACITY_MIN = 0.4;
  const BASE_OPACITY_MAX = 0.5;
  const BASE_RADIUS = 1;
  const INTERACTION_RADIUS = 150;
  const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS;
  const OPACITY_BOOST = 0.6;
  const RADIUS_BOOST = 2.5;
  const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5));

  const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      mousePositionRef.current = { x: null, y: null };
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    mousePositionRef.current = { x: canvasX, y: canvasY };
  }, []);

  const createDots = useCallback(() => {
    const { width, height } = canvasSizeRef.current;
    if (width === 0 || height === 0) return;

    const newDots: Dot[] = [];
    const newGrid: Record<string, number[]> = {};
    const cols = Math.ceil(width / DOT_SPACING);
    const rows = Math.ceil(height / DOT_SPACING);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * DOT_SPACING + DOT_SPACING / 2;
        const y = j * DOT_SPACING + DOT_SPACING / 2;
        const cellX = Math.floor(x / GRID_CELL_SIZE);
        const cellY = Math.floor(y / GRID_CELL_SIZE);
        const cellKey = `${cellX}_${cellY}`;

        newGrid[cellKey] ??= [];

        const dotIndex = newDots.length;
        newGrid[cellKey].push(dotIndex);

        const baseOpacity =
          Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
        newDots.push({
          x,
          y,
          baseColor: `rgba(31, 77, 193, ${BASE_OPACITY_MAX})`,
          targetOpacity: baseOpacity,
          currentOpacity: baseOpacity,
          opacitySpeed: Math.random() * 0.005 + 0.002,
          baseRadius: BASE_RADIUS,
          currentRadius: BASE_RADIUS,
        });
      }
    }
    dotsRef.current = newDots;
    gridRef.current = newGrid;
  }, [DOT_SPACING, GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    const width = container ? container.clientWidth : window.innerWidth;
    const height = container ? container.clientHeight : window.innerHeight;

    if (
      canvas.width !== width ||
      canvas.height !== height ||
      canvasSizeRef.current.width !== width ||
      canvasSizeRef.current.height !== height
    ) {
      canvas.width = width;
      canvas.height = height;
      canvasSizeRef.current = { width, height };
      createDots();
    }
  }, [createDots]);

  const animateDots = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const dots = dotsRef.current;
    const grid = gridRef.current;
    const { width, height } = canvasSizeRef.current;
    const { x: mouseX, y: mouseY } = mousePositionRef.current;

    if (!ctx || !dots || !grid || width === 0 || height === 0) {
      animationFrameId.current = requestAnimationFrame(animateDots);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const activeDotIndices = new Set<number>();
    if (mouseX !== null && mouseY !== null) {
      const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE);
      const mouseCellY = Math.floor(mouseY / GRID_CELL_SIZE);
      const searchRadius = Math.ceil(INTERACTION_RADIUS / GRID_CELL_SIZE);
      for (let i = -searchRadius; i <= searchRadius; i++) {
        for (let j = -searchRadius; j <= searchRadius; j++) {
          const checkCellX = mouseCellX + i;
          const checkCellY = mouseCellY + j;
          const cellKey = `${checkCellX}_${checkCellY}`;
          if (grid[cellKey]) {
            grid[cellKey].forEach((dotIndex) => activeDotIndices.add(dotIndex));
          }
        }
      }
    }

    dots.forEach((dot, index) => {
      dot.currentOpacity += dot.opacitySpeed;
      if (
        dot.currentOpacity >= dot.targetOpacity ||
        dot.currentOpacity <= BASE_OPACITY_MIN
      ) {
        dot.opacitySpeed = -dot.opacitySpeed;
        dot.currentOpacity = Math.max(
          BASE_OPACITY_MIN,
          Math.min(dot.currentOpacity, BASE_OPACITY_MAX),
        );
        dot.targetOpacity =
          Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
      }

      let interactionFactor = 0;
      dot.currentRadius = dot.baseRadius;

      if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
        const dx = dot.x - mouseX;
        const dy = dot.y - mouseY;
        const distSq = dx * dx + dy * dy;

        if (distSq < INTERACTION_RADIUS_SQ) {
          const distance = Math.sqrt(distSq);
          interactionFactor = Math.max(0, 1 - distance / INTERACTION_RADIUS);
          interactionFactor = interactionFactor * interactionFactor;
        }
      }

      const finalOpacity = Math.min(
        1,
        dot.currentOpacity + interactionFactor * OPACITY_BOOST,
      );
      dot.currentRadius = dot.baseRadius + interactionFactor * RADIUS_BOOST;

      const colorMatch =
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(dot.baseColor);
      const r = colorMatch ? colorMatch[1] : "31";
      const g = colorMatch ? colorMatch[2] : "77";
      const b = colorMatch ? colorMatch[3] : "193";

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`;
      ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    animationFrameId.current = requestAnimationFrame(animateDots);
  }, [
    GRID_CELL_SIZE,
    INTERACTION_RADIUS,
    INTERACTION_RADIUS_SQ,
    OPACITY_BOOST,
    RADIUS_BOOST,
    BASE_OPACITY_MIN,
    BASE_OPACITY_MAX,
  ]);

  useEffect(() => {
    handleResize();
    const handleMouseLeave = () => {
      mousePositionRef.current = { x: null, y: null };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    animationFrameId.current = requestAnimationFrame(animateDots);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleResize, handleMouseMove, animateDots]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const headerVariants: Variants = {
    top: {
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      borderBottomColor: "rgba(31, 77, 193, 0.08)",
      position: "fixed",
      boxShadow: "none",
    },
    scrolled: {
      backgroundColor: "rgba(255, 255, 255, 0.92)",
      borderBottomColor: "rgba(31, 77, 193, 0.14)",
      boxShadow:
        "0 6px 24px -10px rgba(31, 77, 193, 0.15), 0 1px 3px -1px rgba(31, 77, 193, 0.08)",
      position: "fixed",
    },
  };

  const mobileMenuVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.15, ease: "easeIn" } },
  };

  const contentDelay = 0.3;
  const itemDelayIncrement = 0.1;

  const bannerVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: contentDelay } },
  };
  const headlineVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement },
    },
  };
  const subHeadlineVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 2 },
    },
  };
  const formVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 3 },
    },
  };
  const trialTextVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 4 },
    },
  };
  const worksWithVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 5 },
    },
  };
  const previewVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: contentDelay + itemDelayIncrement * 6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-white pt-[100px] text-[#3d4a6b]">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, #ffffff 92%), radial-gradient(ellipse 90% 60% at 50% 30%, rgba(31,77,193,0.08), transparent 70%), radial-gradient(ellipse 60% 40% at 75% 65%, rgba(67,184,112,0.06), transparent 70%)",
        }}
      />

      <motion.header
        variants={headerVariants}
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sticky top-0 z-30 w-full border-b px-6 backdrop-blur-md md:px-10 lg:px-16"
      >
        <nav className="mx-auto flex h-[70px] max-w-screen-xl items-center justify-between">
          <Link
            href="/"
            className="flex flex-shrink-0 items-center"
            aria-label="ConcoursFacile.ma"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo1.jpeg"
              alt="ConcoursFacile.ma"
              className="h-9 w-auto md:h-10"
              loading="eager"
              decoding="async"
            />
          </Link>

          <div className="hidden flex-grow items-center justify-center space-x-6 px-4 md:flex lg:space-x-8">
            <NavLink href="#fonctionnalites">Fonctionnalites</NavLink>
            <NavLink href="#concours">Concours</NavLink>
            <NavLink href="#tarif">Tarif</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </div>

          <div className="flex flex-shrink-0 items-center space-x-4 lg:space-x-6">
            <NavLink href="/connexion" className="hidden md:inline-block">
              Connexion
            </NavLink>

            <motion.a
              href="/inscription"
              className="whitespace-nowrap rounded-md bg-[#1f4dc1] px-4 py-[7px] text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(31,77,193,0.45)] transition-all duration-200 hover:bg-[#173b96] hover:shadow-[0_12px_24px_-8px_rgba(31,77,193,0.55)]"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              Commencer
            </motion.a>

            <motion.button
              className="z-50 text-[#3d4a6b] hover:text-[#1f4dc1] md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </motion.button>
          </div>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 right-0 top-full border-t border-[#1f4dc1]/10 bg-white/95 py-4 shadow-[0_20px_40px_-20px_rgba(31,77,193,0.18)] backdrop-blur-sm md:hidden"
            >
              <div className="flex flex-col items-center space-y-4 px-6">
                <NavLink
                  href="#fonctionnalites"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Fonctionnalites
                </NavLink>
                <NavLink href="#concours" onClick={() => setIsMobileMenuOpen(false)}>
                  Concours
                </NavLink>
                <NavLink href="#tarif" onClick={() => setIsMobileMenuOpen(false)}>
                  Tarif
                </NavLink>
                <NavLink href="#faq" onClick={() => setIsMobileMenuOpen(false)}>
                  FAQ
                </NavLink>
                <hr className="my-2 w-full border-t border-[#1f4dc1]/10" />
                <NavLink href="/connexion" onClick={() => setIsMobileMenuOpen(false)}>
                  Connexion
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="relative z-10 flex flex-grow flex-col items-center justify-center px-4 pb-16 pt-8 text-center">
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <ShinyText
            text="Nouveau : 2000+ QCM corriges"
            className="cursor-pointer rounded-full border border-[#1f4dc1]/15 bg-[#eef3ff] px-4 py-1 text-xs font-medium text-[#1f4dc1] transition-colors hover:border-[#1f4dc1]/40 sm:text-sm"
          />
        </motion.div>

        <motion.h1
          variants={headlineVariants}
          initial="hidden"
          animate="visible"
          className="mb-4 max-w-4xl text-4xl font-semibold leading-tight text-[#0b1530] sm:text-5xl lg:text-[64px]"
        >
          Reussissez vos concours
          <br />
          <span className="inline-block h-[1.2em] overflow-hidden align-bottom">
            <RotatingText
              texts={["Medecine", "ENSA", "ENCG", "ENSAM", "CPGE"]}
              mainClassName="text-[#1f4dc1]"
              staggerFrom="last"
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "110%", opacity: 0 }}
              staggerDuration={0.01}
              transition={{ type: "spring", damping: 18, stiffness: 250 }}
              rotationInterval={2200}
              splitBy="characters"
              auto
              loop
            />
          </span>
        </motion.h1>

        <motion.p
          variants={subHeadlineVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mb-8 max-w-2xl text-base text-[#5b6b8a] sm:text-lg lg:text-xl"
        >
          Cours structures, QCM corriges et revision intelligente pour les
          concours post-bac marocains. Preparez-vous sereinement, reussissez
          brillamment.
        </motion.p>

        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mb-3 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/inscription"
            className="group/cta inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#1f4dc1] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-8px_rgba(31,77,193,0.5)] transition-all duration-200 hover:-translate-y-px hover:bg-[#173b96] hover:shadow-[0_18px_36px_-10px_rgba(31,77,193,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4dc1] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto"
          >
            Commencer gratuitement
            <svg
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/connexion"
            className="text-sm font-medium text-[#3d4a6b] underline decoration-[#1f4dc1]/30 decoration-2 underline-offset-4 transition-colors hover:text-[#1f4dc1] hover:decoration-[#1f4dc1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4dc1] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            J&apos;ai deja un compte
          </Link>
        </motion.div>

        <motion.p
          variants={trialTextVariants}
          initial="hidden"
          animate="visible"
          className="mb-10 inline-flex items-center gap-1.5 text-xs text-[#5b6b8a]"
        >
          <svg
            className="h-3.5 w-3.5 text-[#43b870]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
          Premiers cours gratuits &middot; Sans carte bancaire
        </motion.p>

        <motion.div
          variants={worksWithVariants}
          initial="hidden"
          animate="visible"
          className="mb-10 flex flex-col items-center justify-center space-y-2"
        >
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#1f4dc1]">
            Concours couverts
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[#3d4a6b]">
            <span className="whitespace-nowrap">Medecine</span>
            <span className="text-[#43b870]">&#10003;</span>
            <span className="whitespace-nowrap">ENSA</span>
            <span className="text-[#43b870]">&#10003;</span>
            <span className="whitespace-nowrap">ENCG</span>
            <span className="text-[#43b870]">&#10003;</span>
            <span className="whitespace-nowrap">ENSAM</span>
            <span className="text-[#43b870]">&#10003;</span>
            <span className="whitespace-nowrap">CPGE</span>
          </div>
        </motion.div>

        <motion.div
          variants={previewVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-4xl px-4 sm:px-0"
        >
          <div className="relative aspect-[1024/640] w-full overflow-hidden rounded-2xl border border-[#1f4dc1]/15 shadow-[0_50px_120px_-40px_rgba(31,77,193,0.45),0_20px_50px_-25px_rgba(67,184,112,0.18)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(/landing/hero-preview.webp)" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(31,77,193,0.45), rgba(67,184,112,0.45), transparent)",
              }}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default InteractiveHero;
