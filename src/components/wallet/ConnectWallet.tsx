"use client";

import { useState, useEffect } from "react";
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

export function ConnectWallet() {
    const { address, isConnected, connector } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

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

    // Direct MetaMask connection using window.ethereum
    const handleDirectConnect = async () => {
        if (typeof window === "undefined") return;

        const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
        if (!ethereum) {
            alert("Please install MetaMask to connect your wallet");
            return;
        }

        setIsConnecting(true);
        try {
            // Request account access
            await ethereum.request({ method: "eth_requestAccounts" });

            // Find and use the injected connector
            const injectedConnector = connectors.find(
                (c) => c.id === "injected" || c.name.toLowerCase().includes("injected")
            );

            if (injectedConnector) {
                connect({ connector: injectedConnector });
            }
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to connect:", error);
        } finally {
            setIsConnecting(false);
        }
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
                                <p className="font-mono text-xs text-muted-foreground mb-1">Connected with {connector?.name || "MetaMask"}</p>
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

    // Disconnected state - simple connect button
    return (
        <div className="relative">
            <Button
                variant="outline"
                onClick={handleDirectConnect}
                disabled={isPending || isConnecting}
                className="font-mono text-sm border-electric-blue/50 text-electric-blue hover:bg-electric-blue/10 hover:border-electric-blue"
            >
                <Wallet className="mr-2 h-4 w-4" />
                {isPending || isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
        </div>
    );
}

export default ConnectWallet;
