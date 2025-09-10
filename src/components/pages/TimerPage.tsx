"use client";

import { useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Swords } from "lucide-react";

// Helper functions
const pad = (n: number) => n.toString().padStart(2, "0");
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const presets = [5, 10, 15, 30];

interface TimerPageProps {
  mode: "focus" | "short" | "long" | "custom";
  running: boolean;
  duration: number;
  remaining: number;
  customMins: number;
  questChosen: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onStartWithPreset: (mins: number) => void;
  onEndEarly: () => void;
  setCustomMins: (mins: number) => void;
}

export function TimerPage({
  mode,
  running,
  duration,
  remaining,
  customMins,
  questChosen,
  onStartPause,
  onReset,
  onStartWithPreset,
  onEndEarly,
  setCustomMins,
}: TimerPageProps) {
  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);
  
  // SVG ring math
  const R = 120;
  const C = 2 * Math.PI * R;
  const dash = C * (remaining / Math.max(1, duration));
  
  const ringGradientId = useId();

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Card className="m-4 shadow-xl border-muted/40 overflow-hidden card-elevated flex-1">
        <CardHeader className="space-y-1 bg-gradient-to-br from-background to-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Focus Timer
            </CardTitle>
            <kbd className="text-xs text-muted-foreground hidden md:block bg-muted px-2 py-1 rounded">
              1/2/3/4 Presets • Space Start/Pause • R Reset
            </kbd>
          </div>
          <CardDescription className="text-base">
            Pick a quest, hit Start, collect XP. Momentum beats motivation.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center flex-1 py-8">
          {!questChosen ? (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="text-sm text-muted-foreground">Choose your quest</div>
              
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {presets.map((m) => (
                  <motion.div key={m} whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                    <Button 
                      size="lg" 
                      className="h-14 text-lg w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200" 
                      onClick={() => onStartWithPreset(m)}
                    >
                      <Swords className="h-5 w-5 mr-2" /> {m} min
                    </Button>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col gap-3 w-full max-w-sm">
                <Input
                  type="number"
                  className="text-center border-2 focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all duration-200 shadow-sm hover:shadow-md"
                  value={customMins}
                  min={1}
                  max={180}
                  placeholder="Custom minutes"
                  onChange={(e) => setCustomMins(clamp(parseInt(e.target.value || "0"), 1, 180))}
                />
                <Button 
                  className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary shadow-md hover:shadow-lg transition-all duration-200" 
                  onClick={() => onStartWithPreset(customMins)}
                >
                  Start Custom Session
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                Four choices = still simple. Custom if you must.
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-8 w-full">
              {/* Start ritual */}
              <AnimatePresence>
                {!running && remaining === duration && (
                  <motion.div
                    key="rocket"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-6xl"
                  >
                    <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                      🚀
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timer ring */}
              <div className="relative">
                <svg viewBox="0 0 320 320" className="block w-[80vw] max-w-[280px] h-auto drop-shadow-lg">
                  <defs>
                    <linearGradient id={`${ringGradientId}-light`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="black" />
                      <stop offset="50%" stopColor="black" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
                    </linearGradient>
                    <linearGradient id={`${ringGradientId}-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="white" />
                      <stop offset="50%" stopColor="white" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <circle cx={160} cy={160} r={R} className="text-muted/40" stroke="currentColor" strokeWidth={12} fill="none" />
                  <motion.circle
                    cx={160}
                    cy={160}
                    r={R}
                    stroke={`url(#${ringGradientId}-light)`}
                    strokeWidth={12}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={C}
                    strokeDashoffset={C - (C - dash)}
                    initial={false}
                    animate={{ strokeDashoffset: C - (C - dash) }}
                    transition={{ type: "tween", duration: 0.2 }}
                    filter="url(#glow)"
                    className="dark:hidden"
                  />
                  <motion.circle
                    cx={160}
                    cy={160}
                    r={R}
                    stroke={`url(#${ringGradientId}-dark)`}
                    strokeWidth={12}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={C}
                    strokeDashoffset={C - (C - dash)}
                    initial={false}
                    animate={{ strokeDashoffset: C - (C - dash) }}
                    transition={{ type: "tween", duration: 0.2 }}
                    filter="url(#glow)"
                    className="hidden dark:block"
                  />
                  <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" className="fill-foreground font-mono text-4xl sm:text-5xl font-bold" aria-live="polite">
                    {pad(minutes)}:{pad(seconds)}
                  </text>
                  <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground text-sm font-medium">
                    {mode === "focus" ? "Focus Session" : mode === "short" ? "Short Break" : mode === "long" ? "Long Break" : "Custom Session"}
                  </text>
                </svg>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                  <Button 
                    size="lg" 
                    onClick={onStartPause} 
                    className="px-8 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {running ? (
                      <div className="flex items-center gap-2">
                        <Pause className="h-5 w-5" /> Pause
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Play className="h-5 w-5" /> Start
                      </div>
                    )}
                  </Button>
                </motion.div>
                
                <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    onClick={onReset} 
                    className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" /> Reset
                  </Button>
                </motion.div>
                
                {running && (
                  <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                    <Button 
                      variant="ghost" 
                      onClick={onEndEarly} 
                      className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                    >
                      Bank now
                    </Button>
                  </motion.div>
                )}
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Space: Start/Pause • R: Reset • 1/2/3/4: Presets
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}