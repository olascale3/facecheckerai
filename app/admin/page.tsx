"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Lock,
  Eye,
  Search,
  DollarSign,
  Activity,
  ExternalLink,
  Globe,
  ArrowLeft,
  LogOut,
  Percent,
  Calendar,
  CheckCircle,
  XCircle,
  Image,
} from "lucide-react";
import { motion } from "framer-motion";

type AdminSearch = {
  id: string;
  session_id: string;
  image_data: string;
  status: string;
  created_at: string;
  resultCount: number;
  isPaid: boolean;
  payment: {
    id: string;
    amount: number;
    currency: string;
    tx_hash: string;
    status: string;
  } | null;
};

type AdminSearchDetail = {
  search: {
    id: string;
    image_data: string;
    status: string;
    created_at: string;
  };
  results: {
    id: string;
    platform: string;
    match_score: number;
    title: string;
    source_url: string;
    thumbnail_url: string;
  }[];
  payment: {
    amount: number;
    currency: string;
    tx_hash: string;
    status: string;
  } | null;
};

type AdminStats = {
  totalSearches: number;
  completedSearches: number;
  totalPayments: number;
  totalRevenue: number;
};

function useAdminToken() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_token");
    }
    return null;
  });

  const save = (t: string) => {
    sessionStorage.setItem("admin_token", t);
    setToken(t);
  };

  const clear = () => {
    sessionStorage.removeItem("admin_token");
    setToken(null);
  };

  return { token, save, clear };
}

function LoginGate({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Invalid password");
        return;
      }
      const data = await res.json();
      onLogin(data.token);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="w-full max-w-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-md bg-primary/20 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Admin Access</h1>
              <p className="text-sm text-muted-foreground">FaceChecker.AI Dashboard</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-admin-password"
                />
              </div>
              {error && <p className="text-xs text-destructive text-center" data-testid="text-admin-error">{error}</p>}
              <Button className="w-full" type="submit" disabled={!password.trim() || loading} data-testid="button-admin-login">
                <Lock className="w-4 h-4" />
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold" data-testid={`text-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SearchDetailDialog({
  searchId,
  token,
  open,
  onClose,
}: {
  searchId: string | null;
  token: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useSWR<AdminSearchDetail>(
    searchId && open ? `/api/admin/searches/${searchId}` : null,
    (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Search Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {data.search.image_data && (
                <div className="w-20 h-20 rounded-md overflow-hidden border border-border shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.search.image_data} alt="Uploaded" className="w-full h-full object-cover" data-testid="img-admin-search-face" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={data.search.status === "completed" ? "default" : "secondary"}>
                    {data.search.status}
                  </Badge>
                  {data.payment && (
                    <Badge variant="default">
                      <DollarSign className="w-3 h-3 mr-0.5" />
                      Paid
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">ID: {data.search.id}</p>
                <p className="text-xs text-muted-foreground">Created: {new Date(data.search.created_at).toLocaleString()}</p>
              </div>
            </div>

            {data.payment && (
              <Card>
                <CardContent className="p-3 space-y-1">
                  <p className="text-xs font-medium">Payment Info</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-muted-foreground">Amount</span>
                    <span>${data.payment.amount} {data.payment.currency}</span>
                    <span className="text-muted-foreground">TX Hash</span>
                    <span className="font-mono truncate">{data.payment.tx_hash}</span>
                    <span className="text-muted-foreground">Status</span>
                    <span>{data.payment.status}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Results ({data.results.length})</p>
              <div className="space-y-2">
                {data.results.map((result, i) => (
                  <Card key={result.id} data-testid={`card-admin-result-${i}`}>
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 rounded-md overflow-hidden border border-border shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={result.thumbnail_url} alt="Result" className="w-full h-full object-cover" data-testid={`img-admin-result-thumb-${i}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-medium">{result.platform}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              <Percent className="w-3 h-3 mr-0.5" />
                              {Math.round(result.match_score * 100)}%
                            </Badge>
                          </div>
                          <p className="text-xs truncate mb-0.5">{result.title}</p>
                          <a href={result.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary" data-testid={`link-admin-result-${i}`}>
                            <ExternalLink className="w-3 h-3" />
                            {result.source_url}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {data.results.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No results yet</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const router = useRouter();
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);

  const authFetcher = (url: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); });

  const { data: stats } = useSWR<AdminStats>("/api/admin/stats", authFetcher);
  const { data: searches, isLoading } = useSWR<AdminSearch[]>("/api/admin/searches", authFetcher);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-base tracking-tight">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} data-testid="button-admin-home">
              <ArrowLeft className="w-4 h-4" />
              Site
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} data-testid="button-admin-logout">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total Searches" value={stats.totalSearches} icon={Search} />
              <StatCard label="Completed" value={stats.completedSearches} icon={Activity} />
              <StatCard label="Payments" value={stats.totalPayments} icon={DollarSign} />
              <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} />
            </div>
          )}

          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h2 className="text-lg font-bold">All Searches</h2>
            <Badge variant="secondary">{searches?.length ?? 0} total</Badge>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : searches && searches.length > 0 ? (
            <div className="space-y-2">
              {searches.map((search, i) => (
                <Card
                  key={search.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setSelectedSearchId(search.id)}
                  data-testid={`card-admin-search-${i}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center shrink-0">
                        <Image className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-sm font-medium font-mono truncate">{search.id}</span>
                          <Badge variant={search.status === "completed" ? "default" : "secondary"}>
                            {search.status === "completed" ? <CheckCircle className="w-3 h-3 mr-0.5" /> : search.status === "failed" ? <XCircle className="w-3 h-3 mr-0.5" /> : null}
                            {search.status}
                          </Badge>
                          {search.isPaid && (
                            <Badge variant="default">
                              <DollarSign className="w-3 h-3 mr-0.5" />
                              Paid
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(search.created_at).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {search.resultCount} results
                          </span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" data-testid={`button-view-search-${i}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No Searches Yet</h3>
                <p className="text-sm text-muted-foreground">Searches will appear here when users start uploading photos.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>

      <SearchDetailDialog searchId={selectedSearchId} token={token} open={!!selectedSearchId} onClose={() => setSelectedSearchId(null)} />
    </div>
  );
}

export default function AdminPage() {
  const { token, save, clear } = useAdminToken();

  if (!token) {
    return <LoginGate onLogin={save} />;
  }

  return <AdminDashboard token={token} onLogout={clear} />;
}
