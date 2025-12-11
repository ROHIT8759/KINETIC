/**
 * Test World ID Orb Verification
 * This test checks if the World ID verification flow is properly configured
 */

const chalk = require('chalk');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env' });

const tests = {
    passed: 0,
    failed: 0,
    total: 0
};

function testResult(name, passed, details = '') {
    tests.total++;
    if (passed) {
        tests.passed++;
        console.log(chalk.green('✓'), name);
        if (details) console.log(chalk.gray('  └─'), details);
    } else {
        tests.failed++;
        console.log(chalk.red('✗'), name);
        if (details) console.log(chalk.gray('  └─'), details);
    }
}

async function testWorldIDConfiguration() {
    console.log(chalk.cyan('\n🧪 Testing World ID Orb Verification Configuration\n'));

    // Test 1: Check environment variables
    const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID;
    const action = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION;
    
    testResult(
        'World ID App ID configured',
        !!appId && appId.startsWith('app_'),
        appId ? `App ID: ${appId}` : 'Missing NEXT_PUBLIC_WORLDCOIN_APP_ID'
    );

    testResult(
        'World ID Action configured',
        !!action,
        action ? `Action: ${action}` : 'Missing NEXT_PUBLIC_WORLDCOIN_ACTION'
    );

    // Test 2: Verify action identifier format
    testResult(
        'Action identifier format is valid',
        action && action.length > 0 && !action.includes(' '),
        action ? `Action: "${action}"` : 'Invalid action format'
    );

    // Test 3: Check if verification endpoint exists
    console.log(chalk.gray('\n  Testing verification endpoint...'));
    
    try {
        const response = await fetch('http://localhost:3000/api/verify-worldid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proof: 'test',
                merkle_root: 'test',
                nullifier_hash: 'test',
                verification_level: 'orb'
            })
        });

        const data = await response.json();
        
        testResult(
            'Verification API endpoint is accessible',
            response.status === 400, // Should return 400 for invalid proof (not 500 or 404)
            `Status: ${response.status} - ${data.error || data.details}`
        );
        
        testResult(
            'API validates required fields',
            data.error && (data.error.includes('Verification failed') || data.error.includes('Missing')),
            `Error message: ${data.error}`
        );
    } catch (error) {
        testResult(
            'Verification API endpoint is accessible',
            false,
            `Error: ${error.message}. Make sure dev server is running at http://localhost:3000`
        );
    }

    // Test 4: Check World ID widget configuration in component
    console.log(chalk.gray('\n  Checking component configuration...'));
    
    const fs = require('fs');
    const componentPath = './src/components/upload/WorldIDVerify.tsx';
    
    if (fs.existsSync(componentPath)) {
        const componentContent = fs.readFileSync(componentPath, 'utf8');
        
        testResult(
            'Component uses VerificationLevel.Orb',
            componentContent.includes('VerificationLevel.Orb'),
            'Orb verification level is set'
        );
        
        testResult(
            'Component uses handleVerify pattern',
            componentContent.includes('handleVerify={handleVerify}'),
            'Server-side verification pattern implemented'
        );
        
        testResult(
            'Component has error handling',
            componentContent.includes('onError={handleVerifyError}'),
            'Error handling configured'
        );
        
        testResult(
            'Component uses correct app_id format',
            componentContent.includes('app_id={WORLDCOIN_APP_ID as `app_${string}`}'),
            'Type-safe app_id configuration'
        );
    } else {
        testResult(
            'WorldIDVerify component exists',
            false,
            'Component file not found'
        );
    }

    // Test 5: Verify API route implementation
    const apiPath = './src/app/api/verify-worldid/route.ts';
    
    if (fs.existsSync(apiPath)) {
        const apiContent = fs.readFileSync(apiPath, 'utf8');
        
        testResult(
            'API calls Worldcoin verification endpoint',
            apiContent.includes('https://developer.worldcoin.org/api/v1/verify/'),
            'Worldcoin API integration present'
        );
        
        testResult(
            'API validates proof fields',
            apiContent.includes('proof') && apiContent.includes('merkle_root') && apiContent.includes('nullifier_hash'),
            'All required proof fields validated'
        );
        
        testResult(
            'API checks verification success',
            apiContent.includes('verifyData.success'),
            'Success validation implemented'
        );
        
        testResult(
            'API handles verification_level',
            apiContent.includes('verification_level'),
            'Verification level parameter handled'
        );
    } else {
        testResult(
            'World ID API route exists',
            false,
            'API route file not found'
        );
    }

    // Test 6: Check TypeScript types
    const typesPath = './src/types/index.ts';
    
    if (fs.existsSync(typesPath)) {
        const typesContent = fs.readFileSync(typesPath, 'utf8');
        
        testResult(
            'WorldIDProof type includes orb level',
            typesContent.includes('"orb"'),
            'TypeScript types support orb verification'
        );
        
        testResult(
            'WorldIDProof type is properly structured',
            typesContent.includes('merkle_root') && 
            typesContent.includes('nullifier_hash') && 
            typesContent.includes('proof'),
            'All required proof fields in type definition'
        );
    }

    // Summary
    console.log(chalk.cyan('\n' + '='.repeat(50)));
    console.log(chalk.cyan('Test Results Summary:'));
    console.log(chalk.cyan('='.repeat(50)));
    console.log(`Total Tests: ${tests.total}`);
    console.log(chalk.green(`Passed: ${tests.passed}`));
    if (tests.failed > 0) {
        console.log(chalk.red(`Failed: ${tests.failed}`));
    }
    console.log(chalk.cyan('Pass Rate: ') + 
        (tests.passed === tests.total ? chalk.green : chalk.yellow)
        (`${((tests.passed / tests.total) * 100).toFixed(1)}%`));
    
    console.log(chalk.cyan('\n' + '='.repeat(50)));
    console.log(chalk.cyan('World ID Orb Verification Status:'));
    console.log(chalk.cyan('='.repeat(50)));
    
    if (tests.passed === tests.total) {
        console.log(chalk.green('✓ All checks passed! World ID Orb verification is properly configured.'));
        console.log(chalk.white('\n📱 To test:'));
        console.log(chalk.white('   1. Open http://localhost:3000/upload in browser'));
        console.log(chalk.white('   2. Click "Verify with World ID" button'));
        console.log(chalk.white('   3. Scan QR code with World ID app'));
        console.log(chalk.white('   4. Complete verification (requires Orb-verified account)'));
        console.log(chalk.yellow('\n⚠️  Note: Orb verification requires a physical Orb device scan'));
        console.log(chalk.gray('   If you haven\'t been verified at an Orb, you can:'));
        console.log(chalk.gray('   - Use the [DEV] Mock Verification button for testing'));
        console.log(chalk.gray('   - Change to VerificationLevel.Device for app-only verification'));
    } else {
        console.log(chalk.yellow('⚠️  Some checks failed. Review the issues above.'));
    }
    
    console.log(chalk.cyan('\n' + '='.repeat(50) + '\n'));
    
    process.exit(tests.failed > 0 ? 1 : 0);
}

testWorldIDConfiguration().catch(error => {
    console.error(chalk.red('\n❌ Test suite error:'), error);
    process.exit(1);
});
