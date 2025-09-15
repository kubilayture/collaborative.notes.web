"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beams = new Array(6).fill("");

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden z-0",
        className
      )}
    >
      {beams.map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: i * 0.2 }}
        >
          <div
            className={cn(
              "absolute h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent",
              i % 2 === 0 ? "top-1/4" : "bottom-1/4"
            )}
            style={{
              transform: `translateY(${i * 80}px) rotate(${i % 2 === 0 ? -45 : 45}deg)`,
              left: `${i * 20}%`,
            }}
          />
        </motion.div>
      ))}

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/50 to-primary/5" />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};