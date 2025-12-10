import { NextRequest, NextResponse } from 'next/server';

const PINATA_JWT = process.env.PINATA_JWT;

export async function POST(request: NextRequest) {
  try {
    if (!PINATA_JWT) {
      return NextResponse.json(
        { error: 'IPFS configuration missing' },
        { status: 500 }
      );
    }

    const metadata = await request.json();

    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json(
        { error: 'Invalid metadata' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: 'metadata.json',
        },
        pinataOptions: {
          cidVersion: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata metadata upload error:', errorText);
      return NextResponse.json(
        { error: 'Failed to upload metadata to IPFS' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      ipfsHash: data.IpfsHash,
    });
  } catch (error) {
    console.error('Metadata upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
