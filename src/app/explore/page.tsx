"use client";

import { useState, useEffect, useCallback } from "react";
import {
    CheckCircle2,
    Shield,
    Play,
    Filter,
    Search,
    Zap,
    ShoppingCart,
    Pencil,
    Trash2,
    Loader2,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers";
import { VideoEditModal } from "@/components/video";
import type { IPAsset } from "@/hooks/useStoryProtocol";

const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

const SKILL_CATEGORIES = [
    "All Categories",
    "Fine Motor Skills",
    "Heavy Lifting",
    "Precision Assembly",
    "Food Preparation",
    "Construction",
    "Craftsmanship",
    "Agricultural Tasks",
    "Medical Procedures",
];

interface AssetCardProps {
    asset: IPAsset;
    isOwner: boolean;
    onEdit?: (asset: IPAsset) => void;
    onDelete?: (asset: IPAsset) => void;
}

function AssetCard({ asset, isOwner, onEdit, onDelete }: AssetCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getVideoThumbnailUrl = (videoUrl: string): string | null => {
        if (videoUrl.startsWith('ipfs://')) {
            const hash = videoUrl.replace('ipfs://', '');
            return `${PINATA_GATEWAY}/ipfs/${hash}`;
        }
        return null;
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this video?')) return;
        setIsDeleting(true);
        onDelete?.(asset);
    };

    return (
        <Card
            className={cn(
                "overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-300",
                isHovered && "border-electric-blue/50 glow-blue",
                isOwner && "ring-1 ring-neon-orange/30"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Video Thumbnail */}
            <div className="relative aspect-video bg-muted overflow-hidden">
                {/* Placeholder Thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <div className="text-center">
                        <Zap className={cn(
                            "h-12 w-12 mx-auto mb-2 transition-colors duration-300",
                            isHovered ? "text-electric-blue" : "text-muted-foreground"
                        )} />
                        <span className="font-mono text-xs text-muted-foreground">
                            {asset.skillCategory}
                        </span>
                    </div>
                </div>

                {/* Play Button Overlay */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300",
                    isHovered && "opacity-100"
                )}>
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full bg-electric-blue/90 hover:bg-electric-blue text-black"
                        onClick={() => {
                            const url = getVideoThumbnailUrl(asset.videoUrl);
                            if (url) window.open(url, '_blank');
                        }}
                    >
                        <Play className="h-6 w-6 ml-1" />
                    </Button>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {/* Human Verified Badge */}
                    {asset.isVerifiedHuman && (
                        <Badge
                            variant="secondary"
                            className="bg-green-500/90 text-black font-mono text-[10px] px-2 py-1 flex items-center gap-1"
                        >
                            <CheckCircle2 className="h-3 w-3" />
                            Verified Human
                        </Badge>
                    )}

                    {/* Owner Badge */}
                    {isOwner && (
                        <Badge
                            variant="secondary"
                            className="bg-neon-orange/90 text-black font-mono text-[10px] px-2 py-1 flex items-center gap-1"
                        >
                            <User className="h-3 w-3" />
                            Your Video
                        </Badge>
                    )}

                    {/* Story IP Badge */}
                    {asset.ipId && (
                        <Badge
                            variant="secondary"
                            className="bg-amber-500/90 text-black font-mono text-[10px] px-2 py-1 flex items-center gap-1"
                        >
                            <Shield className="h-3 w-3" />
                            Story IP
                        </Badge>
                    )}

                    {/* NFT Token Badge */}
                    {asset.tokenId && (
                        <Badge
                            variant="secondary"
                            className="bg-purple-500/90 text-white font-mono text-[10px] px-2 py-1 flex items-center gap-1"
                        >
                            #{asset.tokenId.toString()}
                        </Badge>
                    )}
                </div>

                {/* Category Tag */}
                <div className="absolute bottom-3 left-3">
                    <Badge
                        variant="outline"
                        className="bg-black/60 backdrop-blur border-none font-mono text-[10px] text-white"
                    >
                        {asset.skillCategory}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <CardContent className="p-4">
                <h3 className="font-mono text-sm font-bold line-clamp-1 mb-1">
                    {asset.title}
                </h3>
                <p className="font-mono text-xs text-muted-foreground line-clamp-2 mb-3">
                    {asset.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>Owner: {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}</span>
                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="p-4 pt-0">
                {isOwner ? (
                    <div className="flex gap-2 w-full">
                        <Button
                            onClick={() => onEdit?.(asset)}
                            variant="outline"
                            className="flex-1 font-mono text-xs"
                        >
                            <Pencil className="mr-1 h-3 w-3" />
                            Edit
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="outline"
                            className="flex-1 font-mono text-xs text-red-400 border-red-400/50 hover:bg-red-500/10"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="mr-1 h-3 w-3" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="w-full bg-electric-blue hover:bg-electric-blue/80 text-black font-mono text-xs font-bold"
                    >
                        <ShoppingCart className="mr-2 h-3 w-3" />
                        Buy License
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

export default function ExplorePage() {
    const { walletAddress } = useAuth();
    const [assets, setAssets] = useState<IPAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [showMyVideos, setShowMyVideos] = useState(false);
    const [editingVideo, setEditingVideo] = useState<IPAsset | null>(null);

    // Fetch videos from database
    const fetchVideos = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== "All Categories") {
                params.append("category", selectedCategory);
            }
            if (searchQuery) {
                params.append("search", searchQuery);
            }
            if (showMyVideos && walletAddress) {
                params.append("owner", walletAddress);
            }

            const response = await fetch(`/api/videos?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch videos");

            const data = await response.json();

            // Transform database videos to IPAsset format
            const transformedAssets: IPAsset[] = (data.videos || []).map((video: {
                id: string;
                title: string;
                description: string;
                skill_category: string;
                video_ipfs_hash: string;
                thumbnail_ipfs_hash: string | null;
                owner_address: string;
                is_verified_human: boolean;
                ip_id: string | null;
                tx_hash: string | null;
                license_terms: Record<string, unknown> | null;
                created_at: string;
            }) => ({
                id: video.id,
                title: video.title,
                description: video.description || '',
                skillCategory: video.skill_category,
                videoUrl: `ipfs://${video.video_ipfs_hash}`,
                thumbnailUrl: video.thumbnail_ipfs_hash
                    ? `ipfs://${video.thumbnail_ipfs_hash}`
                    : '/api/placeholder/400/300',
                owner: video.owner_address,
                isVerifiedHuman: video.is_verified_human,
                createdAt: new Date(video.created_at),
                ipId: video.ip_id || undefined,
                txHash: video.tx_hash || undefined,
                license: video.license_terms as unknown as IPAsset['license'],
            }));

            setAssets(transformedAssets);
        } catch (error) {
            console.error("Error fetching videos:", error);
            setAssets([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, searchQuery, showMyVideos, walletAddress]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    // Handle video deletion
    const handleDeleteVideo = async (asset: IPAsset) => {
        if (!walletAddress) return;

        try {
            const response = await fetch(
                `/api/videos/${asset.id}?ownerAddress=${walletAddress}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to delete video");
            }

            // Remove from local state
            setAssets((prev) => prev.filter((a) => a.id !== asset.id));
        } catch (error) {
            console.error("Error deleting video:", error);
            alert(error instanceof Error ? error.message : "Failed to delete video");
        }
    };

    // Handle video edit (navigate to edit page)
    const handleEditVideo = (asset: IPAsset) => {
        setEditingVideo(asset);
    };

    const handleSaveEdit = async (updates: { title: string; description: string; skillCategory: string }) => {
        if (!editingVideo || !walletAddress) return;

        const response = await fetch(`/api/videos/${editingVideo.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ownerAddress: walletAddress,
                updates,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to update video");
        }

        // Update local state
        setAssets((prev) =>
            prev.map((a) =>
                a.id === editingVideo.id
                    ? { ...a, ...updates }
                    : a
            )
        );
    };

    // Filter assets (client-side additional filtering)
    const filteredAssets = assets;
    const myVideosCount = assets.filter(
        (a) => a.owner.toLowerCase() === walletAddress?.toLowerCase()
    ).length;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-mono text-3xl md:text-4xl font-bold mb-2">
                    <span className="text-electric-blue">Data</span>
                    <span className="text-muted-foreground"> </span>
                    <span className="text-neon-orange">Marketplace</span>
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    License verified human skills for AI robot training
                </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Assets", value: assets.length.toString(), color: "text-electric-blue" },
                    { label: "Verified Humans", value: assets.filter(a => a.isVerifiedHuman).length.toString(), color: "text-green-400" },
                    { label: "My Videos", value: myVideosCount.toString(), color: "text-neon-orange" },
                    { label: "Categories", value: "9", color: "text-purple-400" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-border/50 bg-card/30">
                        <CardContent className="p-4 text-center">
                            <p className={`font-mono text-2xl font-bold ${stat.color}`}>
                                {stat.value}
                            </p>
                            <p className="font-mono text-xs text-muted-foreground">
                                {stat.label}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search skills..."
                        className="pl-10 font-mono bg-muted border-border"
                    />
                </div>
                <div className="flex gap-2 sm:gap-4">
                    {walletAddress && (
                        <Button
                            variant={showMyVideos ? "default" : "outline"}
                            onClick={() => setShowMyVideos(!showMyVideos)}
                            className={cn(
                                "font-mono text-xs",
                                showMyVideos && "bg-neon-orange hover:bg-neon-orange/80 text-black"
                            )}
                        >
                            <User className="mr-1 h-3 w-3" />
                            My Videos
                        </Button>
                    )}
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[200px] font-mono bg-muted border-border">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SKILL_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat} className="font-mono">
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="font-mono text-sm text-muted-foreground">
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading assets...
                        </span>
                    ) : (
                        <>
                            Showing <span className="text-electric-blue">{filteredAssets.length}</span> assets
                            {showMyVideos && " (your videos only)"}
                        </>
                    )}
                </p>
            </div>

            {/* Asset Grid */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-12 w-12 text-electric-blue animate-spin" />
                </div>
            ) : filteredAssets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAssets.map((asset) => (
                        <AssetCard
                            key={asset.id}
                            asset={asset}
                            isOwner={asset.owner.toLowerCase() === walletAddress?.toLowerCase()}
                            onEdit={handleEditVideo}
                            onDelete={handleDeleteVideo}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-mono text-lg font-bold mb-2">No Assets Found</h3>
                    <p className="font-mono text-sm text-muted-foreground">
                        {showMyVideos
                            ? "You haven't uploaded any videos yet. Go to Upload to add your first skill!"
                            : "Try adjusting your search or filters"
                        }
                    </p>
                </div>
            )}

            {/* Edit Modal */}
            {editingVideo && (
                <VideoEditModal
                    video={editingVideo}
                    isOpen={!!editingVideo}
                    onClose={() => setEditingVideo(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
}
