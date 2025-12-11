import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const owner = searchParams.get('owner');

    let query = supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'All Categories') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (owner) {
      query = query.eq('owner_address', owner.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching videos:', error);
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ videos: data || [] });
  } catch (error) {
    console.error('Videos API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const body = await request.json();

    const {
      title,
      description,
      skillCategory,
      videoIpfsHash,
      thumbnailIpfsHash,
      ownerAddress,
      isVerifiedHuman,
      ipId,
      txHash,
      tokenId,
      mintTxHash,
    } = body;

    // Validate required fields
    if (!title || !skillCategory || !videoIpfsHash || !ownerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, ensure user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', ownerAddress.toLowerCase())
      .single();

    if (!existingUser) {
      // Create user if not exists
      const { error: userError } = await supabase
        .from('users')
        .insert({
          wallet_address: ownerAddress.toLowerCase(),
          is_verified: isVerifiedHuman || false,
        });

      if (userError && userError.code !== '23505') {
        console.error('Error creating user:', userError);
      }
    }

    // Create video - using column names matching the actual database schema
    const { data, error } = await supabase
      .from('videos')
      .insert({
        title,
        description: description || '',
        category: skillCategory,
        ipfs_hash: videoIpfsHash,
        ipfs_url: `ipfs://${videoIpfsHash}`,
        thumbnail_url: thumbnailIpfsHash ? `ipfs://${thumbnailIpfsHash}` : null,
        owner_address: ownerAddress.toLowerCase(),
        ip_id: ipId || null,
        tx_hash: txHash || mintTxHash || null,
        token_id: tokenId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating video:', error);
      return NextResponse.json(
        { error: 'Failed to create video' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, video: data });
  } catch (error) {
    console.error('Create video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
