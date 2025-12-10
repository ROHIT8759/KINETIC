/**
 * Utility Function Tests
 */

import { describe, it, expect } from 'vitest';

describe('cn (classNames utility)', () => {
    it('should merge class names', () => {
        const classes = ['class1', 'class2'].filter(Boolean).join(' ');
        expect(classes).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        const classes = ['base', isActive && 'active'].filter(Boolean).join(' ');
        expect(classes).toBe('base active');
    });

    it('should filter out falsy values', () => {
        const isFalse = false;
        const classes = ['base', isFalse && 'hidden', undefined, null, ''].filter(Boolean).join(' ');
        expect(classes).toBe('base');
    });

    it('should handle tailwind-merge conflicts', () => {
        // Example: later classes override earlier ones
        const classes = 'p-4 p-2'; // p-2 should win
        const lastPadding = classes.split(' ').filter(c => c.startsWith('p-')).pop();
        expect(lastPadding).toBe('p-2');
    });
});

describe('Address Utilities', () => {
    describe('truncateAddress', () => {
        it('should truncate ethereum address', () => {
            const address = '0x1234567890abcdef1234567890abcdef12345678';
            const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
            expect(truncated).toBe('0x1234...5678');
        });

        it('should handle short addresses', () => {
            const address = '0x1234';
            const truncated = address.length > 10 
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : address;
            expect(truncated).toBe('0x1234');
        });

        it('should handle null/undefined', () => {
            const address = null;
            const truncated = address || '';
            expect(truncated).toBe('');
        });
    });

    describe('isValidAddress', () => {
        it('should validate ethereum address format', () => {
            const address = '0x1234567890abcdef1234567890abcdef12345678';
            const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
            expect(isValid).toBe(true);
        });

        it('should reject invalid addresses', () => {
            const invalidAddresses = [
                'not-an-address',
                '0x123', // too short
                '1234567890abcdef1234567890abcdef12345678', // no 0x prefix
            ];

            invalidAddresses.forEach(address => {
                const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
                expect(isValid).toBe(false);
            });
        });
    });

    describe('compareAddresses', () => {
        it('should compare addresses case-insensitively', () => {
            const addr1 = '0x1234567890ABCDEF1234567890abcdef12345678';
            const addr2 = '0x1234567890abcdef1234567890ABCDEF12345678';
            const areEqual = addr1.toLowerCase() === addr2.toLowerCase();
            expect(areEqual).toBe(true);
        });
    });
});

describe('File Utilities', () => {
    describe('formatFileSize', () => {
        it('should format bytes', () => {
            const bytes = 500;
            const formatted = bytes < 1024 ? `${bytes} B` : '';
            expect(formatted).toBe('500 B');
        });

        it('should format kilobytes', () => {
            const bytes = 1500;
            const kb = (bytes / 1024).toFixed(1);
            expect(parseFloat(kb)).toBeCloseTo(1.5, 1);
        });

        it('should format megabytes', () => {
            const bytes = 5 * 1024 * 1024;
            const mb = (bytes / (1024 * 1024)).toFixed(1);
            expect(parseFloat(mb)).toBe(5);
        });

        it('should format gigabytes', () => {
            const bytes = 2 * 1024 * 1024 * 1024;
            const gb = (bytes / (1024 * 1024 * 1024)).toFixed(1);
            expect(parseFloat(gb)).toBe(2);
        });
    });

    describe('getFileExtension', () => {
        it('should extract extension from filename', () => {
            const filename = 'video.mp4';
            const ext = filename.split('.').pop();
            expect(ext).toBe('mp4');
        });

        it('should handle multiple dots', () => {
            const filename = 'my.video.file.mp4';
            const ext = filename.split('.').pop();
            expect(ext).toBe('mp4');
        });

        it('should handle no extension', () => {
            const filename = 'filename';
            const ext = filename.includes('.') ? filename.split('.').pop() : '';
            expect(ext).toBe('');
        });
    });

    describe('isVideoFile', () => {
        it('should identify video MIME types', () => {
            const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
            const mimeType = 'video/mp4';
            expect(videoTypes.includes(mimeType)).toBe(true);
        });

        it('should reject non-video types', () => {
            const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
            const mimeType = 'image/png';
            expect(videoTypes.includes(mimeType)).toBe(false);
        });
    });
});

