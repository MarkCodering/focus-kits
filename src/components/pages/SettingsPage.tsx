"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Volume2, Target, Settings as SettingsIcon, Sun, Moon } from "lucide-react";

type ThemeKey = "space" | "forest" | "cyber";
type ThemeMode = "system" | "light" | "dark";

interface Settings {
  autoStartNext: boolean;
  soundOn: boolean;
  notifyOn: boolean;
  themeSkin: ThemeKey;
  themeMode: ThemeMode;
}

interface SettingsPageProps {
  settings: Settings;
  themeMode: "system" | "light" | "dark";
  onSettingsChange: (settings: Settings) => void;
  onThemeModeChange: (mode: "system" | "light" | "dark") => void;
}

export function SettingsPage({ 
  settings, 
  themeMode, 
  onSettingsChange, 
  onThemeModeChange 
}: SettingsPageProps) {
  const updateSetting = (key: keyof Settings, value: boolean | ThemeKey | ThemeMode) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Card className="m-4 shadow-xl border-muted/40 card-elevated flex-1">
        <CardHeader className="bg-gradient-to-br from-background to-muted/20">
          <CardTitle className="flex items-center gap-2 font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            <SettingsIcon className="h-5 w-5 text-black dark:text-white" /> Settings
          </CardTitle>
          <CardDescription className="text-base">
            Customize your focus experience and preferences.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 py-6">
          {/* Appearance */}
          <div>
            <h3 className="font-medium mb-4">Appearance</h3>
            <div className="rounded-xl border p-4">
              <div className="font-medium mb-2">Theme Mode</div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={themeMode === "light" ? "default" : "secondary"} 
                  onClick={() => onThemeModeChange("light")} 
                  className={themeMode === "light" ? "bg-black text-white hover:bg-black/90" : ""}
                >
                  <Sun className="h-4 w-4 mr-1" />Light
                </Button>
                <Button 
                  variant={themeMode === "dark" ? "default" : "secondary"} 
                  onClick={() => onThemeModeChange("dark")} 
                  className={themeMode === "dark" ? "bg-white text-black hover:bg-white/90" : ""}
                >
                  <Moon className="h-4 w-4 mr-1" />Dark
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications & Sound */}
          <div>
            <h3 className="font-medium mb-4">Notifications & Sound</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Notifications
                  </div>
                  <p className="text-sm text-muted-foreground">Completion alerts.</p>
                </div>
                <Switch 
                  checked={settings.notifyOn} 
                  onCheckedChange={(v) => updateSetting("notifyOn", v)} 
                />
              </div>
              
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Volume2 className="h-4 w-4" /> Sound
                  </div>
                  <p className="text-sm text-muted-foreground">Gentle chime on finish.</p>
                </div>
                <Switch 
                  checked={settings.soundOn} 
                  onCheckedChange={(v) => updateSetting("soundOn", v)} 
                />
              </div>
            </div>
          </div>

          {/* Focus Behavior */}
          <div>
            <h3 className="font-medium mb-4">Focus Behavior</h3>
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" /> Auto-start next
                </div>
                <p className="text-sm text-muted-foreground">Roll into the next block.</p>
              </div>
              <Switch 
                checked={settings.autoStartNext} 
                onCheckedChange={(v) => updateSetting("autoStartNext", v)} 
              />
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="font-medium mb-4">About</h3>
            <div className="rounded-xl border p-4">
              <div className="font-medium mb-2">Focus Kits</div>
              <p className="text-sm text-muted-foreground mb-4">
                A simple, effective focus timer with gamification elements. 
                Build focus habits one session at a time.
              </p>
              <div className="text-xs text-muted-foreground">
                Version 1.0.0
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}