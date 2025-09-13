"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Target, Trophy, Zap, ArrowRight, Sparkles } from "lucide-react";

const onboardingSteps = [
  {
    id: 1,
    icon: Rocket,
    title: "Welcome to Focus Kits",
    subtitle: "Your journey to laser focus starts here",
    description: "Transform scattered attention into deep work sessions. Build momentum, earn XP, and level up your productivity game.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    icon: Target,
    title: "Pick Your Quest",
    subtitle: "Choose focus sessions that fit your flow",
    description: "Start with 5, 10, 15, or 30-minute sessions. No overwhelm, just progress. Each completed session builds your streak.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    icon: Zap,
    title: "Collect XP & Level Up",
    subtitle: "Turn productivity into a game",
    description: "Every session earns XP. Complete streaks for bonuses. Unlock achievements and rare loot along the way.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: 4,
    icon: Trophy,
    title: "Build Unstoppable Momentum",
    subtitle: "Consistency beats intensity",
    description: "Daily streaks multiply your XP. Watch your focus muscle grow stronger with each completed session.",
    gradient: "from-orange-500 to-red-500",
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {onboardingSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? "w-8 bg-black dark:bg-white" 
                    : index < currentStep 
                      ? "w-2 bg-black/60 dark:bg-white/60" 
                      : "w-2 bg-muted"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: index === currentStep ? 1.2 : 1 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur">
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-5`} />
              
              <CardContent className="relative p-12 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                  className="flex justify-center mb-8"
                >
                  <div className={`p-6 rounded-2xl bg-gradient-to-br ${step.gradient} shadow-xl`}>
                    <step.icon className="h-12 w-12 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {step.title}
                    </h1>
                    <p className={`text-xl font-medium bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                      {step.subtitle}
                    </p>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                    {step.description}
                  </p>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
                >
                  <Button
                    variant="ghost"
                    onClick={skipOnboarding}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip intro
                  </Button>
                  
                  <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                    <Button
                      onClick={nextStep}
                      size="lg"
                      className="h-14 px-8 text-lg bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-200"
                    >
                      {isLastStep ? (
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          Start My Journey
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Next
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Step counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          {currentStep + 1} of {onboardingSteps.length}
        </motion.div>
      </div>
    </div>
  );
}