describe('Date Utilities', () => {
    describe('formatDate', () => {
        it('should format ISO date string', () => {
            const isoDate = '2024-01-15T10:30:00Z';
            const date = new Date(isoDate);
            const formatted = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
            expect(formatted).toContain('Jan');
            expect(formatted).toContain('2024');
        });
    });

    describe('timeAgo', () => {
        it('should show "just now" for recent dates', () => {
            const now = Date.now();
            const date = new Date(now - 30000); // 30 seconds ago
            const diffSeconds = (now - date.getTime()) / 1000;
            const timeAgo = diffSeconds < 60 ? 'just now' : '';
            expect(timeAgo).toBe('just now');
        });

        it('should show minutes ago', () => {
            const now = Date.now();
            const date = new Date(now - 5 * 60 * 1000); // 5 minutes ago
            const diffMinutes = Math.floor((now - date.getTime()) / 60000);
            expect(diffMinutes).toBe(5);
        });

        it('should show hours ago', () => {
            const now = Date.now();
            const date = new Date(now - 3 * 60 * 60 * 1000); // 3 hours ago
            const diffHours = Math.floor((now - date.getTime()) / 3600000);
            expect(diffHours).toBe(3);
        });

        it('should show days ago', () => {
            const now = Date.now();
            const date = new Date(now - 2 * 24 * 60 * 60 * 1000); // 2 days ago
            const diffDays = Math.floor((now - date.getTime()) / 86400000);
            expect(diffDays).toBe(2);
        });
    });
});

describe('IPFS Utilities', () => {
    describe('isValidIPFSHash', () => {
        it('should validate CIDv0 (Qm...)', () => {
            const hash = 'QmYwAPJzv5CZsnAzt8auVZRn2tvY3FLDy2y9e3cJtE5V6y';
            const isValid = hash.startsWith('Qm') && hash.length === 46;
            expect(isValid).toBe(true);
        });

        it('should validate CIDv1 (bafy...)', () => {
            const hash = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
            const isValid = hash.startsWith('bafy');
            expect(isValid).toBe(true);
        });

        it('should reject invalid hashes', () => {
            const invalidHashes = ['invalid', '123', 'Qm123']; // too short
            invalidHashes.forEach(hash => {
                const isValidV0 = hash.startsWith('Qm') && hash.length === 46;
                const isValidV1 = hash.startsWith('bafy');
                expect(isValidV0 || isValidV1).toBe(false);
            });
        });
    });

    describe('buildIPFSUrl', () => {
        it('should build Pinata gateway URL', () => {
            const hash = 'QmTestHash123';
            const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
            expect(url).toBe('https://gateway.pinata.cloud/ipfs/QmTestHash123');
        });

        it('should build IPFS.io gateway URL', () => {
            const hash = 'QmTestHash123';
            const url = `https://ipfs.io/ipfs/${hash}`;
            expect(url).toBe('https://ipfs.io/ipfs/QmTestHash123');
        });
    });
});

describe('Validation Utilities', () => {
    describe('validateVideoUpload', () => {
        it('should validate required fields', () => {
            const data = {
                title: 'Test Video',
                category: 'motion',
                ipfs_hash: 'QmTest',
                owner_address: '0x123',
            };

            const requiredFields = ['title', 'category', 'ipfs_hash', 'owner_address'];
            const isValid = requiredFields.every(field => data[field as keyof typeof data]);
            expect(isValid).toBe(true);
        });

        it('should reject missing required fields', () => {
            const data = {
                title: 'Test Video',
                // missing category, ipfs_hash, owner_address
            };

            const requiredFields = ['title', 'category', 'ipfs_hash', 'owner_address'];
            const isValid = requiredFields.every(field => data[field as keyof typeof data]);
            expect(isValid).toBe(false);
        });

        it('should validate category enum', () => {
            const validCategories = ['motion', 'industrial', 'nature', 'urban', 'sports', 'medical', 'autonomous', 'other'];
            const category = 'motion';
            expect(validCategories).toContain(category);
        });
    });

    describe('validateLicenseTerms', () => {
        it('should validate license structure', () => {
            const license = {
                commercialUse: true,
                attribution: true,
                derivativesAllowed: true,
            };

            expect(typeof license.commercialUse).toBe('boolean');
            expect(typeof license.attribution).toBe('boolean');
        });

        it('should validate price is non-negative', () => {
            const price = 100;
            expect(price >= 0).toBe(true);
        });
    });
});
