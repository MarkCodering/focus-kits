"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  RotateCcw,
  Bell,
  Keyboard,
  Volume2,
  Coffee,
  Target,
  TimerReset,
  Swords,
  Star,
  Gift,
  Crown,
  Sparkles,
  Trophy,
  Sun,
  Moon,
} from "lucide-react";

// --------------------------
// Helpers & constants
// --------------------------
const pad = (n: number) => n.toString().padStart(2, "0");
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
// Updated presets
const presets = [5, 10, 15, 30];

// localStorage keys
const LS = {
  settings: "adhd-focus-settings-v3",
  state: "adhd-focus-state-v3",
  meta: "adhd-focus-meta-v3",
  theme: "adhd-focus-theme-v3",
};

type Mode = "focus" | "short" | "long" | "custom";

// theme
type ThemeKey = "space" | "forest" | "cyber";
type ThemeMode = "system" | "light" | "dark";

// settings stored in app
interface Settings {
  autoStartNext: boolean;
  soundOn: boolean;
  notifyOn: boolean;
  themeSkin: ThemeKey;
  themeMode: ThemeMode; // light/dark/system
}

// meta for gamification
interface Meta {
  xp: number;
  level: number;
  dailyStreak: number;
  bestStreak: number;
  lastSessionDate: string | null;
  achievements: Record<string, boolean>;
  count30Today: number; // changed from 40 to 30 to match presets
}

const defaultSettings: Settings = {
  autoStartNext: false,
  soundOn: true,
  notifyOn: true,
  themeSkin: "space",
  themeMode: "light",
};

const defaultMeta: Meta = {
  xp: 0,
  level: 1,
  dailyStreak: 0,
  bestStreak: 0,
  lastSessionDate: null,
  achievements: {},
  count30Today: 0,
};

// (skins removed for simplified branding)

// XP curve
const levelCap = (lvl: number) => 100 + (lvl - 1) * 50; // xp to next

