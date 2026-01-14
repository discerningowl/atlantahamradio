#!/usr/bin/env node

/**
 * PDF to CHIRP CSV Converter
 *
 * Uses Gradient AI to convert PDF files containing frequency information
 * into CHIRP-compatible CSV files for radio programming.
 *
 * Usage:
 *   node scripts/pdf-to-chirp.js <input-pdf-path> [output-csv-path]
 *
 * Environment Variables (required):
 *   GRADIENT_AI_API_KEY - Your Gradient AI API key
 *   GRADIENT_AI_WORKSPACE_ID - Your workspace ID (if required)
 *   GRADIENT_AI_MODEL - Model name to use (if required)
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file (for local development)
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const [key, ...values] = trimmed.split('=');
                    if (key && values.length > 0) {
                        process.env[key.trim()] = values.join('=').trim();
                    }
                }
            });
            console.log('✓ Environment variables loaded from .env');
        }
    } catch (error) {
        console.warn('⚠ Could not load .env file:', error.message);
    }
}

// Validate required environment variables
function validateEnv() {
    const required = ['GRADIENT_AI_API_KEY'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ Error: Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        console.error('\nPlease ensure you have:');
        console.error('1. Created a .env file (copy from .env.example)');
        console.error('2. Added your Gradient AI credentials to .env');
        console.error('3. Or set the environment variables in your shell/CI');
        process.exit(1);
    }

    console.log('✓ Environment variables validated');
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
PDF to CHIRP CSV Converter

Usage:
  node scripts/pdf-to-chirp.js <input-pdf-path> [output-csv-path]

Arguments:
  input-pdf-path    Path to input PDF file containing frequency data
  output-csv-path   Optional: Path for output CSV file (default: same name as PDF)

Examples:
  node scripts/pdf-to-chirp.js frequencies.pdf
  node scripts/pdf-to-chirp.js input/frequencies.pdf output/channels.csv

Environment Variables (required):
  GRADIENT_AI_API_KEY         Your Gradient AI API key
  GRADIENT_AI_WORKSPACE_ID    Your workspace ID (if required)
  GRADIENT_AI_MODEL          Model name to use (if required)

Setup:
  1. Copy .env.example to .env
  2. Add your Gradient AI credentials to .env
  3. See GRADIENT_SETUP.md for detailed instructions
        `);
        process.exit(0);
    }

    const inputPath = args[0];
    let outputPath = args[1];

    if (!outputPath) {
        const parsed = path.parse(inputPath);
        outputPath = path.join(parsed.dir, `${parsed.name}.csv`);
    }

    return { inputPath, outputPath };
}

// Main conversion function (placeholder)
async function convertPdfToChirp(inputPath, outputPath) {
    console.log('\n📄 PDF to CHIRP CSV Converter');
    console.log('================================\n');

    // Validate input file exists
    if (!fs.existsSync(inputPath)) {
        console.error(`❌ Error: Input file not found: ${inputPath}`);
        process.exit(1);
    }

    console.log(`Input:  ${inputPath}`);
    console.log(`Output: ${outputPath}\n`);

    // TODO: Implement Gradient AI integration
    console.log('🔄 Converting PDF to CHIRP CSV...');
    console.log('⚠  Note: Gradient AI integration not yet implemented');

    // Placeholder for actual implementation
    const apiKey = process.env.GRADIENT_AI_API_KEY;
    const workspaceId = process.env.GRADIENT_AI_WORKSPACE_ID || 'default';
    const model = process.env.GRADIENT_AI_MODEL || 'default';

    console.log(`\n🔧 Configuration:`);
    console.log(`   API Key: ${apiKey ? '***' + apiKey.slice(-4) : 'NOT SET'}`);
    console.log(`   Workspace: ${workspaceId}`);
    console.log(`   Model: ${model}\n`);

    // Steps for implementation:
    // 1. Read PDF file
    // 2. Send to Gradient AI API for processing
    // 3. Parse response
    // 4. Format as CHIRP CSV
    // 5. Write output file

    console.log('✅ Script structure ready');
    console.log('\n📝 Next steps:');
    console.log('   1. Implement Gradient AI API client');
    console.log('   2. Add PDF processing logic');
    console.log('   3. Add CHIRP CSV formatting');
    console.log('   4. Add error handling and retries');
}

// Main execution
async function main() {
    try {
        // Check for help flag first (before loading env)
        if (process.argv.includes('--help') || process.argv.includes('-h') || process.argv.length === 2) {
            parseArgs(); // This will show help and exit
            return;
        }

        loadEnv();
        validateEnv();
        const { inputPath, outputPath } = parseArgs();
        await convertPdfToChirp(inputPath, outputPath);
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { convertPdfToChirp };
