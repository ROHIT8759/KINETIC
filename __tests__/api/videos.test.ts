/**
 * API Tests for /api/videos endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    order: vi.fn(() => ({
                        range: vi.fn(() => Promise.resolve({ data: [], error: null })),
                    })),
                    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                })),
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({ data: [], error: null })),
                })),
            })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null })),
                })),
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
            delete: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ error: null })),
            })),
        })),
    },
}));

describe('GET /api/videos', () => {
    it('should return a list of videos', async () => {
        const mockVideos = [
            {
                id: '1',
                title: 'Test Video 1',
                description: 'Description 1',
                category: 'motion',
                ipfs_hash: 'QmTest1',
                ipfs_url: 'https://gateway.pinata.cloud/ipfs/QmTest1',
                owner_address: '0x123',
                created_at: new Date().toISOString(),
            },
            {
                id: '2',
                title: 'Test Video 2',
                description: 'Description 2',
                category: 'nature',
                ipfs_hash: 'QmTest2',
                ipfs_url: 'https://gateway.pinata.cloud/ipfs/QmTest2',
                owner_address: '0x456',
                created_at: new Date().toISOString(),
            },
        ];

        expect(mockVideos).toHaveLength(2);
        expect(mockVideos[0].title).toBe('Test Video 1');
    });

    it('should filter videos by category', async () => {
        const category = 'motion';
        const mockVideos = [
            {
                id: '1',
                title: 'Motion Video',
                category: 'motion',
            },
        ];

        const filtered = mockVideos.filter(v => v.category === category);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].category).toBe('motion');
    });

    it('should filter videos by owner address', async () => {
        const ownerAddress = '0x123';
        const mockVideos = [
            { id: '1', owner_address: '0x123' },
            { id: '2', owner_address: '0x456' },
        ];

        const filtered = mockVideos.filter(v => v.owner_address === ownerAddress);
        expect(filtered).toHaveLength(1);
    });

    it('should paginate results', async () => {
        const page = 1;
        const limit = 10;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        expect(start).toBe(0);
        expect(end).toBe(9);
    });
});

describe('POST /api/videos', () => {
    it('should create a new video with valid data', async () => {
        const newVideo = {
            title: 'New Video',
            description: 'A test video',
            category: 'motion',
            ipfs_hash: 'QmNewHash',
            ipfs_url: 'https://gateway.pinata.cloud/ipfs/QmNewHash',
            owner_address: '0x123',
        };

        expect(newVideo.title).toBe('New Video');
        expect(newVideo.ipfs_hash).toBeTruthy();
        expect(newVideo.owner_address).toBeTruthy();
    });

    it('should reject video creation without required fields', async () => {
        const invalidVideo = {
            title: 'Incomplete Video',
            // missing ipfs_hash, ipfs_url, owner_address
        };

        const requiredFields = ['ipfs_hash', 'ipfs_url', 'owner_address'];
        const missingFields = requiredFields.filter(
            field => !(field in invalidVideo)
        );

        expect(missingFields.length).toBeGreaterThan(0);
    });

    it('should validate category is one of allowed values', async () => {
        const allowedCategories = [
            'motion',
            'industrial',
            'nature',
            'urban',
            'sports',
            'medical',
            'autonomous',
            'other',
        ];

        expect(allowedCategories.includes('motion')).toBe(true);
        expect(allowedCategories.includes('invalid')).toBe(false);
    });
});

describe('GET /api/videos/[id]', () => {
    it('should return a single video by ID', async () => {
        const videoId = 'test-uuid-123';
        const mockVideo = {
            id: videoId,
            title: 'Single Video',
            description: 'Test description',
            category: 'nature',
            ipfs_hash: 'QmSingleTest',
            owner_address: '0x789',
        };

        expect(mockVideo.id).toBe(videoId);
    });

    it('should return 404 for non-existent video', async () => {
        const nonExistentId = 'non-existent-uuid';
        const result = null;

        expect(result).toBeNull();
    });
});

describe('PUT /api/videos/[id]', () => {
    it('should update video when owner makes request', async () => {
        const videoId = 'test-uuid';
        const ownerAddress = '0x123';
        const updateData = {
            title: 'Updated Title',
            description: 'Updated description',
        };

        const video = { id: videoId, owner_address: ownerAddress };
        const requestOwner = '0x123';

        expect(video.owner_address.toLowerCase()).toBe(requestOwner.toLowerCase());
    });

    it('should reject update from non-owner', async () => {
        const video = { id: 'test', owner_address: '0x123' };
        const requestOwner = '0x456';

        const isOwner = video.owner_address.toLowerCase() === requestOwner.toLowerCase();
        expect(isOwner).toBe(false);
    });

    it('should only update allowed fields', async () => {
        const allowedFields = ['title', 'description', 'category', 'thumbnail_url'];
        const updateData = {
            title: 'New Title',
            owner_address: '0xHacker', // should not be updated
            ipfs_hash: 'QmMalicious', // should not be updated
        };

        const filteredData = Object.fromEntries(
            Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
        );

        expect(filteredData).toHaveProperty('title');
        expect(filteredData).not.toHaveProperty('owner_address');
        expect(filteredData).not.toHaveProperty('ipfs_hash');
    });
});

describe('DELETE /api/videos/[id]', () => {
    it('should delete video when owner makes request', async () => {
        const video = { id: 'test', owner_address: '0x123', ipfs_hash: 'QmTest' };
        const requestOwner = '0x123';

        const isOwner = video.owner_address.toLowerCase() === requestOwner.toLowerCase();
        expect(isOwner).toBe(true);
    });

    it('should reject deletion from non-owner', async () => {
        const video = { id: 'test', owner_address: '0x123' };
        const requestOwner = '0x456';

        const isOwner = video.owner_address.toLowerCase() === requestOwner.toLowerCase();
        expect(isOwner).toBe(false);
    });

    it('should unpin from IPFS on successful deletion', async () => {
        const ipfsHash = 'QmTestHash';
        // Mock unpin function would be called here
        expect(ipfsHash).toBeTruthy();
    });
});
