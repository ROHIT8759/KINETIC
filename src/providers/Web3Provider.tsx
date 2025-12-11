"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http, createConnector } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { ReactNode, useState } from "react";

// Story Protocol Aeneid testnet chain configuration (updated from Iliad)
const storyTestnet = {
    id: 1315,
    name: "Story Aeneid Testnet",
    nativeCurrency: {
        decimals: 18,
        name: "IP",
        symbol: "IP",
    },
    rpcUrls: {
        default: { http: ["https://aeneid.storyrpc.io"] },
        public: { http: ["https://aeneid.storyrpc.io"] },
    },
    blockExplorers: {
        default: { name: "Story Explorer", url: "https://aeneid.storyscan.xyz" },
    },
    testnet: true,
} as const;

// Create wagmi config - connectors will be auto-detected from window.ethereum
const config = createConfig({
    chains: [storyTestnet, mainnet, sepolia],
    transports: {
        [storyTestnet.id]: http(),
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
    // Let wagmi auto-detect injected wallets (MetaMask, etc.)
    ssr: true,
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
