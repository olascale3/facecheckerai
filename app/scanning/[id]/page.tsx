"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); });

const scanSteps = [
  "Initializing neural networks...",
  "Detecting facial landmarks...",
  "Extracting biometric features...",
  "Generating facial embedding vector...",
  "Scanning social media platforms...",
  "Searching public databases...",
  "Analyzing news archives...",
  "Cross-referencing image repositories...",
  "Compiling match results...",
  "Finalizing report...",
];

export default function ScanningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const { data: search, error } = useSWR(
    `/api/searches/${id}`,
    fetcher,
    { refreshInterval: 2000, errorRetryCount: 2 }
  );

  useEffect(() => {
    if (error) {
      router.push("/");
    }
  }, [error, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 3 + 1;
        return next >= 100 ? 100 : next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepIndex = Math.min(Math.floor(progress / 10), scanSteps.length - 1);
    if (stepIndex > currentStep) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    setCurrentStep(stepIndex);
  }, [progress, currentStep]);

  useEffect(() => {
    if (search?.status === "completed") {
      const timer = setTimeout(() => router.push(`/results/${id}`), 800);
      return () => clearTimeout(timer);
    }
    if (search?.status === "failed") {
      router.push("/");
    }
  }, [search?.status, id, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 h-14">
          <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center cursor-pointer" onClick={() => router.push("/")} data-testid="link-home-logo">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-base tracking-tight">FaceChecker.AI</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-lg text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" style={{ animationDuration: "1.5s" }} />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary/60 animate-spin" style={{ animationDuration: "2.5s", animationDirection: "reverse" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold font-mono text-primary" data-testid="text-progress-percent">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-2">Scanning the Internet</h2>
            <p className="text-sm text-muted-foreground mb-8">Our AI is searching billions of images across the web</p>

            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-8">
              <motion.div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>

            <div className="space-y-2 text-left max-w-sm mx-auto">
              {scanSteps.map((step, i) => {
                const isCompleted = completedSteps.includes(i);
                const isCurrent = i === currentStep;
                const isFuture = i > currentStep;

                return (
                  <motion.div
                    key={step}
                    className={`flex items-center gap-3 py-1.5 px-3 rounded-md text-xs font-mono transition-colors ${
                      isCurrent ? "text-primary bg-primary/5" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/30"
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isFuture ? 0.3 : 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isCurrent ? "bg-primary animate-pulse" : isCompleted ? "bg-muted-foreground" : "bg-muted-foreground/30"
                    }`} />
                    {step}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
