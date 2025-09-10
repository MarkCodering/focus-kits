"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, Crown, Star, Sparkles } from "lucide-react";

interface Meta {
  xp: number;
  level: number;
  dailyStreak: number;
  bestStreak: number;
  lastSessionDate: string | null;
  achievements: Record<string, boolean>;
  count30Today: number;
}

interface ProgressPageProps {
  meta: Meta;
}

// XP curve
const levelCap = (lvl: number) => 100 + (lvl - 1) * 50;

export function ProgressPage({ meta }: ProgressPageProps) {
  // XP math
  const xpInLevel = meta.xp % levelCap(meta.level);
  const xpNeeded = levelCap(meta.level) - xpInLevel;
  const levelProgress = (xpInLevel / levelCap(meta.level)) * 100;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Card className="m-4 shadow-xl border-muted/40 card-elevated flex-1">
        <CardHeader className="bg-gradient-to-br from-background to-muted/20">
          <CardTitle className="flex items-center gap-2 font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            <Trophy className="h-5 w-5 text-black dark:text-white" /> Progress
          </CardTitle>
          <CardDescription className="text-base">
            XP, level-ups, streaks, and tiny dopamine confetti.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 py-6">
          {/* Level bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium flex items-center gap-2">
                <Crown className="h-4 w-4" /> Level {meta.level}
              </div>
              <div className="text-xs text-muted-foreground">{Math.round(levelProgress)}%</div>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <div className="text-xs text-muted-foreground mt-1">{xpNeeded} XP to next level</div>
          </div>

          {/* Streaks */}
          <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/20">
            <div>
              <div className="font-medium flex items-center gap-2">
                <Star className="h-4 w-4" /> Today streak
              </div>
              <p className="text-sm text-muted-foreground">
                {meta.dailyStreak} session{meta.dailyStreak === 1 ? "" : "s"} • Best {meta.bestStreak}
              </p>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-secondary to-secondary/90 shadow-sm">
              x{(1 + Math.min(5, Math.max(0, meta.dailyStreak - 1)) * 0.1).toFixed(1)}
            </Badge>
          </div>

          {/* Achievements */}
          <div className="rounded-xl border p-4">
            <div className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Achievements
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={meta.achievements["first-session"] ? "default" : "secondary"} 
                className={meta.achievements["first-session"] ? "bg-black text-white dark:bg-white dark:text-black shadow-md" : "bg-gradient-to-r from-secondary to-secondary/90"}
              >
                First Session
              </Badge>
              <Badge 
                variant={meta.achievements["five-today"] ? "default" : "secondary"} 
                className={meta.achievements["five-today"] ? "bg-black text-white dark:bg-white dark:text-black shadow-md" : "bg-gradient-to-r from-secondary to-secondary/90"}
              >
                Five Today
              </Badge>
              <Badge 
                variant={meta.achievements["triple-30"] ? "default" : "secondary"} 
                className={meta.achievements["triple-30"] ? "bg-black text-white dark:bg-white dark:text-black shadow-md" : "bg-gradient-to-r from-secondary to-secondary/90"}
              >
                3×30 Focus
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold text-black dark:text-white">{meta.xp}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold text-black dark:text-white">{meta.level}</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </div>
            <div className="rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold text-black dark:text-white">{meta.bestStreak}</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
            <div className="rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold text-black dark:text-white">{meta.count30Today}</div>
              <div className="text-sm text-muted-foreground">30min Today</div>
            </div>
          </div>

          {/* Mini-quests */}
          <div className="rounded-xl border p-4">
            <div className="font-medium mb-1">Mini-quests</div>
            <p className="text-sm text-muted-foreground">
              Try 2×20 min today. Bank your streak or double down for bonus XP.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}