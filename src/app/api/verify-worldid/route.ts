import { NextRequest, NextResponse } from "next/server";

interface VerifyRequest {
    proof: string;
    merkle_root: string;
    nullifier_hash: string;
    verification_level: string;
}

/**
 * Verify World ID proof
 * This endpoint verifies the proof received from the World ID widget
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as VerifyRequest;
        const { proof, merkle_root, nullifier_hash, verification_level } = body;

        // Validate required fields
        if (!proof || !merkle_root || !nullifier_hash) {
            return NextResponse.json(
                { error: "Missing required verification fields" },
                { status: 400 }
            );
        }

        const app_id = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID;
        const action = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || "verify-human";

        if (!app_id) {
            console.error("[World ID] App ID not configured");
            return NextResponse.json(
                { error: "World ID not configured" },
                { status: 500 }
            );
        }

        // Verify the proof with Worldcoin's API
        const verifyResponse = await fetch("https://developer.worldcoin.org/api/v1/verify/" + app_id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                proof,
                merkle_root,
                nullifier_hash,
                verification_level,
                action,
                signal: "", // Can be used to bind verification to specific data
            }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
            console.error("[World ID] Verification failed:", verifyData);
            return NextResponse.json(
                { 
                    error: "Verification failed", 
                    details: verifyData.detail || verifyData.message || "Invalid proof"
                },
                { status: 400 }
            );
        }

        // Check if verification was successful
        if (verifyData.success !== true) {
            console.error("[World ID] Verification not successful:", verifyData);
            return NextResponse.json(
                { 
                    error: "Verification failed",
                    details: verifyData.detail || "Proof validation failed"
                },
                { status: 400 }
            );
        }

        console.log("[World ID] Verification successful:", {
            nullifier_hash,
            verification_level,
        });

        // Return success
        return NextResponse.json({
            success: true,
            verified: true,
            nullifier_hash,
            verification_level,
        });

    } catch (error) {
        console.error("[World ID API] Error:", error);
        return NextResponse.json(
            { 
                error: "Internal server error", 
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
