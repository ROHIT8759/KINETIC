"use client";

import { useState, useCallback } from "react";
import { usePublicClient, useWalletClient, useAccount, useChainId } from "wagmi";
import { STORY_PROTOCOL_ADDRESSES, KINETIC_VIDEO_NFT_ABI, getNFTContractAddress } from "@/lib/contracts";
import { type Address, type Hash, encodeFunctionData, keccak256, toBytes } from "viem";

// Story Protocol Iliad Testnet Chain ID
const STORY_ILIAD_CHAIN_ID = 1513;

// IP Asset Registry ABI (minimal for registration)
const IP_ASSET_REGISTRY_ABI = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "chainId", type: "uint256" },
      { name: "tokenContract", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ name: "ipId", type: "address" }],
  },
  {
    name: "ipId",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "chainId", type: "uint256" },
      { name: "tokenContract", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "isRegistered",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "ipId", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// Licensing Module ABI (minimal for attaching license terms)
const LICENSING_MODULE_ABI = [
  {
    name: "attachLicenseTerms",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "ipId", type: "address" },
      { name: "licenseTemplate", type: "address" },
      { name: "licenseTermsId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "mintLicenseTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "licensorIpId", type: "address" },
      { name: "licenseTemplate", type: "address" },
      { name: "licenseTermsId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "royaltyContext", type: "bytes" },
    ],
    outputs: [{ name: "startLicenseTokenId", type: "uint256" }],
  },
] as const;

// PIL (Programmable IP License) Template address on Iliad
const PIL_LICENSE_TEMPLATE = "0x58E2c909D557Cd23EF90D14f8fd21667A5Ae7a93" as Address;

// Pre-defined license terms IDs on Story Protocol Iliad
export const LICENSE_TERMS_IDS = {
  // Non-commercial social remixing - allows sharing on social media
  NON_COMMERCIAL_SOCIAL: 1n,
  // Commercial use with 10% royalty
  COMMERCIAL_10_PERCENT: 2n,
  // Commercial use with 5% royalty
  COMMERCIAL_5_PERCENT: 3n,
  // AI training allowed with attribution
  AI_TRAINING_ALLOWED: 4n,
};

// Types for Story Protocol integration
export interface IPAsset {
  id: string;
  title: string;
  description: string;
  skillCategory: string;
  videoUrl: string;
  thumbnailUrl: string;
  owner: string;
  isVerifiedHuman: boolean;
  createdAt: Date;
  ipId?: string;
  txHash?: string;
  license?: LicenseTerms;
  tokenId?: bigint;
}

export interface LicenseTerms {
  type: "standard" | "ai-training";
  royaltyPercentage?: number;
  flatFee?: number;
  commercialUse: boolean;
  socialMediaUse: boolean;
}

export interface RegisterIPParams {
  title: string;
  description: string;
  skillCategory: string;
  videoUrl: string;
  thumbnailUrl: string;
  owner: string;
  isVerifiedHuman: boolean;
  tokenId: bigint; // NFT token ID from KineticVideoNFT contract
}

export interface AttachLicenseParams {
  ipId: string;
  licenseTerms: LicenseTerms;
}

export interface MintLicenseParams {
  ipId: string;
  licenseTermsId: bigint;
  receiver: string;
  amount?: number;
}

/**
 * Hook for interacting with Story Protocol on Iliad Testnet
 * 
 * This hook provides real blockchain interactions with Story Protocol contracts:
 * - IP Asset Registry: Register NFTs as IP Assets
 * - Licensing Module: Attach license terms and mint license tokens
 * 
 * Prerequisites:
 * 1. User must be connected to Story Iliad Testnet (Chain ID: 1513)
 * 2. User must have an NFT minted from KineticVideoNFT contract
 * 3. Contract address must be set in environment variables
 */
