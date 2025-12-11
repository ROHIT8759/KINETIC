"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Loader2, Shield, Zap, ArrowRight, AlertCircle, Coins, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VideoUploadZone } from "@/components/upload/VideoUploadZone";
import { WorldIDVerify } from "@/components/upload/WorldIDVerify";
import { LicenseConfiguration } from "@/components/license/LicenseConfiguration";
import { useStoryProtocol, useIPFS, useWorldID, useNFTContract } from "@/hooks";
import { useMarketplace } from "@/providers";
import type { LicenseTerms } from "@/hooks/useStoryProtocol";
import { isContractConfigured } from "@/lib/contracts";

const SKILL_CATEGORIES = [
    "Fine Motor Skills",
    "Heavy Lifting",
    "Precision Assembly",
    "Food Preparation",
    "Construction",
    "Craftsmanship",
    "Agricultural Tasks",
    "Medical Procedures",
    "Other",
];

type UploadStep = "upload" | "details" | "mint" | "license" | "complete";

export default function UploadPage() {
    const router = useRouter();
    const { address, isConnected, status } = useAccount();
    const { registerIP, attachLicense, isLoading: isRegistering, isOnStoryNetwork } = useStoryProtocol();
    const { uploadFile, uploadMetadata, isUploading, progress: uploadProgress, getGatewayUrl } = useIPFS();
    const { mockVerify } = useWorldID();
    const {
        mintVideo,
        isLoading: isMinting,
        error: mintError,
        isWalletReady,
        isWalletLoading,
        isCorrectChain,
        switchToStoryAeneid
    } = useNFTContract();
    const { addAsset } = useMarketplace();

    // Debug logging
    useEffect(() => {
        console.log("[Upload] Wallet status:", { address, isConnected, status, isWalletReady, isWalletLoading, isCorrectChain });
    }, [address, isConnected, status, isWalletReady, isWalletLoading, isCorrectChain]);

    // Check wallet connection - simple address check
    const isAuthenticated = !!address;
    const walletAddress = address?.toLowerCase() || null;

    // Form state
    const [step, setStep] = useState<UploadStep>("upload");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [videoIpfsHash, setVideoIpfsHash] = useState<string>("");
    const [metadataIpfsHash, setMetadataIpfsHash] = useState<string>("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [skillCategory, setSkillCategory] = useState("");
    const [isHumanVerified, setIsHumanVerified] = useState(false);
    const [licenseTerms, setLicenseTerms] = useState<LicenseTerms | null>(null);
    const [mintedNFT, setMintedNFT] = useState<{ tokenId: bigint; txHash: string } | null>(null);
    const [registeredAsset, setRegisteredAsset] = useState<{ ipId: string; txHash: string; videoId: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const contractConfigured = isContractConfigured();

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
        setError(null);
        try {
            const ipfsHash = await uploadFile(file);
            setVideoIpfsHash(ipfsHash);
        } catch (err) {
            console.error("Failed to upload file:", err);
            setError("Failed to upload file to IPFS. Please try again.");
        }
    };

    const handleVerificationSuccess = (result?: unknown) => {
        console.log("[World ID] Verification successful:", result);
        setIsHumanVerified(true);
    };

    const handleMockVerify = async () => {
        await mockVerify();
        setIsHumanVerified(true);
    };

    // Step 1: Mint NFT on blockchain
    const handleMintNFT = async () => {
        if (!title || !description || !skillCategory || !videoIpfsHash || !walletAddress) {
            setError("Please fill in all required fields and connect your wallet.");
            return;
        }

        if (!contractConfigured) {
            setError("NFT Contract not configured. Please deploy the contract and set the address in .env");
            return;
        }

        setError(null);
        setIsSaving(true);

        try {
            // First upload metadata to IPFS
            const metadata = {
                name: title,
                description,
                image: `ipfs://${videoIpfsHash}`, // Using video as image for NFT
                animation_url: `ipfs://${videoIpfsHash}`,
                attributes: [
                    { trait_type: "Skill Category", value: skillCategory },
                    { trait_type: "Human Verified", value: isHumanVerified ? "Yes" : "No" },
                    { trait_type: "Platform", value: "Kinetic" },
                ],
            };

            // Upload metadata to IPFS
            const metadataHash = await uploadMetadata(metadata);
            setMetadataIpfsHash(metadataHash);

            // Mint NFT with the metadata URI
            const { tokenId, txHash } = await mintVideo({
                metadataUri: `ipfs://${metadataHash}`,
                ipfsHash: videoIpfsHash,
                category: skillCategory,
                verified: isHumanVerified,
            });

            setMintedNFT({ tokenId, txHash });

            // Save to database
            const saveResponse = await fetch("/api/videos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    skillCategory,
                    videoIpfsHash,
                    ownerAddress: walletAddress,
                    isVerifiedHuman: isHumanVerified,
                    tokenId: tokenId.toString(),
                    mintTxHash: txHash,
                }),
            });

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                throw new Error(errorData.error || "Failed to save video");
            }

            const saveData = await saveResponse.json();
            setRegisteredAsset({
                ipId: "",
                txHash: txHash,
                videoId: saveData.video.id
            });

            setStep("mint"); // Move to Story Protocol registration step
        } catch (err) {
            console.error("Failed to mint NFT:", err);
            setError(err instanceof Error ? err.message : "Failed to mint NFT. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Step 2: Register IP on Story Protocol
    const handleRegisterIP = async () => {
        if (!mintedNFT || !walletAddress || !registeredAsset) {
            setError("Please mint NFT first.");
            return;
        }

        if (!isOnStoryNetwork) {
            setError("Please switch to Story Aeneid Testnet (Chain ID: 1315) to register IP.");
            return;
        }

        setError(null);
        setIsSaving(true);

        try {
            // Register on Story Protocol
            const result = await registerIP({
                title,
                description,
                skillCategory,
                videoUrl: `ipfs://${videoIpfsHash}`,
                thumbnailUrl: "/api/placeholder/400/300",
                owner: walletAddress,
                isVerifiedHuman: isHumanVerified,
                tokenId: mintedNFT.tokenId,
            });

            // Update database with IP ID
            await fetch(`/api/videos/${registeredAsset.videoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ownerAddress: walletAddress,
                    updates: {
                        ipId: result.ipId,
                        ipTxHash: result.txHash,
                    },
                }),
            });

            setRegisteredAsset({
                ...registeredAsset,
                ipId: result.ipId,
                txHash: result.txHash,
            });
            addAsset(result.asset);
            setStep("license");
        } catch (err) {
            console.error("Failed to register IP:", err);
            setError(err instanceof Error ? err.message : "Failed to register IP. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAttachLicense = async () => {
        if (!registeredAsset || !licenseTerms || !walletAddress) return;

        setError(null);
        setIsSaving(true);

        try {
            await attachLicense({
                ipId: registeredAsset.ipId,
                licenseTerms,
            });

            // Update video with license terms
            await fetch(`/api/videos/${registeredAsset.videoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ownerAddress: walletAddress,
                    updates: {
                        licenseType: licenseTerms.type,
                        licenseTerms,
                    },
                }),
            });

            setStep("complete");
        } catch (err) {
            console.error("Failed to attach license:", err);
            setError("Failed to attach license. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const canProceedToDetails = selectedFile && !isUploading && videoIpfsHash && isHumanVerified;
    const canMint = title && description && skillCategory && videoIpfsHash && isAuthenticated && contractConfigured;

    const STEP_ORDER = ["upload", "details", "mint", "license", "complete"] as const;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-mono text-3xl md:text-4xl font-bold mb-2">
                    <span className="text-neon-orange">Upload</span>
                    <span className="text-muted-foreground"> & </span>
                    <span className="text-electric-blue">Register</span>
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Upload your real-world skill video and register it as IP on Story Protocol
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                {[
                    { key: "upload", label: "Upload & Verify" },
                    { key: "details", label: "Details" },
                    { key: "mint", label: "Mint NFT" },
                    { key: "license", label: "License" },
                    { key: "complete", label: "Complete" },
                ].map((s, i, arr) => (
                    <div key={s.key} className="flex items-center">
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs transition-all ${step === s.key
                                ? "bg-electric-blue/20 text-electric-blue border border-electric-blue/50"
                                : STEP_ORDER.indexOf(step as typeof STEP_ORDER[number]) >
                                    STEP_ORDER.indexOf(s.key as typeof STEP_ORDER[number])
                                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                    : "bg-muted text-muted-foreground border border-transparent"
                                }`}
                        >
                            <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                                {i + 1}
                            </span>
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                        {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />}
                    </div>
                ))}
            </div>

            {/* Step: Upload & Verify */}
            {step === "upload" && (
                <div className="space-y-6">
                    {/* Video Upload */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="font-mono text-lg flex items-center gap-2">
                                <Zap className="h-5 w-5 text-electric-blue" />
                                Video Upload
                            </CardTitle>
                            <CardDescription className="font-mono text-xs">
                                Upload a video demonstrating your real-world skill
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VideoUploadZone
                                onFileSelect={handleFileSelect}
                                selectedFile={selectedFile}
                                isUploading={isUploading}
                                uploadProgress={uploadProgress}
                            />
                        </CardContent>
                    </Card>

                    {/* World ID Verification */}
                    <WorldIDVerify
                        isVerified={isHumanVerified}
                        onVerificationSuccess={handleVerificationSuccess}
                        onMockVerify={handleMockVerify}
                    />

                    {/* Proceed Button */}
                    <Button
                        onClick={() => setStep("details")}
                        disabled={!canProceedToDetails}
                        className="w-full bg-electric-blue hover:bg-electric-blue/80 text-black font-mono font-bold"
                    >
                        Continue to Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Step: Details */}
            {step === "details" && (
                <div className="space-y-6">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="font-mono text-lg flex items-center gap-2">
                                <Shield className="h-5 w-5 text-neon-orange" />
                                IP Asset Details
                            </CardTitle>
                            <CardDescription className="font-mono text-xs">
                                Describe your skill for AI training purposes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="font-mono text-sm">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Precision Wood Carving Technique"
                                    className="font-mono bg-muted border-border"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="font-mono text-sm">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the skill, technique, and what an AI robot could learn from this..."
                                    className="font-mono bg-muted border-border min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="font-mono text-sm">
                                    Skill Category
                                </Label>
                                <Select value={skillCategory} onValueChange={setSkillCategory}>
                                    <SelectTrigger className="font-mono bg-muted border-border">
                                        <SelectValue placeholder="Select a category" />
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

                            {/* Summary Card */}
                            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50">
                                <p className="font-mono text-xs text-muted-foreground mb-2">UPLOAD SUMMARY</p>
                                <div className="space-y-1 font-mono text-xs">
                                    <p>
                                        <span className="text-muted-foreground">File:</span>{" "}
                                        <span className="text-foreground">{selectedFile?.name}</span>
                                    </p>
                                    <p>
                                        <span className="text-muted-foreground">IPFS Hash:</span>{" "}
                                        <span className="text-electric-blue">{videoIpfsHash.slice(0, 30)}...</span>
                                    </p>
                                    <p>
                                        <span className="text-muted-foreground">Owner:</span>{" "}
                                        {isAuthenticated ? (
                                            <span className="text-foreground">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
                                        ) : (
                                            <span className="text-neon-orange">Connect wallet to register</span>
                                        )}
                                    </p>
                                    <p>
                                        <span className="text-muted-foreground">Human Verified:</span>{" "}
                                        {isHumanVerified ? (
                                            <span className="text-green-400">✓ World ID</span>
                                        ) : (
                                            <span className="text-neon-orange">Not Verified</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Wallet Connection Warning - only show if no wallet address */}
                            {!address && (
                                <div className="mt-4 p-4 bg-neon-orange/10 border border-neon-orange/50 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-neon-orange mt-0.5" />
                                        <div>
                                            <p className="font-mono text-sm font-bold text-neon-orange">
                                                Wallet not connected
                                            </p>
                                            <p className="font-mono text-xs text-muted-foreground mt-1">
                                                Please connect your wallet using the button in the header to mint your NFT and register it as IP.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                                    <p className="font-mono text-xs text-red-400 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Contract Not Configured Warning */}
                            {!contractConfigured && (
                                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                        <div>
                                            <p className="font-mono text-sm font-bold text-yellow-500">
                                                Contract Not Deployed
                                            </p>
                                            <p className="font-mono text-xs text-muted-foreground mt-1">
                                                Please deploy the KineticVideoNFT contract on Remix and set the address in your .env file.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button
                            onClick={() => setStep("upload")}
                            variant="outline"
                            className="flex-1 font-mono"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleMintNFT}
                            disabled={!canMint || isMinting || isSaving || isWalletLoading}
                            className="flex-1 bg-neon-orange hover:bg-neon-orange/80 text-black font-mono font-bold"
                        >
                            {isMinting || isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {!isCorrectChain ? "Switching Network..." : "Minting NFT..."}
                                </>
                            ) : isWalletLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting Wallet...
                                </>
                            ) : !isAuthenticated ? (
                                <>
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Connect Wallet First
                                </>
                            ) : !isWalletReady ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Wallet Initializing...
                                </>
                            ) : !contractConfigured ? (
                                <>
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Deploy Contract First
                                </>
                            ) : (
                                <>
                                    <Coins className="mr-2 h-4 w-4" />
                                    {!isCorrectChain ? "Switch to Story Aeneid & Mint" : "Mint NFT"}
                                </>
                            )}
                        </Button>

                        {/* Show network warning */}
                        {isAuthenticated && !isCorrectChain && (
                            <p className="text-xs text-yellow-400 text-center mt-2">
                                ⚠️ You&apos;re on the wrong network. Clicking mint will prompt you to switch to Story Aeneid.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Step: Register on Story Protocol */}
            {step === "mint" && mintedNFT && (
                <div className="space-y-6">
                    {/* NFT Minted Banner */}
                    <Card className="border-green-500/50 bg-green-500/5">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Coins className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-mono text-lg font-bold text-green-400">NFT Minted Successfully!</h3>
                                    <p className="font-mono text-xs text-muted-foreground mt-1">
                                        Your video is now an on-chain NFT. Register it on Story Protocol for IP protection.
                                    </p>
                                    <div className="mt-3 p-3 bg-muted/50 rounded font-mono text-xs space-y-1">
                                        <p>
                                            <span className="text-muted-foreground">Token ID:</span>{" "}
                                            <span className="text-electric-blue">{mintedNFT.tokenId.toString()}</span>
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">TX Hash:</span>{" "}
                                            <a
                                                href={`https://aeneid.storyscan.xyz/tx/${mintedNFT.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-electric-blue hover:underline inline-flex items-center gap-1"
                                            >
                                                {mintedNFT.txHash.slice(0, 16)}...
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Story Protocol Network Warning */}
                    {!isOnStoryNetwork && (
                        <Card className="border-yellow-500/50 bg-yellow-500/5">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <div>
                                        <p className="font-mono text-sm font-bold text-yellow-500">
                                            Switch to Story Aeneid Testnet
                                        </p>
                                        <p className="font-mono text-xs text-muted-foreground mt-1">
                                            Please switch your wallet to Story Aeneid Testnet (Chain ID: 1315) to register your IP on Story Protocol.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="font-mono text-xs text-red-400 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button
                            onClick={() => setStep("details")}
                            variant="outline"
                            className="flex-1 font-mono"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleRegisterIP}
                            disabled={!isOnStoryNetwork || isRegistering || isSaving}
                            className="flex-1 bg-electric-blue hover:bg-electric-blue/80 text-black font-mono font-bold"
                        >
                            {isRegistering || isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registering on Story...
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Register on Story Protocol
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step: License Configuration */}
            {step === "license" && registeredAsset && (
                <div className="space-y-6">
                    {/* Success Banner */}
                    <Card className="border-green-500/50 bg-green-500/5">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Shield className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-mono text-lg font-bold text-green-400">IP Registered Successfully!</h3>
                                    <p className="font-mono text-xs text-muted-foreground mt-1">
                                        Your skill has been registered on Story Protocol
                                    </p>
                                    <div className="mt-3 p-3 bg-muted/50 rounded font-mono text-xs">
                                        <p>
                                            <span className="text-muted-foreground">IP ID:</span>{" "}
                                            <span className="text-electric-blue">{registeredAsset.ipId.slice(0, 20)}...</span>
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">TX Hash:</span>{" "}
                                            <span className="text-electric-blue">{registeredAsset.txHash.slice(0, 20)}...</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* License Configuration */}
                    <LicenseConfiguration onLicenseChange={setLicenseTerms} />

                    <div className="flex gap-4">
                        <Button
                            onClick={() => setStep("details")}
                            variant="outline"
                            className="flex-1 font-mono"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleAttachLicense}
                            disabled={!licenseTerms || isRegistering || isSaving}
                            className="flex-1 bg-electric-blue hover:bg-electric-blue/80 text-black font-mono font-bold"
                        >
                            {isRegistering || isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Attaching License...
                                </>
                            ) : (
                                <>
                                    Attach License Terms
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step: Complete */}
            {step === "complete" && (
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50">
                        <Shield className="h-10 w-10 text-green-400" />
                    </div>
                    <div>
                        <h2 className="font-mono text-2xl font-bold text-green-400">
                            Successfully Listed!
                        </h2>
                        <p className="font-mono text-sm text-muted-foreground mt-2">
                            Your skill is now available in the Kinetic marketplace
                        </p>
                    </div>

                    <Card className="border-border/50 text-left">
                        <CardContent className="pt-6">
                            <div className="space-y-3 font-mono text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Title</span>
                                    <span>{title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Category</span>
                                    <span>{skillCategory}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">License Type</span>
                                    <span className={licenseTerms?.type === "ai-training" ? "text-electric-blue" : "text-neon-orange"}>
                                        {licenseTerms?.type === "ai-training" ? "AI Training License" : "Standard License"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Human Verified</span>
                                    <span className="text-green-400">✓ World ID</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button
                            onClick={() => router.push("/explore")}
                            className="flex-1 bg-electric-blue hover:bg-electric-blue/80 text-black font-mono font-bold"
                        >
                            View Marketplace
                        </Button>
                        <Button
                            onClick={() => {
                                setStep("upload");
                                setSelectedFile(null);
                                setVideoIpfsHash("");
                                setTitle("");
                                setDescription("");
                                setSkillCategory("");
                                setIsHumanVerified(false);
                                setLicenseTerms(null);
                                setRegisteredAsset(null);
                                setError(null);
                            }}
                            variant="outline"
                            className="flex-1 font-mono"
                        >
                            Upload Another
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
