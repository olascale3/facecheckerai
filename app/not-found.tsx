"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 h-14">
          <div
            className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-base tracking-tight">FaceChecker.AI</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-muted-foreground">404</span>
            </div>
            <h1 className="text-lg font-bold mb-2">Page Not Found</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The page you{"'"}re looking for doesn{"'"}t exist or has been moved.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
