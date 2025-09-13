"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Chrome, Loader2 } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("focus-kits-onboarding-seen");
      setHasSeenOnboarding(!!seen);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [isLoading, isAuthenticated, hasSeenOnboarding]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("focus-kits-onboarding-seen", "true");
    }
    setHasSeenOnboarding(true);
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur">
            <CardHeader className="text-center space-y-4 pb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                className="flex justify-center"
              >
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Focus Kits
                </CardTitle>
                <CardDescription className="text-lg">
                  Sign in to start your focus journey
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                  <Button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    size="lg"
                    className="w-full h-14 text-lg bg-white text-black border border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-600 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSigningIn ? (
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      <Chrome className="h-5 w-5 mr-3" />
                    )}
                    {isSigningIn ? "Signing in..." : "Continue with Google"}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-xs text-muted-foreground text-center"
              >
                Secure authentication • Sync across devices • Personalized experience
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}