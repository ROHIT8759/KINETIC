import { supabase, DBUser } from '@/lib/supabase';

/**
 * Get or create a user by wallet address
 */
export async function getOrCreateUser(walletAddress: string): Promise<DBUser> {
  const normalizedAddress = walletAddress.toLowerCase();

  // Try to get existing user
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', normalizedAddress)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // Create new user if not exists
  if (fetchError && fetchError.code === 'PGRST116') {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        wallet_address: normalizedAddress,
        is_verified: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      throw insertError;
    }

    return newUser;
  }

  throw fetchError;
}

/**
 * Update user World ID verification
 */
export async function verifyUserWithWorldID(
  walletAddress: string,
  nullifierHash: string
): Promise<DBUser> {
  const normalizedAddress = walletAddress.toLowerCase();

  const { data, error } = await supabase
    .from('users')
    .update({
      world_id_nullifier: nullifierHash,
      is_verified: true,
    })
    .eq('wallet_address', normalizedAddress)
    .select()
    .single();

  if (error) {
    console.error('Error updating user verification:', error);
    throw error;
  }

  return data;
}

/**
 * Check if user is verified
 */
export async function isUserVerified(walletAddress: string): Promise<boolean> {
  const normalizedAddress = walletAddress.toLowerCase();

  const { data, error } = await supabase
    .from('users')
    .select('is_verified')
    .eq('wallet_address', normalizedAddress)
    .single();

  if (error) {
    console.error('Error checking user verification:', error);
    return false;
  }

  return data?.is_verified || false;
}

/**
 * Get user by wallet address
 */
export async function getUserByWallet(walletAddress: string): Promise<DBUser | null> {
  const normalizedAddress = walletAddress.toLowerCase();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', normalizedAddress)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching user:', error);
    throw error;
  }

  return data;
}
