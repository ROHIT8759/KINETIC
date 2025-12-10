"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { ReactNode, useState } from "react";

// Story Protocol testnet chain configuration
const storyTestnet = {
    id: 1513,
    name: "Story Iliad Testnet",
    nativeCurrency: {
        decimals: 18,
        name: "IP",
        symbol: "IP",
    },
    rpcUrls: {
        default: { http: ["https://testnet.storyrpc.io"] },
        public: { http: ["https://testnet.storyrpc.io"] },
    },
    blockExplorers: {
        default: { name: "Story Explorer", url: "https://testnet.storyscan.xyz" },
    },
    testnet: true,
} as const;

// Create wagmi config without connectors import
// The injected provider will be auto-detected
const config = createConfig({
    chains: [storyTestnet, mainnet, sepolia],
    transports: {
        [storyTestnet.id]: http(),
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
});

interface Web3ProviderProps {
    children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }));

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default Web3Provider;
