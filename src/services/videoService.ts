import { supabase, DBVideo } from '@/lib/supabase';
import { IPAsset, LicenseTerms } from '@/types';

/**
 * Convert database video to IPAsset format
 */
function dbVideoToIPAsset(video: DBVideo): IPAsset {
  return {
    id: video.id,
    title: video.title,
    description: video.description || '',
    skillCategory: video.skill_category as IPAsset['skillCategory'],
    videoUrl: `ipfs://${video.video_ipfs_hash}`,
    thumbnailUrl: video.thumbnail_ipfs_hash 
      ? `ipfs://${video.thumbnail_ipfs_hash}` 
      : '/api/placeholder/400/300',
    owner: video.owner_address,
    isVerifiedHuman: video.is_verified_human,
    createdAt: new Date(video.created_at),
    ipId: video.ip_id || undefined,
    txHash: video.tx_hash || undefined,
    license: video.license_terms as unknown as LicenseTerms | undefined,
  };
}

/**
 * Get all videos from the database
 */
export async function getAllVideos(): Promise<IPAsset[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }

  return (data || []).map(dbVideoToIPAsset);
}

/**
 * Get videos by owner address
 */
export async function getVideosByOwner(ownerAddress: string): Promise<IPAsset[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('owner_address', ownerAddress.toLowerCase())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user videos:', error);
    throw error;
  }

  return (data || []).map(dbVideoToIPAsset);
}

/**
 * Get a single video by ID
 */
export async function getVideoById(id: string): Promise<IPAsset | null> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching video:', error);
    throw error;
  }

  return data ? dbVideoToIPAsset(data) : null;
}

/**
 * Create a new video
 */
export async function createVideo(params: {
  title: string;
  description: string;
  skillCategory: string;
  videoIpfsHash: string;
  thumbnailIpfsHash?: string;
  ownerAddress: string;
  isVerifiedHuman: boolean;
  ipId?: string;
  txHash?: string;
}): Promise<IPAsset> {
  const { data, error } = await supabase
    .from('videos')
    .insert({
      title: params.title,
      description: params.description,
      skill_category: params.skillCategory,
      video_ipfs_hash: params.videoIpfsHash,
      thumbnail_ipfs_hash: params.thumbnailIpfsHash || null,
      owner_address: params.ownerAddress.toLowerCase(),
      is_verified_human: params.isVerifiedHuman,
      ip_id: params.ipId || null,
      tx_hash: params.txHash || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating video:', error);
    throw error;
  }

  return dbVideoToIPAsset(data);
}

/**
 * Update a video (only by owner)
 */
export async function updateVideo(
  id: string,
  ownerAddress: string,
  updates: {
    title?: string;
    description?: string;
    skillCategory?: string;
    licenseType?: string;
    licenseTerms?: LicenseTerms;
    ipId?: string;
    txHash?: string;
  }
): Promise<IPAsset | null> {
  // First verify ownership
  const { data: existing } = await supabase
    .from('videos')
    .select('owner_address')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_address.toLowerCase() !== ownerAddress.toLowerCase()) {
    throw new Error('Unauthorized: You can only update your own videos');
  }

  const updateData: Record<string, unknown> = {};
  if (updates.title) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.skillCategory) updateData.skill_category = updates.skillCategory;
  if (updates.licenseType) updateData.license_type = updates.licenseType;
  if (updates.licenseTerms) updateData.license_terms = updates.licenseTerms;
  if (updates.ipId) updateData.ip_id = updates.ipId;
  if (updates.txHash) updateData.tx_hash = updates.txHash;

  const { data, error } = await supabase
    .from('videos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating video:', error);
    throw error;
  }

  return data ? dbVideoToIPAsset(data) : null;
}

/**
 * Delete a video (only by owner)
 */
export async function deleteVideo(id: string, ownerAddress: string): Promise<boolean> {
  // First verify ownership and get IPFS hashes
  const { data: existing } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing || existing.owner_address.toLowerCase() !== ownerAddress.toLowerCase()) {
    throw new Error('Unauthorized: You can only delete your own videos');
  }

  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting video:', error);
    throw error;
  }

  // Return the IPFS hashes for cleanup (optional - unpin from Pinata)
  return true;
}

/**
 * Get videos by category
 */
export async function getVideosByCategory(category: string): Promise<IPAsset[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('skill_category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos by category:', error);
    throw error;
  }

  return (data || []).map(dbVideoToIPAsset);
}

/**
 * Search videos by title or description
 */
export async function searchVideos(query: string): Promise<IPAsset[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching videos:', error);
    throw error;
  }

  return (data || []).map(dbVideoToIPAsset);
}
