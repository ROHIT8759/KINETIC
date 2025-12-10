"use client";

import { useState, useCallback } from "react";

export interface WorldIDVerification {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: "orb" | "device";
}

/**
 * Hook for World ID verification
 * 
 * This manages the World ID verification state.
 * The actual verification happens through the IDKitWidget component.
 */
export function useWorldID() {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] = useState<WorldIDVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle successful verification from IDKitWidget
   */
  const onVerificationSuccess = useCallback((result: WorldIDVerification) => {
    console.log("[World ID] Verification successful:", result);
    setVerification(result);
    setIsVerified(true);
    setError(null);
  }, []);

  /**
   * Handle verification error
   */
  const onVerificationError = useCallback((error: Error) => {
    console.error("[World ID] Verification failed:", error);
    setError(error.message);
    setIsVerified(false);
  }, []);

  /**
   * Reset verification state
   */
  const resetVerification = useCallback(() => {
    setIsVerified(false);
    setVerification(null);
    setError(null);
  }, []);

  /**
   * Mock verification for development/testing
   */
  const mockVerify = useCallback(async () => {
    setIsVerifying(true);
    setError(null);

    try {
      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResult: WorldIDVerification = {
        merkle_root: "0x" + Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(""),
        nullifier_hash: "0x" + Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(""),
        proof: "0x" + Array.from({ length: 256 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(""),
        verification_level: "orb",
      };

      setVerification(mockResult);
      setIsVerified(true);
      console.log("[World ID Mock] Verification successful:", mockResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return {
    isVerified,
    isVerifying,
    verification,
    error,
    onVerificationSuccess,
    onVerificationError,
    resetVerification,
    mockVerify,
  };
}

export default useWorldID;
