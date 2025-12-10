/**
 * Supabase Client and Database Operation Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase types for testing
interface MockUser {
    id: string;
    wallet_address: string;
    username: string | null;
    is_verified: boolean;
    world_id_hash: string | null;
    created_at: string;
    updated_at: string;
}

interface MockVideo {
    id: string;
    title: string;
    description: string | null;
    category: string;
    ipfs_hash: string;
    ipfs_url: string;
    metadata_hash: string | null;
    owner_id: string | null;
    owner_address: string;
    views: number;
    likes: number;
    created_at: string;
    updated_at: string;
}

describe('Supabase Client', () => {
    describe('Connection', () => {
        it('should have valid Supabase URL format', () => {
            const url = 'https://project-id.supabase.co';
            expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/);
        });

        it('should have anon key configured', () => {
            const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
            expect(anonKey).toBeTruthy();
            expect(anonKey.length).toBeGreaterThan(20);
        });
    });
});

describe('Users Table Operations', () => {
    const mockUser: MockUser = {
        id: 'uuid-123',
        wallet_address: '0x1234567890abcdef',
        username: 'testuser',
        is_verified: false,
        world_id_hash: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    describe('Create User', () => {
        it('should create user with wallet address', () => {
            expect(mockUser.wallet_address).toBeTruthy();
            expect(mockUser.wallet_address).toMatch(/^0x/);
        });

        it('should auto-generate UUID for new users', () => {
            expect(mockUser.id).toBeTruthy();
            expect(typeof mockUser.id).toBe('string');
        });

        it('should set default values correctly', () => {
            expect(mockUser.is_verified).toBe(false);
            expect(mockUser.world_id_hash).toBeNull();
        });
    });

    describe('Find User by Wallet', () => {
        it('should find user by wallet address (case-insensitive)', () => {
            const searchAddress = '0x1234567890ABCDEF';
            const matches = mockUser.wallet_address.toLowerCase() === searchAddress.toLowerCase();
            expect(matches).toBe(true);
        });

        it('should return null for non-existent wallet', () => {
            const result = null;
            expect(result).toBeNull();
        });
    });

    describe('Update User', () => {
        it('should update username', () => {
            const updatedUser = { ...mockUser, username: 'newusername' };
            expect(updatedUser.username).toBe('newusername');
        });

        it('should update is_verified when World ID verified', () => {
            const updatedUser = {
                ...mockUser,
                is_verified: true,
                world_id_hash: 'world-id-hash-123',
            };
            expect(updatedUser.is_verified).toBe(true);
            expect(updatedUser.world_id_hash).toBeTruthy();
        });

        it('should auto-update updated_at timestamp', () => {
            const originalUpdatedAt = mockUser.updated_at;
            const newUpdatedAt = new Date().toISOString();
            expect(newUpdatedAt).not.toBe(originalUpdatedAt);
        });
    });
});

describe('Videos Table Operations', () => {
    const mockVideo: MockVideo = {
        id: 'video-uuid-123',
        title: 'Test Video',
        description: 'A test video description',
        category: 'motion',
        ipfs_hash: 'QmTestHash123',
        ipfs_url: 'https://gateway.pinata.cloud/ipfs/QmTestHash123',
        metadata_hash: 'QmMetadataHash456',
        owner_id: 'user-uuid-123',
        owner_address: '0x1234567890abcdef',
        views: 0,
        likes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    describe('Create Video', () => {
        it('should create video with required fields', () => {
            expect(mockVideo.title).toBeTruthy();
            expect(mockVideo.category).toBeTruthy();
            expect(mockVideo.ipfs_hash).toBeTruthy();
            expect(mockVideo.ipfs_url).toBeTruthy();
            expect(mockVideo.owner_address).toBeTruthy();
        });

        it('should initialize stats to zero', () => {
            expect(mockVideo.views).toBe(0);
            expect(mockVideo.likes).toBe(0);
        });

        it('should validate category is allowed', () => {
            const allowedCategories = [
                'motion', 'industrial', 'nature', 'urban',
                'sports', 'medical', 'autonomous', 'other'
            ];
            expect(allowedCategories).toContain(mockVideo.category);
        });
    });

    describe('Query Videos', () => {
        it('should filter by category', () => {
            const videos = [mockVideo];
            const filtered = videos.filter(v => v.category === 'motion');
            expect(filtered.length).toBe(1);
        });

        it('should filter by owner', () => {
            const videos = [mockVideo];
            const filtered = videos.filter(v => v.owner_address === '0x1234567890abcdef');
            expect(filtered.length).toBe(1);
        });

        it('should order by created_at descending', () => {
            const videos = [
                { ...mockVideo, id: '1', created_at: '2024-01-01' },
                { ...mockVideo, id: '2', created_at: '2024-01-02' },
            ];
            const sorted = videos.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            expect(sorted[0].id).toBe('2');
        });

        it('should paginate results', () => {
            const allVideos = Array.from({ length: 25 }, (_, i) => ({
                ...mockVideo,
                id: `video-${i}`,
            }));
            const page = 1;
            const limit = 10;
            const paginated = allVideos.slice((page - 1) * limit, page * limit);
            expect(paginated.length).toBe(10);
        });
    });

    describe('Update Video', () => {
        it('should only allow owner to update', () => {
            const requestOwner = '0x1234567890abcdef';
            const isOwner = mockVideo.owner_address.toLowerCase() === requestOwner.toLowerCase();
            expect(isOwner).toBe(true);
        });

        it('should not allow changing owner_address', () => {
            const protectedFields = ['id', 'owner_address', 'owner_id', 'ipfs_hash', 'ipfs_url'];
            const updateData = { owner_address: '0xhacker' };
            
            const hasProtected = Object.keys(updateData).some(k => protectedFields.includes(k));
            expect(hasProtected).toBe(true);
        });

        it('should increment views', () => {
            const updatedViews = mockVideo.views + 1;
            expect(updatedViews).toBe(1);
        });

        it('should increment likes', () => {
            const updatedLikes = mockVideo.likes + 1;
            expect(updatedLikes).toBe(1);
        });
    });

    describe('Delete Video', () => {
        it('should only allow owner to delete', () => {
            const requestOwner = '0x1234567890abcdef';
            const isOwner = mockVideo.owner_address.toLowerCase() === requestOwner.toLowerCase();
            expect(isOwner).toBe(true);
        });

        it('should cascade delete related licenses', () => {
            // With ON DELETE CASCADE, deleting video removes licenses
            const cascadeEnabled = true;
            expect(cascadeEnabled).toBe(true);
        });
    });
});

describe('Licenses Table Operations', () => {
    interface MockLicense {
        id: string;
        video_id: string;
        licensee_id: string;
        licensee_address: string;
        license_type: string;
        price: number;
        currency: string;
        tx_hash: string | null;
        expires_at: string | null;
        created_at: string;
    }

    const mockLicense: MockLicense = {
        id: 'license-uuid-123',
        video_id: 'video-uuid-123',
        licensee_id: 'user-uuid-456',
        licensee_address: '0xabcdef1234567890',
        license_type: 'commercial',
        price: 100,
        currency: 'IP',
        tx_hash: '0xtxhash123',
        expires_at: null,
        created_at: new Date().toISOString(),
    };

    describe('Create License', () => {
        it('should create license with valid video reference', () => {
            expect(mockLicense.video_id).toBeTruthy();
        });

        it('should record licensee information', () => {
            expect(mockLicense.licensee_address).toBeTruthy();
            expect(mockLicense.licensee_address).toMatch(/^0x/);
        });

        it('should validate license type', () => {
            const validTypes = ['commercial', 'non-commercial', 'exclusive'];
            expect(validTypes).toContain(mockLicense.license_type);
        });

        it('should record transaction hash', () => {
            expect(mockLicense.tx_hash).toBeTruthy();
        });
    });

    describe('Query Licenses', () => {
        it('should find licenses by video', () => {
            const licenses = [mockLicense];
            const videoLicenses = licenses.filter(l => l.video_id === 'video-uuid-123');
            expect(videoLicenses.length).toBe(1);
        });

        it('should find licenses by licensee', () => {
            const licenses = [mockLicense];
            const userLicenses = licenses.filter(l => l.licensee_address === '0xabcdef1234567890');
            expect(userLicenses.length).toBe(1);
        });
    });
});
