"use client";

import { useState, useCallback } from "react";

const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

/**
 * IPFS upload hook using Pinata via API route
 */
export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a file to IPFS via the API route
   */
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate initial progress
      setProgress(10);

      const formData = new FormData();
      formData.append("file", file);

      // Progress simulation while uploading
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setProgress(100);

      const ipfsHash = data.ipfsHash;
      console.log("[IPFS] File uploaded:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ipfsHash,
      });

      return ipfsHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      throw new Error(message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Upload JSON metadata to IPFS
   */
  const uploadMetadata = useCallback(async (metadata: Record<string, unknown>): Promise<string> => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/upload/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Metadata upload failed");
      }

      const data = await response.json();
      const ipfsHash = data.ipfsHash;

      console.log("[IPFS] Metadata uploaded:", {
        metadata,
        ipfsHash,
      });

      return ipfsHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Metadata upload failed";
      setError(message);
      throw new Error(message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Get gateway URL for an IPFS hash
   */
  const getGatewayUrl = useCallback((ipfsHashOrUrl: string): string => {
    let hash = ipfsHashOrUrl;
    if (hash.startsWith("ipfs://")) {
      hash = hash.replace("ipfs://", "");
    }
    return `${PINATA_GATEWAY}/ipfs/${hash}`;
  }, []);

  return {
    uploadFile,
    uploadMetadata,
    getGatewayUrl,
    isUploading,
    progress,
    error,
  };
}

export default useIPFS;
