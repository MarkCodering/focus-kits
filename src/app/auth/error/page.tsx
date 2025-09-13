"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link was invalid or has expired.",
  Default: "An unexpected error occurred during authentication.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur">
            <CardHeader className="text-center space-y-4 pb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                className="flex justify-center"
              >
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-xl">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-foreground">
                  Authentication Error
                </CardTitle>
                <CardDescription className="text-lg">
                  {errorMessage}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col gap-3"
              >
                <Link href="/auth/signin">
                  <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }} className="w-full">
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <RefreshCw className="h-5 w-5 mr-3" />
                      Try Again
                    </Button>
                  </motion.div>
                </Link>

                <Link href="/">
                  <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }} className="w-full">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-14 text-lg"
                    >
                      <ArrowLeft className="h-5 w-5 mr-3" />
                      Back to Home
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-xs text-muted-foreground text-center"
              >
                If this problem persists, please contact support.
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}