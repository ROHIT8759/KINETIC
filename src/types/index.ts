// Type declarations for Kinetic

export interface IPAsset {
  id: string;
  title: string;
  description: string;
  skillCategory: SkillCategory;
  videoUrl: string;
  thumbnailUrl: string;
  owner: string;
  isVerifiedHuman: boolean;
  createdAt: Date;
  ipId?: string;
  txHash?: string;
  license?: LicenseTerms;
}

export type SkillCategory =
  | "Fine Motor Skills"
  | "Heavy Lifting"
  | "Precision Assembly"
  | "Food Preparation"
  | "Construction"
  | "Craftsmanship"
  | "Agricultural Tasks"
  | "Medical Procedures"
  | "Other";

export interface LicenseTerms {
  type: "standard" | "ai-training";
  royaltyPercentage?: number;
  flatFee?: number;
  commercialUse: boolean;
  socialMediaUse: boolean;
}

export interface WorldIDProof {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: "orb" | "device";
}

export interface StoryProtocolConfig {
  chainId: number;
  rpcUrl: string;
  contractAddresses?: {
    ipAssetRegistry?: string;
    licenseRegistry?: string;
    royaltyModule?: string;
  };
}
