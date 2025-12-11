/**
 * KINETIC - Feature Test Suite
 * 
 * Tests for:
 * 1. Wallet Connection & Wallet Client Retry Logic
 * 2. World ID Orb Verification
 * 3. NFT Minting Flow
 * 4. Story Protocol Registration
 * 5. IPFS Upload
 * 
 * Run with: node test-features.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    total: 0,
    suites: [],
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    gray: '\x1b[90m',
    bold: '\x1b[1m',
};

function log(message, type = 'info') {
    const typeColors = {
        info: colors.cyan,
        success: colors.green,
        error: colors.red,
        warn: colors.yellow,
        gray: colors.gray,
    };
    console.log(`${typeColors[type] || colors.cyan}${message}${colors.reset}`);
}

function testResult(name, passed, details = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        console.log(`${colors.green}  ✓${colors.reset} ${name}`);
    } else {
        testResults.failed++;
        console.log(`${colors.red}  ✗${colors.reset} ${name}`);
    }
    if (details) {
        console.log(`${colors.gray}    └─ ${details}${colors.reset}`);
    }
    return passed;
}

function warn(name, details = '') {
    testResults.warnings++;
    console.log(`${colors.yellow}  ⚠${colors.reset} ${name}`);
    if (details) {
        console.log(`${colors.gray}    └─ ${details}${colors.reset}`);
    }
}

function startSuite(name) {
    console.log(`\n${colors.cyan}${colors.bold}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}  ${name}${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════════════════${colors.reset}\n`);
}

// ============================================
// TEST SUITE 1: Wallet Connection Features
// ============================================
async function testWalletFeatures() {
    startSuite('🔗 TEST SUITE 1: Wallet Connection Features');

    const results = { passed: 0, failed: 0 };

    // Test 1.1: Check Web3Provider configuration
    const web3ProviderPath = './src/providers/Web3Provider.tsx';
    if (fs.existsSync(web3ProviderPath)) {
        const content = fs.readFileSync(web3ProviderPath, 'utf8');

        if (testResult(
            'Web3Provider uses wagmi WagmiProvider',
            content.includes('WagmiProvider'),
            'WagmiProvider wrapper found'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Web3Provider uses QueryClientProvider',
            content.includes('QueryClientProvider'),
            'React Query integration found'
        )) results.passed++; else results.failed++;

        if (testResult(
            'SSR mode enabled',
            content.includes('ssr: true') || content.includes('ssr:true'),
            'Server-side rendering support enabled'
        )) results.passed++; else results.failed++;

        // Check for auto-detection (no explicit connectors that can cause issues)
        const usesAutoDetection = !content.includes('geminiWallet') &&
            (content.includes('createConfig') || content.includes('getDefaultConfig'));
        if (testResult(
            'Uses safe wallet auto-detection',
            usesAutoDetection,
            'No problematic wallet imports'
        )) results.passed++; else results.failed++;

    } else {
        testResult('Web3Provider exists', false, 'File not found');
        results.failed++;
    }

    // Test 1.2: Check NFT Contract hook for retry logic
    const nftContractPath = './src/hooks/useNFTContract.ts';
    if (fs.existsSync(nftContractPath)) {
        const content = fs.readFileSync(nftContractPath, 'utf8');

        if (testResult(
            'useNFTContract uses useAccount hook',
            content.includes('useAccount'),
            'Account hook imported from wagmi'
        )) results.passed++; else results.failed++;

        if (testResult(
            'useNFTContract uses getWalletClient action',
            content.includes('getWalletClient') && content.includes('wagmi/actions'),
            'Wallet client fetched on-demand via wagmi actions'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has getClient helper function',
            content.includes('getClient') && content.includes('async'),
            'On-demand wallet client fetching'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Checks isConnected before transactions',
            content.includes('isConnected'),
            'Connection status verified'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Returns isWalletReady state',
            content.includes('isWalletReady'),
            'UI can show wallet readiness'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Returns isWalletLoading state',
            content.includes('isWalletLoading'),
            'UI can show loading state'
        )) results.passed++; else results.failed++;

    } else {
        testResult('useNFTContract hook exists', false, 'File not found');
        results.failed++;
    }

    // Test 1.3: Check upload page wallet handling
    const uploadPagePath = './src/app/upload/page.tsx';
    if (fs.existsSync(uploadPagePath)) {
        const content = fs.readFileSync(uploadPagePath, 'utf8');

        if (testResult(
            'Upload page uses useAccount',
            content.includes('useAccount'),
            'Wallet connection detected'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Upload page handles isWalletReady',
            content.includes('isWalletReady'),
            'Shows wallet readiness status'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Upload page handles isWalletLoading',
            content.includes('isWalletLoading'),
            'Shows loading state during wallet init'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has wallet connection warning',
            content.includes('Connect Wallet') || content.includes('Wallet not connected'),
            'User feedback for wallet state'
        )) results.passed++; else results.failed++;

    } else {
        testResult('Upload page exists', false, 'File not found');
        results.failed++;
    }

    testResults.suites.push({ name: 'Wallet Connection', ...results });
    return results;
}

// ============================================
// TEST SUITE 2: World ID Verification Features
// ============================================
async function testWorldIDFeatures() {
    startSuite('🌍 TEST SUITE 2: World ID Verification Features');

    const results = { passed: 0, failed: 0 };

    // Test 2.1: Environment configuration
    const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID;
    const action = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION;

    if (testResult(
        'World ID App ID configured',
        appId && appId.startsWith('app_'),
        appId || 'Missing NEXT_PUBLIC_WORLDCOIN_APP_ID'
    )) results.passed++; else results.failed++;

    if (testResult(
        'World ID Action configured',
        !!action && action.length > 0,
        `Action: "${action || 'Missing'}"`
    )) results.passed++; else results.failed++;

    // Test 2.2: WorldIDVerify component
    const worldIdComponentPath = './src/components/upload/WorldIDVerify.tsx';
    if (fs.existsSync(worldIdComponentPath)) {
        const content = fs.readFileSync(worldIdComponentPath, 'utf8');

        if (testResult(
            'Uses IDKitWidget from @worldcoin/idkit',
            content.includes('IDKitWidget'),
            'Official Worldcoin widget'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Uses VerificationLevel.Orb',
            content.includes('VerificationLevel.Orb'),
            'Orb verification for on-chain compatibility'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has handleVerify callback (server-side)',
            content.includes('handleVerify'),
            'Server-side proof verification pattern'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has error handling with onError',
            content.includes('onError'),
            'Error callback configured'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Calls /api/verify-worldid endpoint',
            content.includes('/api/verify-worldid'),
            'Backend verification implemented'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has mock verification for development',
            content.includes('onMockVerify') || content.includes('Mock'),
            'Dev testing support'
        )) results.passed++; else results.failed++;

    } else {
        testResult('WorldIDVerify component exists', false, 'File not found');
        results.failed++;
    }

    // Test 2.3: World ID API endpoint
    const apiPath = './src/app/api/verify-worldid/route.ts';
    if (fs.existsSync(apiPath)) {
        const content = fs.readFileSync(apiPath, 'utf8');

        if (testResult(
            'API route is POST handler',
            content.includes('export async function POST'),
            'Correct HTTP method'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Validates proof fields',
            content.includes('proof') && content.includes('merkle_root') && content.includes('nullifier_hash'),
            'All required proof fields checked'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Calls Worldcoin verification API',
            content.includes('developer.worldcoin.org/api/v1/verify'),
            'Official API endpoint used'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Returns verification result',
            content.includes('verified') || content.includes('success'),
            'Response includes verification status'
        )) results.passed++; else results.failed++;

    } else {
        testResult('World ID API route exists', false, 'File not found');
        results.failed++;
    }

    // Test 2.4: TypeScript types
    const typesPath = './src/types/index.ts';
    if (fs.existsSync(typesPath)) {
        const content = fs.readFileSync(typesPath, 'utf8');

        if (testResult(
            'WorldIDProof type defined',
            content.includes('WorldIDProof'),
            'Type-safe proof handling'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Supports orb and device levels',
            content.includes('"orb"') && content.includes('"device"'),
            'Both verification levels typed'
        )) results.passed++; else results.failed++;

    } else {
        testResult('Types file exists', false, 'File not found');
        results.failed++;
    }

    testResults.suites.push({ name: 'World ID Verification', ...results });
    return results;
}

// ============================================
// TEST SUITE 3: NFT Minting Features
// ============================================
async function testNFTMintingFeatures() {
    startSuite('🎨 TEST SUITE 3: NFT Minting Features');

    const results = { passed: 0, failed: 0 };

    // Test 3.1: Contract configuration
    const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
    const validAddress = /^0x[a-fA-F0-9]{40}$/.test(contractAddress);

    if (testResult(
        'NFT Contract address configured',
        validAddress,
        contractAddress || 'Missing'
    )) results.passed++; else results.failed++;

    // Test 3.2: Contract configuration file
    const contractsPath = './src/lib/contracts.ts';
    if (fs.existsSync(contractsPath)) {
        const content = fs.readFileSync(contractsPath, 'utf8');

        if (testResult(
            'Has KineticVideoNFT ABI',
            content.includes('KINETIC_VIDEO_NFT_ABI'),
            'Contract ABI defined'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has mintVideo function in ABI',
            content.includes('mintVideo'),
            'Minting function available'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has isContractConfigured helper',
            content.includes('isContractConfigured'),
            'Contract configuration check'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has Story Protocol addresses',
            content.includes('STORY_PROTOCOL_ADDRESSES'),
            'Protocol addresses configured'
        )) results.passed++; else results.failed++;

    } else {
        testResult('Contracts file exists', false, 'File not found');
        results.failed++;
    }

    // Test 3.3: NFT Contract hook
    const hookPath = './src/hooks/useNFTContract.ts';
    if (fs.existsSync(hookPath)) {
        const content = fs.readFileSync(hookPath, 'utf8');

        if (testResult(
            'Exports mintVideo function',
            content.includes('mintVideo'),
            'Minting function available'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Returns transaction hash',
            content.includes('txHash'),
            'Transaction tracking'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Returns tokenId',
            content.includes('tokenId'),
            'Token identification'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has loading state',
            content.includes('isLoading'),
            'UI feedback support'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has error handling',
            content.includes('setError') && content.includes('catch'),
            'Error state management'
        )) results.passed++; else results.failed++;

    } else {
        testResult('useNFTContract hook exists', false, 'File not found');
        results.failed++;
    }

    testResults.suites.push({ name: 'NFT Minting', ...results });
    return results;
}

// ============================================
// TEST SUITE 4: Story Protocol Integration
// ============================================
async function testStoryProtocolFeatures() {
    startSuite('📜 TEST SUITE 4: Story Protocol Integration');

    const results = { passed: 0, failed: 0 };

    // Test 4.1: Environment configuration
    const ipRegistry = process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY;
    const licensingModule = process.env.NEXT_PUBLIC_LICENSING_MODULE;
    const chainId = process.env.NEXT_PUBLIC_STORY_CHAIN_ID;

    if (testResult(
        'IP Asset Registry configured',
        /^0x[a-fA-F0-9]{40}$/.test(ipRegistry),
        ipRegistry || 'Missing'
    )) results.passed++; else results.failed++;

    if (testResult(
        'Licensing Module configured',
        /^0x[a-fA-F0-9]{40}$/.test(licensingModule),
        licensingModule || 'Missing'
    )) results.passed++; else results.failed++;

    if (testResult(
        'Chain ID is Story Iliad (1513)',
        chainId === '1513',
        `Chain ID: ${chainId || 'Missing'}`
    )) results.passed++; else results.failed++;

    // Test 4.2: Story Protocol hook
    const hookPath = './src/hooks/useStoryProtocol.ts';
    if (fs.existsSync(hookPath)) {
        const content = fs.readFileSync(hookPath, 'utf8');

        if (testResult(
            'Has registerIP function',
            content.includes('registerIP'),
            'IP registration available'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has attachLicense function',
            content.includes('attachLicense'),
            'License attachment available'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Checks Story network',
            content.includes('isOnStoryNetwork') || content.includes('chainId'),
            'Network validation'
        )) results.passed++; else results.failed++;

    } else {
        testResult('useStoryProtocol hook exists', false, 'File not found');
        results.failed++;
    }

    testResults.suites.push({ name: 'Story Protocol', ...results });
    return results;
}

// ============================================
// TEST SUITE 5: IPFS Upload Features
// ============================================
async function testIPFSFeatures() {
    startSuite('📦 TEST SUITE 5: IPFS Upload Features');

    const results = { passed: 0, failed: 0 };

    // Test 5.1: Environment configuration
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecret = process.env.PINATA_SECRET_KEY;
    const pinataJwt = process.env.PINATA_JWT;

    if (testResult(
        'Pinata API Key configured',
        pinataApiKey && pinataApiKey.length > 10,
        pinataApiKey ? `${pinataApiKey.substring(0, 10)}...` : 'Missing'
    )) results.passed++; else results.failed++;

    if (testResult(
        'Pinata Secret Key configured',
        pinataSecret && pinataSecret.length > 20,
        pinataSecret ? 'Configured' : 'Missing'
    )) results.passed++; else results.failed++;

    if (testResult(
        'Pinata JWT configured',
        pinataJwt && pinataJwt.startsWith('eyJ'),
        pinataJwt ? 'Valid JWT format' : 'Missing'
    )) results.passed++; else results.failed++;

    // Test 5.2: IPFS hook
    const hookPath = './src/hooks/useIPFS.ts';
    if (fs.existsSync(hookPath)) {
        const content = fs.readFileSync(hookPath, 'utf8');

        if (testResult(
            'Has uploadFile function',
            content.includes('uploadFile'),
            'File upload available'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has uploadMetadata function',
            content.includes('uploadMetadata'),
            'Metadata upload available'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has progress tracking',
            content.includes('progress'),
            'Upload progress feedback'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Has gateway URL helper',
            content.includes('getGatewayUrl') || content.includes('gateway'),
            'IPFS gateway support'
        )) results.passed++; else results.failed++;

    } else {
        testResult('useIPFS hook exists', false, 'File not found');
        results.failed++;
    }

    // Test 5.3: Upload API endpoint
    const apiPath = './src/app/api/upload/route.ts';
    if (fs.existsSync(apiPath)) {
        const content = fs.readFileSync(apiPath, 'utf8');

        if (testResult(
            'Upload API is POST handler',
            content.includes('export async function POST'),
            'Correct HTTP method'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Connects to Pinata',
            content.includes('pinata') || content.includes('PINATA'),
            'Pinata integration'
        )) results.passed++; else results.failed++;

    } else {
        testResult('Upload API route exists', false, 'File not found');
        results.failed++;
    }

    testResults.suites.push({ name: 'IPFS Upload', ...results });
    return results;
}

// ============================================
// TEST SUITE 6: Database Integration
// ============================================
async function testDatabaseFeatures() {
    startSuite('🗄️ TEST SUITE 6: Database Integration');

    const results = { passed: 0, failed: 0 };

    // Test 6.1: Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (testResult(
        'Supabase URL configured',
        supabaseUrl && supabaseUrl.includes('supabase'),
        supabaseUrl ? 'Configured' : 'Missing'
    )) results.passed++; else results.failed++;

    if (testResult(
        'Supabase anon key configured',
        supabaseKey && supabaseKey.length > 100,
        supabaseKey ? 'Valid key format' : 'Missing'
    )) results.passed++; else results.failed++;

    // Test 6.2: Videos API
    const videosApiPath = './src/app/api/videos/route.ts';
    if (fs.existsSync(videosApiPath)) {
        const content = fs.readFileSync(videosApiPath, 'utf8');

        if (testResult(
            'Videos API has GET handler',
            content.includes('export async function GET'),
            'Fetch videos endpoint'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Videos API has POST handler',
            content.includes('export async function POST'),
            'Create video endpoint'
        )) results.passed++; else results.failed++;

        if (testResult(
            'Uses Supabase client',
            content.includes('supabase') || content.includes('createClient'),
            'Database connection'
        )) results.passed++; else results.failed++;

    } else {
        testResult('Videos API route exists', false, 'File not found');
        results.failed++;
    }

    testResults.suites.push({ name: 'Database', ...results });
    return results;
}

// ============================================
// Run All Tests
// ============================================
async function runAllTests() {
    console.log(`${colors.cyan}${colors.bold}`);
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║         KINETIC - Feature Test Suite                      ║');
    console.log('║         Testing Wallet, World ID, NFT, and More           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`${colors.reset}`);

    const startTime = Date.now();

    // Run all test suites
    await testWalletFeatures();
    await testWorldIDFeatures();
    await testNFTMintingFeatures();
    await testStoryProtocolFeatures();
    await testIPFSFeatures();
    await testDatabaseFeatures();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Print summary
    console.log(`\n${colors.cyan}${colors.bold}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}  TEST RESULTS SUMMARY${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════════════════${colors.reset}\n`);

    // Suite breakdown
    console.log(`${colors.bold}Suite Results:${colors.reset}`);
    testResults.suites.forEach(suite => {
        const total = suite.passed + suite.failed;
        const percentage = total > 0 ? ((suite.passed / total) * 100).toFixed(0) : 0;
        const color = percentage >= 90 ? colors.green : percentage >= 70 ? colors.yellow : colors.red;
        console.log(`  ${color}${suite.name}: ${suite.passed}/${total} (${percentage}%)${colors.reset}`);
    });

    // Overall stats
    console.log(`\n${colors.bold}Overall:${colors.reset}`);
    console.log(`  Total Tests: ${testResults.total}`);
    console.log(`  ${colors.green}Passed: ${testResults.passed}${colors.reset}`);
    console.log(`  ${colors.red}Failed: ${testResults.failed}${colors.reset}`);
    if (testResults.warnings > 0) {
        console.log(`  ${colors.yellow}Warnings: ${testResults.warnings}${colors.reset}`);
    }

    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    const rateColor = passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red;
    console.log(`\n  ${colors.bold}Pass Rate: ${rateColor}${passRate}%${colors.reset}`);
    console.log(`  ${colors.gray}Duration: ${duration}s${colors.reset}`);

    // Status message
    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
    if (testResults.failed === 0) {
        console.log(`${colors.green}${colors.bold}✓ All tests passed! Features are properly configured.${colors.reset}`);
    } else if (passRate >= 80) {
        console.log(`${colors.yellow}${colors.bold}⚠ Most tests passed. Review failed tests above.${colors.reset}`);
    } else {
        console.log(`${colors.red}${colors.bold}✗ Multiple tests failed. Check configuration.${colors.reset}`);
    }
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    console.error(`${colors.red}Test suite error:${colors.reset}`, error);
    process.exit(1);
});
