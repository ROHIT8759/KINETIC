"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { IPAsset, LicenseTerms } from "@/hooks/useStoryProtocol";

// Demo data for the marketplace
const demoAssets: IPAsset[] = [
    {
        id: "1",
        title: "Precision Wood Carving Technique",
        description: "Detailed demonstration of intricate wood carving for furniture restoration",
        skillCategory: "Fine Motor Skills",
        videoUrl: "ipfs://QmDemo1",
        thumbnailUrl: "/api/placeholder/400/300",
        owner: "0x1234...5678",
        isVerifiedHuman: true,
        ipId: "0xip1234567890abcdef",
        txHash: "0xtx1234567890",
        createdAt: new Date("2024-01-15"),
    },
    {
        id: "2",
        title: "Industrial Welding - MIG Technique",
        description: "Professional MIG welding technique for steel fabrication",
        skillCategory: "Heavy Lifting",
        videoUrl: "ipfs://QmDemo2",
        thumbnailUrl: "/api/placeholder/400/300",
        owner: "0xabcd...efgh",
        isVerifiedHuman: true,
        ipId: "0xip2345678901bcdef0",
        txHash: "0xtx2345678901",
        createdAt: new Date("2024-01-20"),
    },
    {
        id: "3",
        title: "Artisan Bread Kneading",
        description: "Traditional sourdough bread kneading technique passed down through generations",
        skillCategory: "Fine Motor Skills",
        videoUrl: "ipfs://QmDemo3",
        thumbnailUrl: "/api/placeholder/400/300",
        owner: "0x9876...5432",
        isVerifiedHuman: true,
        ipId: "0xip3456789012cdef01",
        txHash: "0xtx3456789012",
        createdAt: new Date("2024-02-01"),
    },
    {
        id: "4",
        title: "Precision Soldering for PCB Assembly",
        description: "Surface mount soldering technique for electronics manufacturing",
        skillCategory: "Precision Assembly",
        videoUrl: "ipfs://QmDemo4",
        thumbnailUrl: "/api/placeholder/400/300",
        owner: "0xfedc...ba98",
        isVerifiedHuman: true,
        ipId: "0xip4567890123def012",
        txHash: "0xtx4567890123",
        createdAt: new Date("2024-02-10"),
    },
    {
        id: "5",
        title: "Warehouse Package Handling",
        description: "Efficient and safe package handling techniques for logistics",
        skillCategory: "Heavy Lifting",
        videoUrl: "ipfs://QmDemo5",
        thumbnailUrl: "/api/placeholder/400/300",
        owner: "0x1111...2222",
        isVerifiedHuman: true,
        ipId: "0xip5678901234ef0123",
        txHash: "0xtx5678901234",
        createdAt: new Date("2024-02-15"),
    },
    {
        id: "6",
        title: "Sushi Rolling Mastery",
        description: "Traditional Japanese sushi rolling technique with precision",
        skillCategory: "Fine Motor Skills",
        videoUrl: "ipfs://QmDemo6",
        thumbnailUrl: "/api/placeholder/400/300",
        owner: "0x3333...4444",
        isVerifiedHuman: true,
        ipId: "0xip6789012345f01234",
        txHash: "0xtx6789012345",
        createdAt: new Date("2024-02-20"),
    },
];

interface MarketplaceContextType {
    assets: IPAsset[];
    addAsset: (asset: IPAsset) => void;
    getAsset: (id: string) => IPAsset | undefined;
    updateAssetLicense: (id: string, license: LicenseTerms) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
    const [assets, setAssets] = useState<IPAsset[]>(demoAssets);

    const addAsset = (asset: IPAsset) => {
        setAssets((prev) => [asset, ...prev]);
    };

    const getAsset = (id: string) => {
        return assets.find((asset) => asset.id === id);
    };

    const updateAssetLicense = (id: string, license: LicenseTerms) => {
        setAssets((prev) =>
            prev.map((asset) =>
                asset.id === id ? { ...asset, license } : asset
            )
        );
    };

    return (
        <MarketplaceContext.Provider value={{ assets, addAsset, getAsset, updateAssetLicense }}>
            {children}
        </MarketplaceContext.Provider>
    );
}

export function useMarketplace() {
    const context = useContext(MarketplaceContext);
    if (!context) {
        throw new Error("useMarketplace must be used within a MarketplaceProvider");
    }
    return context;
}
