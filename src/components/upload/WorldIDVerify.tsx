"use client";

import { useState } from "react";
import { IDKitWidget, VerificationLevel, ISuccessResult, IErrorState } from "@worldcoin/idkit";
import { CheckCircle2, Fingerprint, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WorldIDVerifyProps {
    isVerified: boolean;
    onVerificationSuccess: (result?: ISuccessResult) => void;
    onMockVerify?: () => Promise<void>;
}

// Worldcoin configuration - from worldcoin.org documentation
const WORLDCOIN_APP_ID = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || "app_staging_your_app_id";
const WORLDCOIN_ACTION = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || "verify-human";

export function WorldIDVerify({ isVerified, onVerificationSuccess, onMockVerify }: WorldIDVerifyProps) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);

    // Verify proof on server (as recommended by worldcoin.org)
    const handleVerify = async (proof: ISuccessResult) => {
        console.log("[World ID] Verification proof received:", proof);
        setVerifyError(null);
        setIsVerifying(true);

        try {
            // Send proof to backend for verification
            const response = await fetch("/api/verify-worldid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    proof: proof.proof,
                    merkle_root: proof.merkle_root,
                    nullifier_hash: proof.nullifier_hash,
                    verification_level: proof.verification_level,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.verified) {
                throw new Error(data.details || data.error || "Verification failed");
            }

            console.log("[World ID] Verification successful");
            onVerificationSuccess(proof);
        } catch (error) {
            console.error("[World ID] Verification error:", error);
            setVerifyError(error instanceof Error ? error.message : "Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerifyError = (error: IErrorState) => {
        console.error("[World ID] Widget error:", error);
        const errorMessage = error.message || error.code || "Verification failed. Please try again.";
        setVerifyError(errorMessage);
    };

    const handleMockVerify = async () => {
        if (onMockVerify) {
            setIsVerifying(true);
            setVerifyError(null);
            try {
                await onMockVerify();
            } catch (error) {
                console.error("[World ID Mock] Error:", error);
                setVerifyError("Mock verification failed");
            } finally {
                setIsVerifying(false);
            }
        }
    };

    return (
        <Card className={cn(
            "border-2 transition-all duration-300",
            isVerified
                ? "border-green-500/50 bg-green-500/5"
                : "border-neon-orange/30 bg-neon-orange/5"
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    {isVerified ? (
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                    ) : (
                        <Fingerprint className="h-5 w-5 text-neon-orange" />
                    )}
                    <CardTitle className="font-mono text-lg">
                        {isVerified ? "Humanity Verified" : "Verify Humanity"}
                    </CardTitle>
                </div>
                <CardDescription className="font-mono text-xs">
                    {isVerified
                        ? "Your identity has been verified via World ID"
                        : "Prove you're human to register your skill as IP"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isVerified ? (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="font-mono text-sm text-green-400">Verification Complete</p>
                            <p className="font-mono text-xs text-muted-foreground">
                                World ID: Orb Verified
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Error Display */}
                        {verifyError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                                    <div>
                                        <p className="font-mono text-xs text-red-400 font-bold">Verification Error</p>
                                        <p className="font-mono text-xs text-muted-foreground mt-1">{verifyError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* World ID Widget - Using official worldcoin.org implementation */}
                        <IDKitWidget
                            app_id={WORLDCOIN_APP_ID as `app_${string}`}
                            action={WORLDCOIN_ACTION}
                            // Using Orb verification as recommended for on-chain verification
                            verification_level={VerificationLevel.Orb}
                            handleVerify={handleVerify}
                            onSuccess={() => console.log("[World ID] Widget success callback")}
                            onError={handleVerifyError}
                        >
                            {({ open }) => (
                                <Button
                                    onClick={open}
                                    className="w-full bg-neon-orange hover:bg-neon-orange/80 text-black font-mono font-bold"
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <Fingerprint className="mr-2 h-4 w-4" />
                                            Verify with World ID
                                        </>
                                    )}
                                </Button>
                            )}
                        </IDKitWidget>

                        {/* Mock Verify Button for Development */}
                        {onMockVerify && (
                            <Button
                                onClick={handleMockVerify}
                                variant="outline"
                                className="w-full font-mono text-xs border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                                disabled={isVerifying}
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Simulating...
                                    </>
                                ) : (
                                    "[DEV] Mock Verification"
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default WorldIDVerify;