export function useStoryProtocol() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const chainId = useChainId();

  /**
   * Check if user is on Story Iliad Testnet
   */
  const isOnStoryNetwork = chainId === STORY_ILIAD_CHAIN_ID;

  /**
   * Get the IP ID for an NFT (if already registered)
   */
  const getIpId = useCallback(async (tokenId: bigint): Promise<Address | null> => {
    if (!publicClient) return null;
    
    const nftContract = getNFTContractAddress() as Address;
    if (!nftContract) return null;

    try {
      const ipId = await publicClient.readContract({
        address: STORY_PROTOCOL_ADDRESSES.IP_ASSET_REGISTRY as Address,
        abi: IP_ASSET_REGISTRY_ABI,
        functionName: "ipId",
        args: [BigInt(STORY_ILIAD_CHAIN_ID), nftContract, tokenId],
      });

      // Check if the IP is actually registered (ipId returns a deterministic address even if not registered)
      const isRegistered = await publicClient.readContract({
        address: STORY_PROTOCOL_ADDRESSES.IP_ASSET_REGISTRY as Address,
        abi: IP_ASSET_REGISTRY_ABI,
        functionName: "isRegistered",
        args: [ipId],
      });

      return isRegistered ? ipId : null;
    } catch (err) {
      console.error("Error getting IP ID:", err);
      return null;
    }
  }, [publicClient]);

  /**
   * Register an NFT as an IP Asset on Story Protocol
   * 
   * This registers the NFT with the IP Asset Registry, creating a unique IP ID
   * that can then have license terms attached to it.
   */
  const registerIP = useCallback(async (params: RegisterIPParams): Promise<{
    ipId: string;
    txHash: string;
    asset: IPAsset;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!walletClient || !publicClient || !address) {
        throw new Error("Wallet not connected");
      }

      if (!isOnStoryNetwork) {
        throw new Error("Please switch to Story Iliad Testnet (Chain ID: 1513)");
      }

      const nftContract = getNFTContractAddress() as Address;
      if (!nftContract) {
        throw new Error("NFT Contract address not configured");
      }

      console.log("[Story Protocol] Registering IP Asset:", {
        tokenId: params.tokenId.toString(),
        nftContract,
      });

      // Register the NFT as an IP Asset
      const txHash = await walletClient.writeContract({
        address: STORY_PROTOCOL_ADDRESSES.IP_ASSET_REGISTRY as Address,
        abi: IP_ASSET_REGISTRY_ABI,
        functionName: "register",
        args: [BigInt(STORY_ILIAD_CHAIN_ID), nftContract, params.tokenId],
      });

      console.log("[Story Protocol] Registration tx submitted:", txHash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      if (receipt.status !== "success") {
        throw new Error("Transaction failed");
      }

      // Get the IP ID after registration
      const ipId = await publicClient.readContract({
        address: STORY_PROTOCOL_ADDRESSES.IP_ASSET_REGISTRY as Address,
        abi: IP_ASSET_REGISTRY_ABI,
        functionName: "ipId",
        args: [BigInt(STORY_ILIAD_CHAIN_ID), nftContract, params.tokenId],
      });

      // Update the NFT contract with the IP ID
      const setIpIdTx = await walletClient.writeContract({
        address: nftContract,
        abi: KINETIC_VIDEO_NFT_ABI,
        functionName: "setIpId",
        args: [params.tokenId, ipId],
      });

      await publicClient.waitForTransactionReceipt({ hash: setIpIdTx });

      const asset: IPAsset = {
        id: crypto.randomUUID(),
        ...params,
        ipId: ipId,
        txHash: txHash,
        tokenId: params.tokenId,
        createdAt: new Date(),
      };

      console.log("[Story Protocol] IP Asset Registered:", {
        ipId,
        txHash,
        asset,
      });

      return { ipId, txHash, asset };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to register IP";
      setError(message);
      console.error("[Story Protocol] Registration error:", err);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, publicClient, address, isOnStoryNetwork]);

  /**
   * Attach license terms to an IP Asset
   * 
   * This attaches pre-defined PIL (Programmable IP License) terms to an IP Asset,
   * allowing others to obtain licenses under those terms.
   */
  const attachLicense = useCallback(async (params: AttachLicenseParams): Promise<{
    licenseTermsId: string;
    txHash: string;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!walletClient || !publicClient || !address) {
        throw new Error("Wallet not connected");
      }

      if (!isOnStoryNetwork) {
        throw new Error("Please switch to Story Iliad Testnet (Chain ID: 1513)");
      }

      // Determine license terms ID based on license configuration
      let licenseTermsId: bigint;
      if (params.licenseTerms.type === "ai-training") {
        licenseTermsId = LICENSE_TERMS_IDS.AI_TRAINING_ALLOWED;
      } else if (params.licenseTerms.commercialUse) {
        licenseTermsId = params.licenseTerms.royaltyPercentage && params.licenseTerms.royaltyPercentage >= 10
          ? LICENSE_TERMS_IDS.COMMERCIAL_10_PERCENT
          : LICENSE_TERMS_IDS.COMMERCIAL_5_PERCENT;
      } else {
        licenseTermsId = LICENSE_TERMS_IDS.NON_COMMERCIAL_SOCIAL;
      }

      console.log("[Story Protocol] Attaching license terms:", {
        ipId: params.ipId,
        licenseTermsId: licenseTermsId.toString(),
      });

      const txHash = await walletClient.writeContract({
        address: STORY_PROTOCOL_ADDRESSES.LICENSING_MODULE as Address,
        abi: LICENSING_MODULE_ABI,
        functionName: "attachLicenseTerms",
        args: [params.ipId as Address, PIL_LICENSE_TEMPLATE, licenseTermsId],
      });

      console.log("[Story Protocol] License attachment tx submitted:", txHash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      if (receipt.status !== "success") {
        throw new Error("Transaction failed");
      }

      console.log("[Story Protocol] License Terms Attached:", {
        ipId: params.ipId,
        licenseTermsId: licenseTermsId.toString(),
        txHash,
      });

      return { licenseTermsId: licenseTermsId.toString(), txHash };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to attach license";
      setError(message);
      console.error("[Story Protocol] Attach license error:", err);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, publicClient, address, isOnStoryNetwork]);

  /**
   * Mint a license token for an IP Asset
   * 
   * This mints a license token that grants the receiver rights according
   * to the attached license terms.
   */
  const mintLicense = useCallback(async (params: MintLicenseParams): Promise<{
    licenseTokenId: string;
    txHash: string;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!walletClient || !publicClient || !address) {
        throw new Error("Wallet not connected");
      }

      if (!isOnStoryNetwork) {
        throw new Error("Please switch to Story Iliad Testnet (Chain ID: 1513)");
      }

      const amount = BigInt(params.amount || 1);

      console.log("[Story Protocol] Minting license token:", {
        ipId: params.ipId,
        licenseTermsId: params.licenseTermsId.toString(),
        receiver: params.receiver,
        amount: amount.toString(),
      });

      const txHash = await walletClient.writeContract({
        address: STORY_PROTOCOL_ADDRESSES.LICENSING_MODULE as Address,
        abi: LICENSING_MODULE_ABI,
        functionName: "mintLicenseTokens",
        args: [
          params.ipId as Address,
          PIL_LICENSE_TEMPLATE,
          params.licenseTermsId,
          amount,
          params.receiver as Address,
          "0x" as `0x${string}`, // Empty royalty context
        ],
      });

      console.log("[Story Protocol] License mint tx submitted:", txHash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      if (receipt.status !== "success") {
        throw new Error("Transaction failed");
      }

      // Parse logs to get the license token ID (simplified - in production, parse event logs)
      const licenseTokenId = `license-${Date.now()}`;

      console.log("[Story Protocol] License Token Minted:", {
        ...params,
        licenseTokenId,
        txHash,
      });

      return { licenseTokenId, txHash };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to mint license";
      setError(message);
      console.error("[Story Protocol] Mint license error:", err);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, publicClient, address, isOnStoryNetwork]);

  /**
   * Get license terms description by ID
   */
  const getLicenseTerms = useCallback(async (licenseTermsId: string): Promise<LicenseTerms> => {
    const termsId = BigInt(licenseTermsId);
    
    // Map pre-defined license terms IDs to their configurations
    if (termsId === LICENSE_TERMS_IDS.NON_COMMERCIAL_SOCIAL) {
      return {
        type: "standard",
        royaltyPercentage: 0,
        commercialUse: false,
        socialMediaUse: true,
      };
    } else if (termsId === LICENSE_TERMS_IDS.COMMERCIAL_10_PERCENT) {
      return {
        type: "standard",
        royaltyPercentage: 10,
        commercialUse: true,
        socialMediaUse: true,
      };
    } else if (termsId === LICENSE_TERMS_IDS.COMMERCIAL_5_PERCENT) {
      return {
        type: "standard",
        royaltyPercentage: 5,
        commercialUse: true,
        socialMediaUse: true,
      };
    } else if (termsId === LICENSE_TERMS_IDS.AI_TRAINING_ALLOWED) {
      return {
        type: "ai-training",
        royaltyPercentage: 15,
        commercialUse: true,
        socialMediaUse: true,
      };
    }

    // Default terms
    return {
      type: "standard",
      royaltyPercentage: 5,
      commercialUse: false,
      socialMediaUse: true,
    };
  }, []);

  /**
   * Register IP and attach license in a single flow
   */
  const registerIPWithLicense = useCallback(async (
    params: RegisterIPParams,
    licenseTerms: LicenseTerms
  ): Promise<{
    ipId: string;
    licenseTermsId: string;
    registerTxHash: string;
    licenseTxHash: string;
    asset: IPAsset;
  }> => {
    // First register the IP
    const { ipId, txHash: registerTxHash, asset } = await registerIP(params);
    
    // Then attach license terms
    const { licenseTermsId, txHash: licenseTxHash } = await attachLicense({
      ipId,
      licenseTerms,
    });

    return {
      ipId,
      licenseTermsId,
      registerTxHash,
      licenseTxHash,
      asset: {
        ...asset,
        license: licenseTerms,
      },
    };
  }, [registerIP, attachLicense]);

  return {
    registerIP,
    attachLicense,
    mintLicense,
    getLicenseTerms,
    getIpId,
    registerIPWithLicense,
    isLoading,
    error,
    isOnStoryNetwork,
    chainId,
    LICENSE_TERMS_IDS,
  };
}

export default useStoryProtocol;
