"use client";

import { Timer, TrendingUp, Settings, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  {
    id: "timer",
    label: "Timer",
    icon: Timer,
  },
  {
    id: "progress", 
    label: "Progress",
    icon: TrendingUp,
  },
  {
    id: "stats",
    label: "Stats", 
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 border-t border-border">
      <div className="mx-auto max-w-md px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        <div className="flex items-center justify-around h-[64px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg transition-all duration-200 min-w-[64px]",
                  isActive 
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
