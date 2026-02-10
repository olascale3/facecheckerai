import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Shield, Search, Zap, Eye, Lock, Globe, AlertTriangle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [, navigate] = useLocation();
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const res = await apiRequest("POST", "/api/searches", { imageData });
      return res.json();
    },
    onSuccess: (data) => {
      navigate(`/scanning/${data.id}`);
    },
  });

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      setPreview(data);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSearch = () => {
    if (preview) {
      uploadMutation.mutate(preview);
    }
  };

  const stats = [
    { value: "2.4B+", label: "Images Indexed" },
    { value: "99.7%", label: "Accuracy Rate" },
    { value: "187", label: "Countries Covered" },
    { value: "<3s", label: "Average Scan Time" },
  ];

  const steps = [
    { icon: Upload, title: "Upload a Photo", desc: "Drop or select any photo containing a face you want to search for across the internet." },
    { icon: Search, title: "AI Deep Scan", desc: "Our neural networks scan billions of indexed images across social media, news sites, and public databases." },
    { icon: Eye, title: "Review Matches", desc: "See where the face appears online with match confidence scores and source previews." },
    { icon: Lock, title: "Unlock Full Details", desc: "Pay a small fee to access complete URLs, profile links, and detailed source information." },
  ];

  const features = [
    { icon: Shield, title: "Identity Protection", desc: "Find unauthorized use of your photos before scammers exploit them." },
    { icon: AlertTriangle, title: "Deepfake Detection", desc: "Discover AI-generated images using your likeness across the web." },
    { icon: Globe, title: "Global Coverage", desc: "Search across 500M+ profiles on social networks, forums, and public records." },
    { icon: Zap, title: "Lightning Fast", desc: "Proprietary AI delivers results in seconds, not hours." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-base tracking-tight" data-testid="text-logo">FaceChecker.AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors" data-testid="link-how-it-works">How It Works</a>
            <a href="#features" className="text-sm text-muted-foreground transition-colors" data-testid="link-features">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors" data-testid="link-pricing">Pricing</a>
          </nav>
          <Button size="sm" onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })} data-testid="button-start-search">
            Start Search
          </Button>
        </div>
      </header>

      <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-6">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Reverse Face Search
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Protect Your{" "}
            <span className="text-primary">Digital Identity</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover where any face appears across the internet. Find unauthorized photos, deepfakes, and stolen identities in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center gap-3 mb-12 flex-wrap"
          >
            <Button size="lg" onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })} data-testid="button-hero-search">
              <Search className="w-4 h-4" />
              Search a Face Now
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} data-testid="button-learn-more">
              Learn More
              <ChevronDown className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center py-4">
              <div className="text-2xl sm:text-3xl font-bold text-primary" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <section id="upload-section" className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-center mb-6">Upload a Photo to Search</h2>

                <AnimatePresence mode="wait">
                  {!preview ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div
                        className={`relative border-2 border-dashed rounded-md p-12 text-center cursor-pointer transition-colors ${
                          dragOver ? "border-primary bg-primary/5" : "border-border"
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="dropzone-upload"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                          }}
                          data-testid="input-file-upload"
                        />
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-base font-medium mb-2">
                          {dragOver ? "Drop your image here" : "Drag & drop a face photo"}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                        <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP up to 10MB</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <div className="relative mx-auto w-48 h-48 rounded-md overflow-hidden border border-border">
                        <img src={preview} alt="Uploaded face" className="w-full h-full object-cover" data-testid="img-preview" />
                        <div className="absolute inset-0 border-2 border-primary/40 rounded-md pointer-events-none" />
                        <div className="absolute top-2 left-2 right-2 bottom-2 border border-primary/20 rounded-sm pointer-events-none" />
                      </div>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <Button
                          onClick={handleSearch}
                          disabled={uploadMutation.isPending}
                          data-testid="button-search-face"
                        >
                          {uploadMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4" />
                              Search This Face
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          data-testid="button-clear-photo"
                        >
                          Choose Different Photo
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-xs text-muted-foreground text-center mt-6">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Your photos are encrypted and never stored permanently. We respect your privacy.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Four simple steps to uncover where any face appears across the internet.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <step.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">Step {i + 1}</span>
                    </div>
                    <h3 className="font-semibold mb-2 text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-3">Why FaceChecker.AI</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for individuals who take their online security seriously.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-5 flex gap-4">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-3">Simple Pricing</h2>
            <p className="text-muted-foreground">Free preview results. Pay only to unlock full details.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold">$9.99</div>
                  <div className="text-sm text-muted-foreground mt-1">per search unlock</div>
                </div>
                <ul className="space-y-3 text-sm mb-6">
                  {[
                    "Full source URLs & profile links",
                    "Platform names & match confidence",
                    "Detailed image context & metadata",
                    "All results for a single search",
                    "Pay securely with crypto (SOL/USDT)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })} data-testid="button-pricing-start">
                  Start Your Search
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
              <Shield className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm font-medium">FaceChecker.AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            2026 FaceChecker.AI. All rights reserved. For authorized use only.
          </p>
        </div>
      </footer>
    </div>
  );
}
