const fs = require('fs');
const path = require('path');

const videoPath = 'C:\\Users\\RohitKumarKundu\\Pictures\\Camera Roll\\WIN_20251211_00_05_55_Pro.mp4';
const API_URL = 'http://localhost:3000';

async function testUpload() {
    console.log('=== Video Upload Test ===\n');

    // 1. Check file exists
    if (!fs.existsSync(videoPath)) {
        console.error('❌ File not found:', videoPath);
        return;
    }

    const stats = fs.statSync(videoPath);
    console.log('✓ File found');
    console.log('  Path:', videoPath);
    console.log('  Size:', (stats.size / (1024 * 1024)).toFixed(2), 'MB');

    // 2. Read file and create FormData
    console.log('\n📤 Uploading video to IPFS...');

    const fileBuffer = fs.readFileSync(videoPath);
    const blob = new Blob([fileBuffer], { type: 'video/mp4' });

    const formData = new FormData();
    formData.append('file', blob, 'WIN_20251211_00_05_55_Pro.mp4');

    try {
        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
            console.error('❌ Upload failed:', uploadData.error);
            return;
        }

        console.log('✓ Video uploaded to IPFS!');
        console.log('  IPFS Hash:', uploadData.ipfsHash);
        console.log('  Gateway URL: https://gateway.pinata.cloud/ipfs/' + uploadData.ipfsHash);

        // 3. Upload metadata
        console.log('\n📤 Uploading metadata to IPFS...');

        const metadata = {
            name: 'Test Video Upload',
            description: 'Testing video upload functionality',
            image: `ipfs://${uploadData.ipfsHash}`,
            animation_url: `ipfs://${uploadData.ipfsHash}`,
            attributes: [
                { trait_type: 'Skill Category', value: 'Other' },
                { trait_type: 'Human Verified', value: 'Yes' },
                { trait_type: 'Platform', value: 'Kinetic' },
            ],
        };

        const metadataResponse = await fetch(`${API_URL}/api/upload/metadata`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata),
        });

        const metadataData = await metadataResponse.json();

        if (!metadataResponse.ok) {
            console.error('❌ Metadata upload failed:', metadataData.error);
            return;
        }

        console.log('✓ Metadata uploaded to IPFS!');
        console.log('  Metadata Hash:', metadataData.ipfsHash);

        // 4. Save to database
        console.log('\n💾 Saving to database...');

        const videoData = {
            title: 'Test Video Upload',
            description: 'Testing video upload functionality from script',
            skillCategory: 'Other',
            videoIpfsHash: uploadData.ipfsHash,
            ownerAddress: '0x3a9835bBA3FcE570F32E32aF81eBA3e1a0e2105E',
            isVerifiedHuman: true,
        };

        const saveResponse = await fetch(`${API_URL}/api/videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(videoData),
        });

        const saveData = await saveResponse.json();

        if (!saveResponse.ok) {
            console.error('❌ Save to database failed:', saveData.error);
            return;
        }

        console.log('✓ Saved to database!');
        console.log('  Video ID:', saveData.video.id);

        console.log('\n=== Upload Test Complete ===');
        console.log('\n📊 Summary:');
        console.log('  Video IPFS Hash:', uploadData.ipfsHash);
        console.log('  Metadata IPFS Hash:', metadataData.ipfsHash);
        console.log('  Database ID:', saveData.video.id);
        console.log('  View at: http://localhost:3000/explore');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testUpload();
