"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Chrome, Mail, Shield, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const setUpProviders = async () => {
      const response = await getProviders();
      setProviders(response);
    };
    setUpProviders();
  }, []);

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true);
    try {
      await signIn(providerId, { 
        callbackUrl: "/" 
      });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur">
            <CardHeader className="text-center space-y-4 pb-8">
              {/* Logo/Icon */}
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
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-lg">
                  Sign in to continue your focus journey
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Benefits preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure authentication with Google</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Sync progress across all devices</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-purple-500" />
                  <span>Get personalized focus insights</span>
                </div>
              </motion.div>

              <Separator />

              {/* Google Sign In */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {providers && Object.values(providers).map((provider) => (
                  <div key={provider.name}>
                    <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                      <Button
                        onClick={() => handleSignIn(provider.id)}
                        disabled={isLoading}
                        size="lg"
                        className="w-full h-14 text-lg bg-white text-black border border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-600 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Chrome className="h-5 w-5 mr-3" />
                        {isLoading ? "Signing in..." : `Continue with ${provider.name}`}
                      </Button>
                    </motion.div>
                  </div>
                ))}
              </motion.div>

              {/* Privacy note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-xs text-muted-foreground text-center space-y-1"
              >
                <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
                <p>We only access basic profile information and email.</p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          New to Focus Kits? Your journey starts here.
        </motion.div>
      </div>
    </div>
  );
}