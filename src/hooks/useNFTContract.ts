"use client";

import { useState, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { 
  KINETIC_VIDEO_NFT_ABI, 
  STORY_PROTOCOL_ADDRESSES,
  isContractConfigured 
} from "@/lib/contracts";

export interface VideoNFT {
  tokenId: bigint;
  creator: string;
  ipfsHash: string;
  ipId: string;
  verified: boolean;
  category: string;
  uri: string;
  owner: string;
}

export interface MintVideoParams {
  metadataUri: string;
  ipfsHash: string;
  category: string;
  verified: boolean;
}

/**
 * Hook for interacting with the KineticVideoNFT contract
 */
export function useNFTContract() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = STORY_PROTOCOL_ADDRESSES.NFT_CONTRACT;
  const isConfigured = isContractConfigured();

  /**
   * Mint a new video NFT
   */
  const mintVideo = useCallback(async (params: MintVideoParams): Promise<{
    tokenId: bigint;
    txHash: string;
  }> => {
    if (!walletClient || !address) {
      throw new Error("Wallet not connected");
    }

    if (!isConfigured) {
      throw new Error("NFT contract not configured");
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: KINETIC_VIDEO_NFT_ABI,
        functionName: "mintVideo",
        args: [
          address,
          params.metadataUri,
          params.ipfsHash,
          params.category,
          params.verified,
        ],
      });

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });

      // Extract tokenId from logs
      let tokenId = BigInt(0);
      if (receipt?.logs) {
        for (const log of receipt.logs) {
          // VideoMinted event topic
          if (log.topics[0] === "0x...") {
            // Parse the tokenId from the first indexed parameter
            tokenId = BigInt(log.topics[1] || 0);
            break;
          }
        }
      }

      // Fallback: get totalSupply - 1 as the last minted token
      if (tokenId === BigInt(0) && publicClient) {
        const totalSupply = await publicClient.readContract({
          address: contractAddress,
          abi: KINETIC_VIDEO_NFT_ABI,
          functionName: "totalSupply",
        });
        tokenId = (totalSupply as bigint) - BigInt(1);
      }

      console.log("[NFT Contract] Video minted:", { tokenId, txHash: hash });
      
      return { tokenId, txHash: hash };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to mint video";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, publicClient, contractAddress, isConfigured]);

  /**
   * Set Story Protocol IP ID for a token
   */
  const setIpId = useCallback(async (tokenId: bigint, ipId: string): Promise<string> => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    if (!isConfigured) {
      throw new Error("NFT contract not configured");
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: KINETIC_VIDEO_NFT_ABI,
        functionName: "setIpId",
        args: [tokenId, ipId as `0x${string}`],
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      
      console.log("[NFT Contract] IP ID set:", { tokenId, ipId, txHash: hash });
      
      return hash;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to set IP ID";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, publicClient, contractAddress, isConfigured]);

  /**
   * Get video info by token ID
   */
  const getVideoInfo = useCallback(async (tokenId: bigint): Promise<VideoNFT | null> => {
    if (!publicClient || !isConfigured) {
      return null;
    }

    try {
      const [info, owner] = await Promise.all([
        publicClient.readContract({
          address: contractAddress,
          abi: KINETIC_VIDEO_NFT_ABI,
          functionName: "getVideoInfo",
          args: [tokenId],
        }),
        publicClient.readContract({
          address: contractAddress,
          abi: KINETIC_VIDEO_NFT_ABI,
          functionName: "ownerOf",
          args: [tokenId],
        }),
      ]);

      const [creator, ipfsHash, ipId, verified, category, uri] = info as [
        string, string, string, boolean, string, string
      ];

      return {
        tokenId,
        creator,
        ipfsHash,
        ipId,
        verified,
        category,
        uri,
        owner: owner as string,
      };
    } catch (err) {
      console.error("Error getting video info:", err);
      return null;
    }
  }, [publicClient, contractAddress, isConfigured]);

  /**
   * Get all tokens owned by an address
   */
  const getTokensOfOwner = useCallback(async (ownerAddress: string): Promise<bigint[]> => {
    if (!publicClient || !isConfigured) {
      return [];
    }

    try {
      const tokens = await publicClient.readContract({
        address: contractAddress,
        abi: KINETIC_VIDEO_NFT_ABI,
        functionName: "tokensOfOwner",
        args: [ownerAddress as `0x${string}`],
      });

      return tokens as bigint[];
    } catch (err) {
      console.error("Error getting tokens:", err);
      return [];
    }
  }, [publicClient, contractAddress, isConfigured]);

  /**
   * Get total supply of NFTs
   */
  const getTotalSupply = useCallback(async (): Promise<bigint> => {
    if (!publicClient || !isConfigured) {
      return BigInt(0);
    }

    try {
      const supply = await publicClient.readContract({
        address: contractAddress,
        abi: KINETIC_VIDEO_NFT_ABI,
        functionName: "totalSupply",
      });

      return supply as bigint;
    } catch (err) {
      console.error("Error getting total supply:", err);
      return BigInt(0);
    }
  }, [publicClient, contractAddress, isConfigured]);

  /**
   * Check if a token exists
   */
  const tokenExists = useCallback(async (tokenId: bigint): Promise<boolean> => {
    if (!publicClient || !isConfigured) {
      return false;
    }

    try {
      const exists = await publicClient.readContract({
        address: contractAddress,
        abi: KINETIC_VIDEO_NFT_ABI,
        functionName: "exists",
        args: [tokenId],
      });

      return exists as boolean;
    } catch {
      return false;
    }
  }, [publicClient, contractAddress, isConfigured]);

  return {
    mintVideo,
    setIpId,
    getVideoInfo,
    getTokensOfOwner,
    getTotalSupply,
    tokenExists,
    isLoading,
    error,
    isConfigured,
    contractAddress,
  };
}

export default useNFTContract;
