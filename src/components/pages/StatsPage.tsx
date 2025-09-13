"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Clock, Zap, Target, TrendingUp, Calendar } from "lucide-react";

interface Meta {
  xp: number;
  level: number;
  dailyStreak: number;
  bestStreak: number;
  lastSessionDate: string | null;
  achievements: Record<string, boolean>;
  count30Today: number;
}

interface StatsPageProps {
  meta: Meta;
}

export function StatsPage({ meta }: StatsPageProps) {
  // Calculate some mock stats for demonstration
  const totalSessions = meta.xp; // Using XP as proxy for sessions
  const avgSessionLength = 25; // Mock average
  const totalFocusTime = Math.round((totalSessions * avgSessionLength) / 60); // Hours
  const thisWeekSessions = Math.min(meta.dailyStreak * 2, 15); // Mock
  const weeklyGoal = 10;
  const weeklyProgress = (thisWeekSessions / weeklyGoal) * 100;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Card className="m-4 shadow-xl border-muted/40 card-elevated flex-1">
        <CardHeader className="bg-gradient-to-br from-background to-muted/20">
          <CardTitle className="flex items-center gap-2 font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            <BarChart3 className="h-5 w-5 text-black dark:text-white" /> Stats
          </CardTitle>
          <CardDescription className="text-base">
            Track your focus journey and celebrate progress.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 py-6">
          {/* Key Metrics */}
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-black dark:text-white" />
                <div className="text-2xl font-bold text-black dark:text-white">{totalFocusTime}</div>
                <div className="text-sm text-muted-foreground">Hours Focused</div>
              </div>
              <div className="rounded-xl border p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-black dark:text-white" />
                <div className="text-2xl font-bold text-black dark:text-white">{totalSessions}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
              <div className="rounded-xl border p-4 text-center">
                <Zap className="h-6 w-6 mx-auto mb-2 text-black dark:text-white" />
                <div className="text-2xl font-bold text-black dark:text-white">{avgSessionLength}</div>
                <div className="text-sm text-muted-foreground">Avg Minutes</div>
              </div>
              <div className="rounded-xl border p-4 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-black dark:text-white" />
                <div className="text-2xl font-bold text-black dark:text-white">{meta.bestStreak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div>
            <h3 className="font-medium mb-4">This Week</h3>
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Weekly Goal</div>
                <Badge variant="secondary" className="bg-gradient-to-r from-secondary to-secondary/90 shadow-sm">
                  {thisWeekSessions}/{weeklyGoal}
                </Badge>
              </div>
              <Progress value={weeklyProgress} className="h-3 mb-2" />
              <div className="text-xs text-muted-foreground">
                {Math.round(weeklyProgress)}% complete • {weeklyGoal - thisWeekSessions} sessions to go
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="font-medium mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {/* Mock recent sessions */}
              {[
                { date: "Today", sessions: meta.dailyStreak, minutes: meta.dailyStreak * 25 },
                { date: "Yesterday", sessions: Math.max(0, meta.dailyStreak - 1), minutes: Math.max(0, meta.dailyStreak - 1) * 20 },
                { date: "2 days ago", sessions: Math.max(0, meta.dailyStreak - 2), minutes: Math.max(0, meta.dailyStreak - 2) * 30 },
              ].map((day, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium text-sm">{day.date}</div>
                    <div className="text-xs text-muted-foreground">
                      {day.sessions} sessions • {day.minutes} minutes
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(day.sessions, 5) }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-2 h-2 rounded-full bg-black dark:bg-white"
                      />
                    ))}
                    {day.sessions > 5 && (
                      <div className="text-xs text-muted-foreground ml-1">
                        +{day.sessions - 5}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Progress */}
          <div>
            <h3 className="font-medium mb-4">Achievement Progress</h3>
            <div className="space-y-3">
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">Focus Master</div>
                  <div className="text-xs text-muted-foreground">25/50</div>
                </div>
                <Progress value={50} className="h-2 mb-1" />
                <div className="text-xs text-muted-foreground">Complete 50 focus sessions</div>
              </div>
              
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">Marathon Runner</div>
                  <div className="text-xs text-muted-foreground">2/10</div>
                </div>
                <Progress value={20} className="h-2 mb-1" />
                <div className="text-xs text-muted-foreground">Complete 10 sessions in one day</div>
              </div>
              
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">Consistency King</div>
                  <div className="text-xs text-muted-foreground">{meta.bestStreak}/7</div>
                </div>
                <Progress value={(meta.bestStreak / 7) * 100} className="h-2 mb-1" />
                <div className="text-xs text-muted-foreground">Maintain 7-day streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
