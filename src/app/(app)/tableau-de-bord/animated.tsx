"use client";

import { motion } from "framer-motion";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
      }}
    >
      {children}
    </motion.div>
  );
}
