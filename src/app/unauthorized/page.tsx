"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Lock, ArrowLeft, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function UnauthorizedPage() {
  const [showDemo, setShowDemo] = useState(true);

  const handleGoHome = () => {
    // In a real app, this would navigate to home
    setShowDemo(false);
    setTimeout(() => setShowDemo(true), 2000); // Reset for demo
  };

  if (!showDemo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-green-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-green-600 dark:text-green-400 text-xl font-semibold mb-2">
            Redirected to Home!
          </div>
          <div className="text-sm text-green-500">
            Demo will reset in 2 seconds...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute inset-0 pointer-events-none"
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-red-500/5 dark:bg-red-500/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 150 + 30}px`,
              height: `${Math.random() * 150 + 30}px`,
            }}
            animate={{
              y: [0, Math.random() * 20 - 10],
              x: [0, Math.random() * 20 - 10],
              scale: [1, 1.1, 1],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              duration: Math.random() * 8 + 6,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-red-200 dark:border-red-900 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
          <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-b border-red-100 dark:border-red-900/50">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="flex justify-center mb-3"
            >
              <div className="rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 p-4 shadow-lg">
                <Lock className="h-10 w-10 text-red-500 dark:text-red-400" />
              </div>
            </motion.div>
            <CardTitle className="text-center text-red-600 dark:text-red-400 text-2xl font-bold">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Access Denied
              </motion.span>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-5"
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                >
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                </motion.div>
                <motion.p
                  className="text-slate-700 dark:text-slate-300 leading-relaxed"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  You don&apos;t have permission to access this page. Please
                  contact your administrator if you believe this is an error.
                </motion.p>
              </div>

              <motion.div
                className="w-full h-[2px] bg-gradient-to-r from-transparent via-red-300 dark:via-red-700 to-transparent rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 1, ease: "easeInOut" }}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-center"
              >
                <div className="inline-flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Error Code: 403 Forbidden
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </CardContent>

          <CardFooter className="flex justify-center pb-6 pt-2 space-x-3">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              <Button
                onClick={handleGoHome}
                className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-10 left-10"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: {
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
          scale: {
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
      >
        <div className="w-8 h-8 border-2 border-red-300/30 dark:border-red-700/30 rounded-full"></div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-16"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div className="w-6 h-6 bg-red-200/40 dark:bg-red-800/40 rounded-full"></div>
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-8"
        animate={{
          x: [0, 15, 0],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div className="w-4 h-4 bg-gradient-to-br from-red-300/50 to-rose-300/50 dark:from-red-700/50 dark:to-rose-700/50 rounded-full"></div>
      </motion.div>
    </div>
  );
}
