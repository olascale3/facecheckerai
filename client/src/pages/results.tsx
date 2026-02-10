import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Shield, Lock, ExternalLink, Copy, Check, ArrowLeft, AlertTriangle, Globe, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { Search, SearchResult } from "@shared/schema";

function MatchScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  let variant: "default" | "secondary" | "destructive" = "default";
  if (pct < 70) variant = "secondary";
  if (pct >= 90) variant = "default";

  return (
    <Badge variant={variant} className="text-xs">
      <Percent className="w-3 h-3 mr-0.5" />
      {pct}% match
    </Badge>
  );
}

function BlurredOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md rounded-md z-10">
      <Lock className="w-6 h-6 text-primary mb-2" />
      <span className="text-xs font-medium text-primary">Locked</span>
    </div>
  );
}

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: search, isLoading: searchLoading } = useQuery<Search>({
    queryKey: ["/api/searches", id],
  });

  const { data: results, isLoading: resultsLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/searches", id, "results"],
  });

  const unlockMutation = useMutation({
    mutationFn: async (data: { txHash: string }) => {
      const res = await apiRequest("POST", `/api/searches/${id}/unlock`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/searches", id, "results"] });
      setPaymentOpen(false);
      setTxHash("");
      toast({ title: "Results Unlocked", description: "You now have full access to all search results." });
    },
    onError: () => {
      toast({ title: "Verification Failed", description: "Could not verify payment. Please check your transaction hash.", variant: "destructive" });
    },
  });

  const walletAddress = "6D9hPAdCYbH2tXRra6gVQn5P1AToLseyirvpQtbziFk9";
  const isUnlocked = results?.some((r) => r.isUnlocked) ?? false;
  const isLoading = searchLoading || resultsLoading;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")} data-testid="link-results-home">
              <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-base tracking-tight">FaceChecker.AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} data-testid="button-new-search">
              <ArrowLeft className="w-4 h-4" />
              New Search
            </Button>
            {!isUnlocked && (
              <Button size="sm" onClick={() => setPaymentOpen(true)} data-testid="button-unlock-results">
                <Lock className="w-4 h-4" />
                Unlock All Results
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold mb-1">Search Results</h1>
              <p className="text-sm text-muted-foreground">
                Found {results?.length ?? 0} potential matches across the web
              </p>
            </div>
            {search?.imageData && (
              <div className="w-14 h-14 rounded-md overflow-hidden border border-border shrink-0">
                <img src={search.imageData} alt="Searched face" className="w-full h-full object-cover" data-testid="img-searched-face" />
              </div>
            )}
          </div>

          {!isUnlocked && (
            <Card className="mb-6 border-primary/30">
              <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-medium">Results are partially hidden</p>
                  <p className="text-xs text-muted-foreground">Unlock full details including source URLs, profile links, and image context for $9.99</p>
                </div>
                <Button size="sm" onClick={() => setPaymentOpen(true)} data-testid="button-unlock-banner">
                  <Lock className="w-4 h-4" />
                  Unlock Now
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {results?.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-visible" data-testid={`card-result-${i}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden border border-border shrink-0">
                        <img
                          src={result.thumbnailUrl}
                          alt="Match thumbnail"
                          className={`w-full h-full object-cover ${!isUnlocked ? "blur-lg" : ""}`}
                          data-testid={`img-result-thumb-${i}`}
                        />
                        {!isUnlocked && <BlurredOverlay />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium" data-testid={`text-platform-${i}`}>{result.platform}</span>
                            </div>
                            <MatchScoreBadge score={result.matchScore} />
                          </div>
                        </div>

                        <h3 className={`text-sm font-medium mb-1 truncate ${!isUnlocked ? "blur-sm select-none" : ""}`} data-testid={`text-result-title-${i}`}>
                          {result.title}
                        </h3>

                        <p className={`text-xs text-muted-foreground line-clamp-2 mb-2 ${!isUnlocked ? "blur-sm select-none" : ""}`}>
                          {result.description}
                        </p>

                        {isUnlocked ? (
                          <a
                            href={result.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary"
                            data-testid={`link-result-source-${i}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            {result.sourceUrl}
                          </a>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="w-3 h-3" />
                            <span className="blur-sm select-none">https://www.example.com/hidden-url</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {(!results || results.length === 0) && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No Matches Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Great news! We didn't find this face anywhere on the internet.
                </p>
                <Button variant="outline" onClick={() => navigate("/")} data-testid="button-search-again">
                  Search Another Face
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Unlock Full Results
            </DialogTitle>
            <DialogDescription>
              Send $9.99 in SOL or USDT/USDC (Solana network) to unlock all search result details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Send payment to this wallet address</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-secondary rounded-md px-3 py-2 text-xs font-mono break-all select-all" data-testid="text-wallet-address">
                  {walletAddress}
                </div>
                <Button size="icon" variant="outline" onClick={handleCopy} data-testid="button-copy-wallet">
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-md p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">$9.99 USD</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium">Solana</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">Accepted</span>
                <span className="font-medium">SOL, USDT, USDC</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Enter your transaction hash to verify payment
              </label>
              <Input
                placeholder="Enter Solana transaction signature..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="font-mono text-xs"
                data-testid="input-tx-hash"
              />
            </div>

            <Button
              className="w-full"
              disabled={!txHash.trim() || unlockMutation.isPending}
              onClick={() => unlockMutation.mutate({ txHash: txHash.trim() })}
              data-testid="button-verify-payment"
            >
              {unlockMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Verify & Unlock
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Payment verification typically takes 10-30 seconds. Contact support if you experience issues.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
