import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PINATA_JWT = process.env.PINATA_JWT;

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { id } = await params;

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Video not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ video: data });
  } catch (error) {
    console.error('Get video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { id } = await params;
    const body = await request.json();
    const { ownerAddress, updates } = body;

    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'Owner address required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('videos')
      .select('owner_address')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    if (existing.owner_address.toLowerCase() !== ownerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only update your own videos' },
        { status: 403 }
      );
    }

    // Prepare update data
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
      throw error;
    }

    return NextResponse.json({ success: true, video: data });
  } catch (error) {
    console.error('Update video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const ownerAddress = searchParams.get('ownerAddress');

    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'Owner address required' },
        { status: 400 }
      );
    }

    // Verify ownership and get IPFS hashes
    const { data: existing } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    if (existing.owner_address.toLowerCase() !== ownerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own videos' },
        { status: 403 }
      );
    }

    // Delete from database
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Optionally unpin from Pinata
    if (PINATA_JWT && existing.video_ipfs_hash) {
      try {
        await fetch(
          `https://api.pinata.cloud/pinning/unpin/${existing.video_ipfs_hash}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${PINATA_JWT}`,
            },
          }
        );
      } catch (unpinError) {
        console.error('Failed to unpin video:', unpinError);
        // Continue anyway - database deletion was successful
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
