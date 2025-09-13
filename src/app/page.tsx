"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { TimerPage } from "@/components/pages/TimerPage";
import { ProgressPage } from "@/components/pages/ProgressPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { StatsPage } from "@/components/pages/StatsPage";
import { Sun, Moon, Star, Gift, Crown } from "lucide-react";

// --------------------------
// Helpers & constants
// --------------------------
// const pad = (n: number) => n.toString().padStart(2, "0");
// const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

// localStorage keys
const LS = {
  settings: "adhd-focus-settings-v3",
  state: "adhd-focus-state-v3",
  meta: "adhd-focus-meta-v3",
  theme: "adhd-focus-theme-v3",
};

type Mode = "focus" | "short" | "long" | "custom";
type ThemeKey = "space" | "forest" | "cyber";
type ThemeMode = "system" | "light" | "dark";

// settings stored in app
interface Settings {
  autoStartNext: boolean;
  soundOn: boolean;
  notifyOn: boolean;
  themeSkin: ThemeKey;
  themeMode: ThemeMode;
}

// meta for gamification
interface Meta {
  xp: number;
  level: number;
  dailyStreak: number;
  bestStreak: number;
  lastSessionDate: string | null;
  achievements: Record<string, boolean>;
  count30Today: number;
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

const levelCap = (lvl: number) => 100 + (lvl - 1) * 50;

export default function FocusKitsApp() {
  // --------------------------
  // App State & Navigation
  // --------------------------
  const [currentPage, setCurrentPage] = useState("timer");

  // --------------------------
  // Theme mode (light/dark/system)
  // --------------------------
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultSettings.themeMode);

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

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSys = () => themeMode === "system" && apply();
    mq.addEventListener?.("change", onSys);
    return () => { mq.removeEventListener?.("change", onSys); };
  }, [themeMode]);

  // --------------------------
  // Settings & meta
  // --------------------------
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [meta, setMeta] = useState<Meta>(defaultMeta);

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

  const minutesFromDuration = (secs: number) => Math.round(secs / 60);

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
      if (newCount30 >= 3) ach["triple-30"] = true;
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

  const handleSessionComplete = useCallback((full: boolean) => {
    beep();
    notify(full ? "Focus complete" : "Session ended", full ? "+XP added. Keep the streak?" : "Partial XP banked. Bonus round?");
    const secsDone = Math.round((duration - remaining));
    const minsDone = secsDone / 60;
    const gained = grantXP(minsDone);
    if (!full) { setEarnedPartial(gained); setShowFailSafe(true); }
    maybeLoot();
  }, [duration, remaining, mode, settings, meta, beep, notify, grantXP, maybeLoot]);

  // Timer engine
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
    return () => { if (tickRef.current) cancelAnimationFrame(tickRef.current); };
  }, [running, handleSessionComplete]);

  const switchMode = (m: Mode, mmins?: number) => {
    setMode(m);
    const mins = m === "focus" ? (mmins ?? minutesFromDuration(duration)) : m === "short" ? 5 : m === "long" ? 15 : customMins;
    const secs = Math.max(1, Math.round(mins * 60));
    setDuration(secs);
    setRemaining(secs);
  };

  const startWithPreset = useCallback((mins: number) => {
    setQuestChosen(true);
    setMode("focus");
    setDuration(mins * 60);
    setRemaining(mins * 60);
    setRunning(true);
  }, []);

  const onStartPause = () => setRunning((v) => !v);
  const onReset = useCallback(() => {
    switchMode(mode, minutesFromDuration(duration));
    setQuestChosen(false);
    setRunning(false);
  }, [mode, duration, switchMode]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); if (!questChosen) return; onStartPause(); }
      else if (e.key.toLowerCase() === "r") onReset();
      else if (e.key === "1") startWithPreset(5);
      else if (e.key === "2") startWithPreset(10);
      else if (e.key === "3") startWithPreset(15);
      else if (e.key === "4") startWithPreset(30);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  }, [questChosen, onReset, startWithPreset]);

  const endEarly = () => { setRunning(false); handleSessionComplete(false); };

  // --------------------------
  // Page Rendering Functions
  // --------------------------
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "timer":
        return (
          <TimerPage
            mode={mode}
            running={running}
            duration={duration}
            remaining={remaining}
            customMins={customMins}
            questChosen={questChosen}
            onStartPause={onStartPause}
            onReset={onReset}
            onStartWithPreset={startWithPreset}
            onEndEarly={endEarly}
            setCustomMins={setCustomMins}
          />
        );
      case "progress":
        return <ProgressPage meta={meta} />;
      case "stats":
        return <StatsPage meta={meta} />;
      case "settings":
        return (
          <SettingsPage
            settings={settings}
            themeMode={themeMode}
            onSettingsChange={setSettings}
            onThemeModeChange={setThemeMode}
          />
        );
      default:
        return (
          <TimerPage
            mode={mode}
            running={running}
            duration={duration}
            remaining={remaining}
            customMins={customMins}
            questChosen={questChosen}
            onStartPause={onStartPause}
            onReset={onReset}
            onStartWithPreset={startWithPreset}
            onEndEarly={endEarly}
            setCustomMins={setCustomMins}
          />
        );
    }
  };

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
        <div className="mx-auto max-w-md px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">Focus Kits</div>
          <div className="flex gap-1.5 rounded-xl border p-1.5 bg-muted/30">
            <Button 
              size="sm" 
              variant={themeMode === "light" ? "default" : "ghost"} 
              onClick={() => setThemeMode("light")} 
              title="Light" 
              className={themeMode === "light" ? "bg-black text-white hover:bg-black/90" : ""}
            >
              <Sun className="h-4 w-4"/>
            </Button>
            <Button 
              size="sm" 
              variant={themeMode === "dark" ? "default" : "ghost"} 
              onClick={() => setThemeMode("dark")} 
              title="Dark" 
              className={themeMode === "dark" ? "bg-white text-black hover:bg-white/90" : ""}
            >
              <Moon className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {renderCurrentPage()}
      </main>

      {/* Bottom Navigation */}
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Dialogs */}
      <Dialog open={showLevelUp} onOpenChange={setShowLevelUp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5" /> Level Up!</DialogTitle>
            <DialogDescription>New level unlocked. Keep the streak to snowball gains.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2"><Badge className="bg-black text-white dark:bg-white dark:text-black shadow-md">+Level</Badge><Badge variant="secondary" className="bg-gradient-to-r from-secondary to-secondary/90">+Perks (soon)</Badge></div>
          <div className="flex justify-end"><Button onClick={()=>setShowLevelUp(false)} className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200">Nice</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoot} onOpenChange={setShowLoot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Loot Box!</DialogTitle>
            <DialogDescription>Surprise reward unlocked.</DialogDescription>
          </DialogHeader>
          <div className="text-lg">{lootItem}</div>
          <div className="flex justify-end"><Button onClick={()=>setShowLoot(false)} className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200">Claim</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFailSafe} onOpenChange={setShowFailSafe}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Star className="h-5 w-5" /> Partial XP banked</DialogTitle>
            <DialogDescription>You collected {earnedPartial} XP. Want a 5‑minute bonus round?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-between">
            <Button variant="secondary" onClick={()=>setShowFailSafe(false)} className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary shadow-md hover:shadow-lg transition-all duration-200">Not now</Button>
            <Button onClick={()=>{ setShowFailSafe(false); startWithPreset(5); }} className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200">Bonus Round</Button>
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