export default function FocusTimerPro() {
  // --------------------------
  // Theme mode (light/dark/system)
  // --------------------------
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultSettings.themeMode);

  // Load saved theme on mount to avoid SSR/client mismatch
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = (localStorage.getItem(LS.theme) as ThemeMode) || defaultSettings.themeMode;
    setThemeMode(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const apply = () => {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldDark = themeMode === "dark" || (themeMode === "system" && prefersDark);
      root.classList.toggle("dark", shouldDark);
    };
    apply();
    localStorage.setItem(LS.theme, themeMode);

    // update on system change when in system mode
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSys = () => themeMode === "system" && apply();
    mq.addEventListener?.("change", onSys);
    return () => { mq.removeEventListener?.("change", onSys); };
  }, [themeMode]);

  // --------------------------
  // Settings & meta
  // --------------------------
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load saved settings on mount (post-hydration)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem(LS.settings) || "{}");
      setSettings({ ...defaultSettings, ...saved });
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(LS.settings, JSON.stringify(settings));
  }, [settings]);

  const [meta, setMeta] = useState<Meta>(defaultMeta);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem(LS.meta) || "{}");
      setMeta({ ...defaultMeta, ...saved });
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(LS.meta, JSON.stringify(meta));
  }, [meta]);

  // --------------------------
  // Timer state
  // --------------------------
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState(20 * 60);
  const [remaining, setRemaining] = useState(20 * 60);
  const [customMins, setCustomMins] = useState(45);
  const [questChosen, setQuestChosen] = useState(false);

  const tickRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // dialogs
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showLoot, setShowLoot] = useState(false);
  const [lootItem, setLootItem] = useState<string | null>(null);
  const [showFailSafe, setShowFailSafe] = useState(false);
  const [earnedPartial, setEarnedPartial] = useState(0);

  // persist transient state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = { mode, running, duration, remaining, customMins, questChosen };
      localStorage.setItem(LS.state, JSON.stringify(s));
    }
  }, [mode, running, duration, remaining, customMins, questChosen]);

  // restore once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(LS.state);
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      setMode(s.mode ?? "focus");
      setRunning(false);
      setDuration(s.duration ?? 20 * 60);
      setRemaining(s.remaining ?? 20 * 60);
      setCustomMins(s.customMins ?? 45);
      setQuestChosen(s.questChosen ?? false);
    } catch {}
  }, []);

  // derived
  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);

  // svg ring math
  const R = 120;
  const C = 2 * Math.PI * R;
  const dash = C * (remaining / Math.max(1, duration));

  // XP math
  const xpInLevel = meta.xp % levelCap(meta.level);
  const xpNeeded = levelCap(meta.level) - xpInLevel;
  const levelProgress = (xpInLevel / levelCap(meta.level)) * 100;

  // notifications
  const notify = (title: string, body?: string) => {
    if (!settings.notifyOn || typeof window === "undefined") return;
    if ("Notification" in window) {
      if (Notification.permission === "granted") new Notification(title, { body });
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => perm === "granted" && new Notification(title, { body }));
      }
    }
  };

  const beep = () => settings.soundOn && audioRef.current?.play().catch(() => {});

  // engine
  useEffect(() => {
    if (!running) {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
      lastTsRef.current = null;
      return;
    }
    const step = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setRemaining((r) => {
        const next = Math.max(0, r - dt);
        if (next === 0) {
          setRunning(false);
          handleSessionComplete(true);
        }
        return next;
      });
      tickRef.current = requestAnimationFrame(step);
    };
    tickRef.current = requestAnimationFrame(step);
    // FIX: return only void cleanup (not null/0)
    return () => { if (tickRef.current) cancelAnimationFrame(tickRef.current); };
  }, [running]);

  const minutesFromDuration = (secs: number) => Math.round(secs / 60);

  const switchMode = (m: Mode, mmins?: number) => {
    setMode(m);
    const mins = m === "focus" ? (mmins ?? minutesFromDuration(duration)) : m === "short" ? 5 : m === "long" ? 15 : customMins;
    const secs = Math.max(1, Math.round(mins * 60));
    setDuration(secs);
    setRemaining(secs);
  };

  const startWithPreset = (mins: number) => {
    setQuestChosen(true);
    setMode("focus");
    setDuration(mins * 60);
    setRemaining(mins * 60);
    setRunning(true);
  };

  const onStartPause = () => setRunning((v) => !v);
  const onReset = () => {
    switchMode(mode, minutesFromDuration(duration));
    setQuestChosen(false);
    setRunning(false);
  };

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); if (!questChosen) return; onStartPause(); }
      else if (e.key.toLowerCase() === "r") onReset();
      else if (e.key === "1") startWithPreset(presets[0]);
      else if (e.key === "2") startWithPreset(presets[1]);
      else if (e.key === "3") startWithPreset(presets[2]);
      else if (e.key === "4") startWithPreset(presets[3]);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  }, [questChosen]);

  // XP & loot
  const grantXP = (mins: number) => {
    let gained = Math.max(1, Math.round(mins));
    if (mode === "focus") gained += 5;
    const today = fmtDate(new Date());
    const inSameDay = meta.lastSessionDate === today;
    const streak = inSameDay ? meta.dailyStreak : 0;
    gained = Math.round(gained * (1 + 0.1 * Math.min(5, streak)));

    let newXP = meta.xp + gained;
    let newLevel = meta.level;
    let leveledUp = false;
    while (newXP >= levelCap(newLevel)) { newXP -= levelCap(newLevel); newLevel += 1; leveledUp = true; }

    setMeta((m) => {
      const today2 = fmtDate(new Date());
      const sameDay = m.lastSessionDate === today2;
      const newDaily = sameDay ? m.dailyStreak + 1 : 1;
      const best = Math.max(m.bestStreak, newDaily);
      const newCount30 = (mode === "focus" && minutesFromDuration(duration) === 30)
        ? (sameDay ? m.count30Today + 1 : 1) : (sameDay ? m.count30Today : 0);
      const ach = { ...m.achievements } as Record<string, boolean>;
      if (!ach["first-session"]) ach["first-session"] = true;
      if (newDaily >= 5) ach["five-today"] = true;
      if (newCount30 >= 3) ach["triple-30"] = true; // updated
      return { ...m, xp: newXP, level: newLevel, dailyStreak: newDaily, bestStreak: best, lastSessionDate: today2, achievements: ach, count30Today: newCount30 };
    });

    if (leveledUp) setShowLevelUp(true);
    return gained;
  };

  const maybeLoot = () => {
    if (Math.random() < 0.2) {
      const items = ["✨ Cosmic Sticker", "🧠 Focus Badge", "🔥 Momentum Flame", "🌿 Forest Totem", "🛰️ Orbital Token"];
      setLootItem(items[Math.floor(Math.random() * items.length)]);
      setShowLoot(true);
    }
  };

  const handleSessionComplete = (full: boolean) => {
    beep();
    notify(full ? "Focus complete" : "Session ended", full ? "+XP added. Keep the streak?" : "Partial XP banked. Bonus round?");
    const secsDone = Math.round((duration - remaining));
    const minsDone = secsDone / 60;
    const gained = grantXP(minsDone);
    if (!full) { setEarnedPartial(gained); setShowFailSafe(true); }
    maybeLoot();
  };

  const endEarly = () => { setRunning(false); handleSessionComplete(false); };

  // svg gradient id
  const ringGradientId = useId();

  // --------------------------
  // UI
  // --------------------------
  // Avoid theme/UI flicker before hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">

      {/* Top bar */}
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">Focus Kits</div>
          <div className="flex items-center gap-2">
            {/* Theme mode: light / dark */}
            <div className="flex gap-1 rounded-xl border p-1 bg-muted/30">
              <Button size="sm" variant={themeMode==="light"?"default":"ghost"} onClick={()=>setThemeMode("light")} title="Light"><Sun className="h-4 w-4"/></Button>
              <Button size="sm" variant={themeMode==="dark"?"default":"ghost"} onClick={()=>setThemeMode("dark")} title="Dark"><Moon className="h-4 w-4"/></Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <Card className="shadow-xl border-muted/40 overflow-hidden">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Focus Timer</CardTitle>
              <kbd className="text-xs text-muted-foreground hidden md:block">1/2/3/4 Presets • Space Start/Pause • R Reset</kbd>
            </div>
            <CardDescription>Pick a quest, hit Start, collect XP. Momentum beats motivation.</CardDescription>
          </CardHeader>
          <CardContent>
            {!questChosen ? (
              <div className="flex flex-col items-center gap-6">
                <div className="text-sm text-muted-foreground">Choose your quest</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
                  {presets.map((m) => (
                    <motion.div key={m} whileTap={{ scale: 0.98 }}>
                      <Button size="lg" className="h-14 text-lg w-full" onClick={() => startWithPreset(m)}>
                        <Swords className="h-5 w-5 mr-2" /> {m} min
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full max-w-md">
                  <Input
                    type="number"
                    className="w-28 flex-1 min-w-[8rem]"
                    value={customMins}
                    min={1}
                    max={180}
                    onChange={(e)=>setCustomMins(clamp(parseInt(e.target.value||"0"),1,180))}
                  />
                  <Button className="flex-1 min-w-[8rem]" onClick={()=>startWithPreset(customMins)}>Custom</Button>
                </div>
                <div className="text-xs text-muted-foreground">Four choices = still simple. Custom if you must.</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-6">
                {/* Start ritual */}
                <AnimatePresence>
                  {!running && remaining === duration && (
                    <motion.div key="rocket" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.4 }} className="text-6xl">
                      <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>🚀</motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Timer ring with glow */}
                <div className="relative">
                  <svg viewBox="0 0 320 320" className="block w-[80vw] max-w-[320px] h-auto drop-shadow">
                    <defs>
                      <linearGradient id={ringGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="currentColor" />
                        <stop offset="100%" stopColor="currentColor" />
                      </linearGradient>
                    </defs>
                    <circle cx={160} cy={160} r={R} className="text-muted" stroke="currentColor" strokeWidth={16} fill="none" opacity={0.25} />
                    <motion.circle
                      cx={160}
                      cy={160}
                      r={R}
                      stroke={`url(#${ringGradientId})`}
                      strokeWidth={16}
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={C}
                      strokeDashoffset={C - (C - dash)}
                      initial={false}
                      animate={{ strokeDashoffset: C - (C - dash) }}
                      transition={{ type: "tween", duration: 0.2 }}
                      className="text-primary"
                    />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground font-mono text-5xl sm:text-6xl" aria-live="polite">
                      {pad(minutes)}:{pad(seconds)}
                    </text>
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-center pb-4">
                    <div className="text-sm text-muted-foreground">{mode === "focus" ? "Focus" : mode === "short" ? "Short Break" : mode === "long" ? "Long Break" : "Custom"}</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button size="lg" onClick={onStartPause} className="px-6">
                      {running ? (<div className="flex items-center gap-2"><Pause className="h-5 w-5" /> Pause</div>) : (<div className="flex items-center gap-2"><Play className="h-5 w-5" /> Start</div>)}
                    </Button>
                  </motion.div>
                  <Button variant="secondary" size="lg" onClick={onReset}><RotateCcw className="h-5 w-5 mr-2" /> Reset</Button>
                  {running && (<Button variant="ghost" onClick={endEarly} className="text-muted-foreground">Bank now</Button>)}
                </div>

                <div className="text-xs text-muted-foreground">Space: Start/Pause • R: Reset • 1/2/3/4: Presets</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right */}
        <Card className="shadow-xl border-muted/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Progress</CardTitle>
            <CardDescription>XP, level-ups, streaks, and tiny dopamine confetti.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Level bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium flex items-center gap-2"><Crown className="h-4 w-4" /> Level {meta.level}</div>
                <div className="text-xs text-muted-foreground">{Math.round(levelProgress)}%</div>
              </div>
              <Progress value={levelProgress} />
              <div className="text-xs text-muted-foreground mt-1">{xpNeeded} XP to next level</div>
            </div>

            {/* Streaks */}
            <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/20">
              <div>
                <div className="font-medium flex items-center gap-2"><Star className="h-4 w-4" /> Today streak</div>
                <p className="text-sm text-muted-foreground">{meta.dailyStreak} session{meta.dailyStreak === 1 ? "" : "s"} • Best {meta.bestStreak}</p>
              </div>
              <Badge variant="secondary">x{(1 + Math.min(5, Math.max(0, meta.dailyStreak - 1)) * 0.1).toFixed(1)}</Badge>
            </div>

            {/* Achievements */}
            <div className="rounded-xl border p-4">
              <div className="font-medium mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Achievements</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={meta.achievements["first-session"] ? "default" : "secondary"}>First Session</Badge>
                <Badge variant={meta.achievements["five-today"] ? "default" : "secondary"}>Five Today</Badge>
                <Badge variant={meta.achievements["triple-30"] ? "default" : "secondary"}>3×30 Focus</Badge>
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <div className="font-medium flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</div>
                  <p className="text-sm text-muted-foreground">Completion alerts.</p>
                </div>
                <Switch checked={settings.notifyOn} onCheckedChange={(v)=>setSettings({...settings, notifyOn:v})} />
              </div>
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <div className="font-medium flex items-center gap-2"><Volume2 className="h-4 w-4" /> Sound</div>
                  <p className="text-sm text-muted-foreground">Gentle chime on finish.</p>
                </div>
                <Switch checked={settings.soundOn} onCheckedChange={(v)=>setSettings({...settings, soundOn:v})} />
              </div>
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <div className="font-medium flex items-center gap-2"><Target className="h-4 w-4" /> Auto-start next</div>
                  <p className="text-sm text-muted-foreground">Roll into the next block.</p>
                </div>
                <Switch checked={settings.autoStartNext} onCheckedChange={(v)=>setSettings({...settings, autoStartNext:v})} />
              </div>
              {/* Simplified: no theme skins */}
              {/* Mode picker */}
              <div className="rounded-xl border p-4">
                <div className="font-medium mb-2">Theme Mode</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={themeMode==="light"?"default":"secondary"} onClick={()=>setThemeMode("light")}><Sun className="h-4 w-4 mr-1"/>Light</Button>
                  <Button variant={themeMode==="dark"?"default":"secondary"} onClick={()=>setThemeMode("dark")}><Moon className="h-4 w-4 mr-1"/>Dark</Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="rounded-xl border p-4">
              <div className="font-medium mb-1">Mini-quests</div>
              <p className="text-sm text-muted-foreground">Try 2×20 min today. Bank your streak or double down for bonus XP.</p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <Dialog open={showLevelUp} onOpenChange={setShowLevelUp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5" /> Level Up!</DialogTitle>
            <DialogDescription>New level unlocked. Keep the streak to snowball gains.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2"><Badge>+Level</Badge><Badge variant="secondary">+Perks (soon)</Badge></div>
          <div className="flex justify-end"><Button onClick={()=>setShowLevelUp(false)}>Nice</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoot} onOpenChange={setShowLoot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Loot Box!</DialogTitle>
            <DialogDescription>Surprise reward unlocked.</DialogDescription>
          </DialogHeader>
          <div className="text-lg">{lootItem}</div>
          <div className="flex justify-end"><Button onClick={()=>setShowLoot(false)}>Claim</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFailSafe} onOpenChange={setShowFailSafe}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Star className="h-5 w-5" /> Partial XP banked</DialogTitle>
            <DialogDescription>You collected {earnedPartial} XP. Want a 5‑minute bonus round?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-between">
            <Button variant="secondary" onClick={()=>setShowFailSafe(false)}>Not now</Button>
            <Button onClick={()=>{ setShowFailSafe(false); startWithPreset(5); }}>Bonus Round</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* audio */}
      <audio ref={audioRef} preload="auto">
        <source
          src="data:audio/wav;base64,UklGRoQHAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABYAaW1wb3J0YW50AAAASAAAAGQAAABkYXRhAAAAAIAAAACAgICAgICAgP8AAP8A/wAAAP///wD///8A////AP///wD///8A////AP7+/gD9/f0A/Pz8APv7+wD39/cA9PT0AOPA4ADf398A29vbANjY2ADU1NQA0tLSANHR0QDQ0NAAzMzMANfX1wDR0dEA09PTANHR0QDg4OAA5OTkAOTk5ADm5uYA6enpAOrq6gDs7OwA8PDwAPX19QD5+fkA+vr6AP7+/g=="
          type="audio/wav"
        />
      </audio>
    </div>
  );
}
