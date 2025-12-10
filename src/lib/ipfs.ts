// IPFS utilities using Pinata

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadFileToPinata(
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      type: file.type,
      size: file.size.toString(),
    },
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata upload failed: ${error}`);
  }

  const data: PinataUploadResponse = await response.json();
  return data.IpfsHash;
}

/**
 * Upload JSON metadata to IPFS via Pinata
 */
export async function uploadJSONToPinata(
  json: Record<string, unknown>,
  name?: string
): Promise<string> {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: {
        name: name || 'metadata.json',
      },
      pinataOptions: {
        cidVersion: 1,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata JSON upload failed: ${error}`);
  }

  const data: PinataUploadResponse = await response.json();
  return data.IpfsHash;
}

/**
 * Get the gateway URL for an IPFS hash
 */
export function getIPFSUrl(hash: string): string {
  if (hash.startsWith('ipfs://')) {
    hash = hash.replace('ipfs://', '');
  }
  return `${PINATA_GATEWAY}/ipfs/${hash}`;
}

/**
 * Unpin a file from Pinata (for deletion)
 */
export async function unpinFromPinata(hash: string): Promise<boolean> {
  if (hash.startsWith('ipfs://')) {
    hash = hash.replace('ipfs://', '');
  }

  const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
  });

  return response.ok;
}
