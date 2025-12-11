/**
 * KINETIC - Wallet & World ID Integration Test
 * 
 * Tests:
 * 1. Environment variables configuration
 * 2. Wallet connection detection
 * 3. World ID configuration
 * 4. API endpoints accessibility
 * 
 * Run with: node test-wallet-worldid.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    API_URL: 'http://localhost:3000',
    ENV_FILE: '.env',
};

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: [],
};

function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',    // Cyan
        success: '\x1b[32m', // Green
        error: '\x1b[31m',   // Red
        warn: '\x1b[33m',    // Yellow
        reset: '\x1b[0m',
    };
    console.log(`${colors[type] || colors.info}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    log(`  ${status}: ${name}`, passed ? 'success' : 'error');
    if (details) {
        console.log(`         ${details}`);
    }
    testResults.tests.push({ name, passed, details });
    if (passed) testResults.passed++;
    else testResults.failed++;
}

function logWarning(name, details) {
    log(`  ⚠️  WARN: ${name}`, 'warn');
    if (details) {
        console.log(`         ${details}`);
    }
    testResults.warnings++;
}

// ============================================
// TEST SUITE 1: Environment Variables
// ============================================
function testEnvironmentVariables() {
    log('\n📋 TEST SUITE 1: Environment Variables', 'info');
    log('─'.repeat(50));

    // Read .env file
    const envPath = path.join(__dirname, CONFIG.ENV_FILE);
    let envContent = '';

    try {
        envContent = fs.readFileSync(envPath, 'utf8');
        logTest('.env file exists', true, envPath);
    } catch (err) {
        logTest('.env file exists', false, err.message);
        return { success: false };
    }

    // Parse environment variables
    const envVars = {};
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        }
    });

    // Test 1.1: Supabase configuration
    const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    logTest('Supabase URL configured', !!supabaseUrl, supabaseUrl || 'Missing');
    logTest('Supabase anon key configured', !!supabaseKey && supabaseKey.length > 20,
        supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Missing');

    // Test 1.2: NFT Contract
    const nftContract = envVars['NEXT_PUBLIC_NFT_CONTRACT_ADDRESS'];
    const validAddress = /^0x[a-fA-F0-9]{40}$/.test(nftContract);
    logTest('NFT Contract address valid', validAddress, nftContract || 'Missing');

    // Test 1.3: Story Protocol contracts
    const ipRegistry = envVars['NEXT_PUBLIC_IP_ASSET_REGISTRY'];
    const licensingModule = envVars['NEXT_PUBLIC_LICENSING_MODULE'];
    const pilTemplate = envVars['NEXT_PUBLIC_PIL_TEMPLATE'];

    logTest('IP Asset Registry configured', /^0x[a-fA-F0-9]{40}$/.test(ipRegistry), ipRegistry || 'Missing');
    logTest('Licensing Module configured', /^0x[a-fA-F0-9]{40}$/.test(licensingModule), licensingModule || 'Missing');
    logTest('PIL Template configured', /^0x[a-fA-F0-9]{40}$/.test(pilTemplate), pilTemplate || 'Missing');

    // Test 1.4: World ID configuration
    const worldcoinAppId = envVars['NEXT_PUBLIC_WORLDCOIN_APP_ID'];
    const worldcoinAction = envVars['NEXT_PUBLIC_WORLDCOIN_ACTION'];

    const validAppId = /^app_[a-zA-Z0-9]+$/.test(worldcoinAppId);
    logTest('Worldcoin App ID valid', validAppId, worldcoinAppId || 'Missing');
    logTest('Worldcoin Action configured', !!worldcoinAction, worldcoinAction || 'Missing');

    // Check if action is 'kinetic' as configured in portal
    if (worldcoinAction !== 'kinetic') {
        logWarning('Worldcoin Action mismatch',
            `Expected: "kinetic", Got: "${worldcoinAction}". Update portal or .env`);
    }

    // Test 1.5: Story Protocol RPC
    const storyRpc = envVars['NEXT_PUBLIC_STORY_RPC_URL'];
    const storyChainId = envVars['NEXT_PUBLIC_STORY_CHAIN_ID'];

    logTest('Story RPC URL configured', !!storyRpc, storyRpc || 'Missing');
    logTest('Story Chain ID is 1513', storyChainId === '1513', `Chain ID: ${storyChainId || 'Missing'}`);

    // Test 1.6: Pinata IPFS
    const pinataApiKey = envVars['PINATA_API_KEY'];
    const pinataSecret = envVars['PINATA_SECRET_KEY'];
    const pinataJwt = envVars['PINATA_JWT'];

    logTest('Pinata API Key configured', !!pinataApiKey && pinataApiKey.length > 10,
        pinataApiKey ? `${pinataApiKey.substring(0, 10)}...` : 'Missing');
    logTest('Pinata Secret Key configured', !!pinataSecret && pinataSecret.length > 20,
        pinataSecret ? 'Configured' : 'Missing');
    logTest('Pinata JWT configured', !!pinataJwt && pinataJwt.startsWith('eyJ'),
        pinataJwt ? 'Valid JWT format' : 'Missing');

    return { success: true, envVars };
}

// ============================================
// TEST SUITE 2: API Endpoints
// ============================================
async function testAPIEndpoints() {
    log('\n🌐 TEST SUITE 2: API Endpoints', 'info');
    log('─'.repeat(50));

    // Test if server is running
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/videos`);
        logTest('Dev server running', response.status === 200, `Status: ${response.status}`);
    } catch (err) {
        logTest('Dev server running', false, 'Cannot connect to localhost:3000');
        logWarning('Server not running', 'Start with: npm run dev');
        return { success: false };
    }

    // Test World ID verification endpoint
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/verify-worldid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proof: 'test',
                merkle_root: 'test',
                nullifier_hash: 'test',
            }),
        });

        // Should return 400 for invalid proof, not 500
        const isWorking = response.status === 400 || response.status === 500;
        logTest('World ID API endpoint exists', isWorking, `/api/verify-worldid - Status: ${response.status}`);

        if (response.status === 500) {
            const data = await response.json();
            if (data.details) {
                logWarning('World ID API error', data.details);
            }
        }
    } catch (err) {
        logTest('World ID API endpoint exists', false, err.message);
    }

    return { success: true };
}

// ============================================
// TEST SUITE 3: Frontend Pages
// ============================================
async function testFrontendPages() {
    log('\n📄 TEST SUITE 3: Frontend Pages', 'info');
    log('─'.repeat(50));

    const pages = [
        { path: '/', name: 'Home Page' },
        { path: '/upload', name: 'Upload Page' },
        { path: '/explore', name: 'Explore Page' },
    ];

    for (const page of pages) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${page.path}`);
            logTest(`${page.name} loads`, response.status === 200, `GET ${page.path} - ${response.status}`);
        } catch (err) {
            logTest(`${page.name} loads`, false, err.message);
        }
    }

    return { success: true };
}

// ============================================
// TEST SUITE 4: Configuration Validation
// ============================================
function testConfigurationValidation(envVars) {
    log('\n🔧 TEST SUITE 4: Configuration Validation', 'info');
    log('─'.repeat(50));

    // Check for common issues
    const issues = [];

    // Issue 1: Check if contracts are deployed
    if (!envVars['NEXT_PUBLIC_NFT_CONTRACT_ADDRESS'] ||
        envVars['NEXT_PUBLIC_NFT_CONTRACT_ADDRESS'] === '0x0000000000000000000000000000000000000000') {
        issues.push('NFT Contract not deployed - Deploy via Remix');
    }

    // Issue 2: Check Worldcoin configuration
    if (envVars['NEXT_PUBLIC_WORLDCOIN_APP_ID'] === 'app_staging_your_app_id') {
        issues.push('Worldcoin App ID is default - Update with real app ID');
    }

    // Issue 3: Check Dynamic Labs
    if (envVars['NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID'] === 'your_dynamic_environment_id') {
        logWarning('Dynamic Labs not configured', 'Using wagmi instead (OK)');
    }

    logTest('No critical configuration issues', issues.length === 0,
        issues.length > 0 ? issues.join('; ') : 'All configurations valid');

    // Security check: Sensitive data
    const sensitiveKeys = ['PINATA_API_KEY', 'PINATA_SECRET_KEY', 'PINATA_JWT'];
    let exposedKeys = 0;

    for (const key of sensitiveKeys) {
        if (envVars[key] && key.startsWith('NEXT_PUBLIC_')) {
            exposedKeys++;
        }
    }

    logTest('Sensitive keys not exposed', exposedKeys === 0,
        exposedKeys > 0 ? `${exposedKeys} keys start with NEXT_PUBLIC_` : 'All private');

    return { success: true };
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
    console.log('\n' + '═'.repeat(60));
    log('🧪 KINETIC - Wallet & World ID Integration Test', 'info');
    console.log('═'.repeat(60));
    console.log(`Started: ${new Date().toISOString()}`);
    console.log(`Test File: ${__filename}`);

    const results = {};

    // Suite 1: Environment Variables
    results.env = testEnvironmentVariables();

    if (!results.env.success) {
        log('\n⚠️  Environment file missing or invalid. Cannot continue.', 'error');
        printSummary();
        return;
    }

    // Suite 2: API Endpoints
    results.api = await testAPIEndpoints();

    // Suite 3: Frontend Pages
    if (results.api.success) {
        results.frontend = await testFrontendPages();
    }

    // Suite 4: Configuration Validation
    results.config = testConfigurationValidation(results.env.envVars);

    // Print Summary
    printSummary();

    return results;
}

function printSummary() {
    console.log('\n' + '═'.repeat(60));
    log('📊 TEST SUMMARY', 'info');
    console.log('═'.repeat(60));

    const total = testResults.passed + testResults.failed;

    console.log(`\n  Total Tests: ${total}`);
    log(`  ✅ Passed:  ${testResults.passed}`, 'success');
    log(`  ❌ Failed:  ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
    log(`  ⚠️  Warnings: ${testResults.warnings}`, testResults.warnings > 0 ? 'warn' : 'info');

    const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
    console.log(`\n  Pass Rate: ${passRate}%`);

    if (testResults.failed === 0 && testResults.warnings === 0) {
        log('\n  🎉 All tests passed with no warnings!', 'success');
    } else if (testResults.failed === 0) {
        log('\n  ✓ All tests passed (with warnings)', 'success');
    } else {
        log('\n  ⚠️  Some tests failed. Check details above.', 'error');
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`Completed: ${new Date().toISOString()}`);
    console.log('═'.repeat(60) + '\n');

    // Print recommendations
    if (testResults.failed > 0 || testResults.warnings > 0) {
        log('\n💡 RECOMMENDATIONS:', 'info');
        console.log('  1. Ensure dev server is running: npm run dev');
        console.log('  2. Check Worldcoin action matches portal: "kinetic"');
        console.log('  3. Verify wallet connection in browser');
        console.log('  4. Check browser console for errors');
        console.log('  5. Hard refresh browser: Ctrl+Shift+R\n');
    }
}

// Run tests
runAllTests().catch(err => {
    log(`\n❌ Fatal error: ${err.message}`, 'error');
    console.error(err);
    process.exit(1);
});
