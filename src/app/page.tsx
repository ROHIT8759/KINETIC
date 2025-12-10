import Link from "next/link";
import { Zap, Upload, Grid3X3, Shield, Bot, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950" />

        {/* Animated Grid */}
        <div className="absolute inset-0 cyber-grid opacity-30" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Zap className="h-16 w-16 text-neon-orange" />
              <div className="absolute inset-0 blur-md opacity-50">
                <Zap className="h-16 w-16 text-neon-orange" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-mono text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="text-neon-orange text-glow-orange">KINE</span>
            <span className="text-electric-blue text-glow-blue">TIC</span>
          </h1>

          {/* Tagline */}
          <p className="font-mono text-xl md:text-2xl text-muted-foreground mb-2">
            Real-World Assets for AI Robotics
          </p>
          <p className="font-mono text-sm text-muted-foreground/70 max-w-2xl mx-auto mb-8">
            Upload videos of physical tasks. Get verified as human. License your skills as training data for the next generation of AI robots.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-neon-orange hover:bg-neon-orange/80 text-black font-mono font-bold px-8 glow-orange"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Skill
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="border-electric-blue text-electric-blue hover:bg-electric-blue/10 font-mono font-bold px-8"
              >
                <Grid3X3 className="mr-2 h-5 w-5" />
                Explore Marketplace
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-12 font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-electric-blue" />
              <span>Powered by Story Protocol</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neon-orange" />
              <span>World ID Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-950/50">
        <div className="container mx-auto px-4">
          <h2 className="font-mono text-2xl md:text-3xl font-bold text-center mb-12">
            <span className="text-muted-foreground">How </span>
            <span className="text-electric-blue">Kinetic</span>
            <span className="text-muted-foreground"> Works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Upload & Verify",
                description: "Record a video of your real-world skill. Verify you're human with World ID.",
                icon: <Upload className="h-8 w-8" />,
                color: "orange",
              },
              {
                step: "02",
                title: "Register as IP",
                description: "Your skill becomes a registered IP asset on Story Protocol's blockchain.",
                icon: <Shield className="h-8 w-8" />,
                color: "blue",
              },
              {
                step: "03",
                title: "Earn from AI",
                description: "Robotics companies license your data for training. You earn royalties.",
                icon: <Bot className="h-8 w-8" />,
                color: "orange",
              },
            ].map((feature) => (
              <Card
                key={feature.step}
                className="border-border/50 bg-card/30 backdrop-blur hover:border-electric-blue/30 transition-all"
              >
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${feature.color === "orange"
                      ? "bg-neon-orange/10 text-neon-orange"
                      : "bg-electric-blue/10 text-electric-blue"
                    }`}>
                    {feature.icon}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground mb-2">
                    STEP {feature.step}
                  </div>
                  <h3 className="font-mono text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="font-mono text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-mono text-2xl md:text-3xl font-bold mb-4">
            <span className="text-neon-orange">Ready to monetize</span>
            <span className="text-muted-foreground"> your skills?</span>
          </h2>
          <p className="font-mono text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the future of human-AI collaboration. Your expertise trains the robots of tomorrow.
          </p>
          <Link href="/upload">
            <Button
              size="lg"
              className="bg-electric-blue hover:bg-electric-blue/80 text-black font-mono font-bold px-8"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
