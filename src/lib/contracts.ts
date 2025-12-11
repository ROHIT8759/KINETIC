/**
 * KineticVideoNFT Contract ABI and Configuration
 */

// Contract ABI - Generated from KineticVideoNFT_Remix.sol
export const KINETIC_VIDEO_NFT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" }
    ],
    name: "ERC721IncorrectOwner",
    type: "error"
  },
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "ERC721InsufficientApproval",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "approver", type: "address" }],
    name: "ERC721InvalidApprover",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "operator", type: "address" }],
    name: "ERC721InvalidOperator",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "ERC721InvalidOwner",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "receiver", type: "address" }],
    name: "ERC721InvalidReceiver",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "sender", type: "address" }],
    name: "ERC721InvalidSender",
    type: "error"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ERC721NonexistentToken",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "approved", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "operator", type: "address" },
      { indexed: false, internalType: "bool", name: "approved", type: "bool" }
    ],
    name: "ApprovalForAll",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "_fromTokenId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "_toTokenId", type: "uint256" }
    ],
    name: "BatchMetadataUpdate",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "address", name: "ipId", type: "address" }
    ],
    name: "IPRegistered",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "_tokenId", type: "uint256" }
    ],
    name: "MetadataUpdate",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "string", name: "ipfsHash", type: "string" },
      { indexed: false, internalType: "string", name: "metadataUri", type: "string" },
      { indexed: false, internalType: "string", name: "category", type: "string" },
      { indexed: false, internalType: "bool", name: "isVerified", type: "bool" }
    ],
    name: "VideoMinted",
    type: "event"
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "categories",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "creators",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "exists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getApproved",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getVideoInfo",
    outputs: [
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "string", name: "ipfsHash", type: "string" },
      { internalType: "address", name: "ipId", type: "address" },
      { internalType: "bool", name: "verified", type: "bool" },
      { internalType: "string", name: "category", type: "string" },
      { internalType: "string", name: "uri", type: "string" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "operator", type: "address" }
    ],
    name: "isApprovedForAll",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "isVerifiedHuman",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "metadataUri", type: "string" },
      { internalType: "string", name: "ipfsHash", type: "string" },
      { internalType: "string", name: "category", type: "string" },
      { internalType: "bool", name: "verified", type: "bool" }
    ],
    name: "mintVideo",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" }
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "bool", name: "approved", type: "bool" }
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "ipId", type: "address" }
    ],
    name: "setIpId",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "tokenToIpId",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    name: "tokensOfOwner",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "videoIpfsHashes",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// Story Protocol Iliad Testnet Configuration
export const STORY_CHAIN_CONFIG = {
  id: 1513,
  name: "Story Iliad Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_STORY_RPC_URL || "https://testnet.storyrpc.io",
  blockExplorer: "https://testnet.storyscan.xyz",
  nativeCurrency: {
    name: "IP",
    symbol: "IP",
    decimals: 18,
  },
};

// Story Protocol Core Contract Addresses (Iliad Testnet)
export const STORY_PROTOCOL_ADDRESSES = {
  // IP Asset Registry - Register NFTs as IP Assets
  IP_ASSET_REGISTRY: (process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY || "0x1a9d0d28a0422F26D31Be72Edc6f13ea4371E11B") as `0x${string}`,
  
  // Licensing Module - Attach license terms to IP
  LICENSING_MODULE: (process.env.NEXT_PUBLIC_LICENSING_MODULE || "0xd81fd78f557b457b4350cB95D20b547bFEb4D0e0") as `0x${string}`,
  
  // PIL Template - Programmable IP License template
  PIL_TEMPLATE: (process.env.NEXT_PUBLIC_PIL_TEMPLATE || "0x0752f61E59fD2F39193D74CEc85E8227ecA84C2C") as `0x${string}`,
  
  // Your deployed KineticVideoNFT contract
  NFT_CONTRACT: (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "") as `0x${string}`,
};

// Get contract address with validation
export function getNFTContractAddress(): `0x${string}` {
  const address = STORY_PROTOCOL_ADDRESSES.NFT_CONTRACT;
  if (!address || address.length < 42) {
    throw new Error(
      "NFT contract address not configured. Please set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS in .env"
    );
  }
  return address;
}

// Check if contract is configured
export function isContractConfigured(): boolean {
  const address = STORY_PROTOCOL_ADDRESSES.NFT_CONTRACT;
  return !!address && address.length >= 42 && address.startsWith("0x");
}
