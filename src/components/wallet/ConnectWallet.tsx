"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, ChevronDown, LogOut, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Wallet icons as simple components
const MetaMaskIcon = () => (
    <svg width="20" height="20" viewBox="0 0 212 189" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60.4 0L105.9 36.1L95 15.2L60.4 0Z" fill="#E2761B" stroke="#E2761B" />
        <path d="M151.6 0L106 36.3L116.8 15.2L151.6 0Z" fill="#E4761B" stroke="#E4761B" />
    </svg>
);

const WalletConnectIcon = () => (
    <svg width="20" height="20" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="200" fill="#3B99FC" />
        <path d="M122.5 141.5C166.5 97.5 233.5 97.5 277.5 141.5L283 147L259.5 171L254 165.5C223 134.5 177 134.5 146 165.5L140 171L116.5 147L122.5 141.5Z" fill="white" />
    </svg>
);

const CoinbaseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="512" cy="512" r="512" fill="#0052FF" />
        <path d="M512 256C370.5 256 256 370.5 256 512C256 653.5 370.5 768 512 768C653.5 768 768 653.5 768 512C768 370.5 653.5 256 512 256ZM512 640C441.3 640 384 582.7 384 512C384 441.3 441.3 384 512 384C582.7 384 640 441.3 640 512C640 582.7 582.7 640 512 640Z" fill="white" />
    </svg>
);

const getWalletIcon = (connectorName: string) => {
    const name = connectorName.toLowerCase();
    if (name.includes("metamask") || name.includes("injected")) return <MetaMaskIcon />;
    if (name.includes("walletconnect")) return <WalletConnectIcon />;
    if (name.includes("coinbase")) return <CoinbaseIcon />;
    return <Wallet className="h-5 w-5" />;
};

const getWalletName = (connectorName: string) => {
    const name = connectorName.toLowerCase();
    if (name.includes("injected")) return "MetaMask";
    return connectorName;
};

export function ConnectWallet() {
    const { address, isConnected, connector } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDisconnect = () => {
        disconnect();
        setIsOpen(false);
    };

    // Connected state
    if (isConnected && address) {
        return (
            <div className="relative">
                <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="font-mono text-sm border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500"
                >
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                    {address.slice(0, 6)}...{address.slice(-4)}
                    <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                </Button>

                {/* Dropdown */}
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="p-4 border-b border-border">
                                <p className="font-mono text-xs text-muted-foreground mb-1">Connected with {connector?.name}</p>
                                <p className="font-mono text-sm text-foreground truncate">{address}</p>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={handleCopyAddress}
                                    className="w-full flex items-center gap-2 px-3 py-2 font-mono text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                    {copied ? "Copied!" : "Copy Address"}
                                </button>
                                <button
                                    onClick={handleDisconnect}
                                    className="w-full flex items-center gap-2 px-3 py-2 font-mono text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Disconnected state - show wallet options
    return (
        <div className="relative">
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className="font-mono text-sm border-electric-blue/50 text-electric-blue hover:bg-electric-blue/10 hover:border-electric-blue"
            >
                <Wallet className="mr-2 h-4 w-4" />
                {isPending ? "Connecting..." : "Connect Wallet"}
                <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </Button>

            {/* Wallet Selection Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <div>
                                <p className="font-mono text-sm font-bold">Connect Wallet</p>
                                <p className="font-mono text-xs text-muted-foreground">Choose your wallet</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-muted rounded"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                        <div className="p-2 space-y-1">
                            {connectors.map((c) => (
                                <button
                                    key={c.uid}
                                    onClick={() => {
                                        connect({ connector: c });
                                        setIsOpen(false);
                                    }}
                                    disabled={isPending}
                                    className="w-full flex items-center gap-3 px-4 py-3 font-mono text-sm hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        {getWalletIcon(c.name)}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">{getWalletName(c.name)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {c.name.toLowerCase().includes("injected")
                                                ? "Browser Extension"
                                                : c.name.toLowerCase().includes("walletconnect")
                                                    ? "Mobile & Desktop"
                                                    : "Smart Wallet"
                                            }
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 border-t border-border bg-muted/30">
                            <p className="font-mono text-[10px] text-muted-foreground text-center">
                                By connecting, you agree to our Terms of Service
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ConnectWallet;
