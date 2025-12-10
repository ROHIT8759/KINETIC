"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Upload, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectWallet } from "@/components/wallet";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Explore", href: "/explore", icon: Grid3X3 },
    { name: "Upload", href: "/upload", icon: Upload },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-slate-950/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative">
                        <Zap className="h-8 w-8 text-neon-orange transition-all group-hover:text-electric-blue" />
                        <div className="absolute inset-0 blur-sm opacity-50">
                            <Zap className="h-8 w-8 text-neon-orange transition-all group-hover:text-electric-blue" />
                        </div>
                    </div>
                    <span className="font-mono text-xl font-bold tracking-tight">
                        <span className="text-neon-orange">KINE</span>
                        <span className="text-electric-blue">TIC</span>
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "font-mono text-sm transition-all",
                                        isActive
                                            ? "text-electric-blue bg-electric-blue/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.name}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                {/* Wallet Connection */}
                <ConnectWallet />
            </div>

            {/* Mobile Navigation */}
            <nav className="md:hidden flex items-center justify-center gap-2 pb-3 px-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className="flex-1">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full font-mono text-sm transition-all",
                                    isActive
                                        ? "text-electric-blue bg-electric-blue/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.name}
                            </Button>
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-slate-950/50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-neon-orange" />
                        <span className="font-mono text-sm text-muted-foreground">
                            <span className="text-neon-orange">KINE</span>
                            <span className="text-electric-blue">TIC</span>
                            {" "}© 2024
                        </span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
                        <span>Powered by</span>
                        <span className="text-electric-blue">Story Protocol</span>
                        <span>×</span>
                        <span className="text-neon-orange">World ID</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Header;
