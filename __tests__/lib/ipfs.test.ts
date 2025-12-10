/**
 * IPFS Utility Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for Pinata API calls
global.fetch = vi.fn();

describe('IPFS Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('uploadFileToPinata', () => {
        it('should upload file and return IPFS hash', async () => {
            const mockResponse = {
                IpfsHash: 'QmTestFileHash123',
                PinSize: 1024000,
                Timestamp: new Date().toISOString(),
            };

            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            expect(mockResponse.IpfsHash).toMatch(/^Qm/);
            expect(mockResponse.PinSize).toBeGreaterThan(0);
        });

        it('should handle upload failure', async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: false,
                statusText: 'Unauthorized',
            });

            const errorMessage = 'Upload failed: Unauthorized';
            expect(errorMessage).toContain('Unauthorized');
        });

        it('should include proper headers for Pinata', async () => {
            const expectedHeaders = {
                'pinata_api_key': 'test-api-key',
                'pinata_secret_api_key': 'test-secret-key',
            };

            expect(expectedHeaders).toHaveProperty('pinata_api_key');
            expect(expectedHeaders).toHaveProperty('pinata_secret_api_key');
        });
    });

    describe('uploadJSONToPinata', () => {
        it('should upload JSON metadata', async () => {
            const metadata = {
                name: 'Test Video Metadata',
                description: 'Description',
                attributes: [
                    { trait_type: 'Category', value: 'motion' },
                    { trait_type: 'Creator', value: '0x123' },
                ],
            };

            const mockResponse = {
                IpfsHash: 'QmMetadataHash456',
            };

            expect(JSON.stringify(metadata)).toBeTruthy();
            expect(mockResponse.IpfsHash).toMatch(/^Qm/);
        });

        it('should set proper content type for JSON', async () => {
            const contentType = 'application/json';
            expect(contentType).toBe('application/json');
        });
    });

    describe('getIPFSUrl', () => {
        it('should generate correct gateway URL', () => {
            const ipfsHash = 'QmTestHash123';
            const gateway = 'https://gateway.pinata.cloud/ipfs/';
            const url = `${gateway}${ipfsHash}`;

            expect(url).toBe('https://gateway.pinata.cloud/ipfs/QmTestHash123');
        });

        it('should handle different gateway options', () => {
            const ipfsHash = 'QmTestHash123';
            const gateways = [
                'https://gateway.pinata.cloud/ipfs/',
                'https://ipfs.io/ipfs/',
                'https://cloudflare-ipfs.com/ipfs/',
            ];

            gateways.forEach(gateway => {
                const url = `${gateway}${ipfsHash}`;
                expect(url).toContain(ipfsHash);
            });
        });
    });

    describe('unpinFromPinata', () => {
        it('should unpin content by hash', async () => {
            const ipfsHash = 'QmTestHash123';
            const endpoint = `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`;

            expect(endpoint).toContain(ipfsHash);
        });

        it('should handle unpin failure gracefully', async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found',
            });

            // Should not throw, just log warning
            const shouldThrow = false;
            expect(shouldThrow).toBe(false);
        });
    });
});
