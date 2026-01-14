/**
 * ICS-205 Parser with Gradient AI
 *
 * Uses Gradient AI to intelligently extract frequency data from ICS-205
 * Radio Communications Plan PDFs and convert to CHIRP CSV format.
 */

const pdfParse = require('pdf-parse');
const { Gradient } = require('@gradientai/nodejs-sdk');

/**
 * Convert ICS-205 PDF to CHIRP CSV format
 *
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {Object} options - Conversion options
 * @param {string} options.filename - Original filename
 * @returns {Promise<Object>} Result object with CSV data
 */
async function convertICS205ToChirp(pdfBuffer, options = {}) {
    const { filename = 'ics205.pdf' } = options;

    // Validate environment variables
    validateEnvironment();

    try {
        // Step 1: Extract text from PDF
        console.log('Extracting text from PDF...');
        const extractedText = await extractTextFromPDF(pdfBuffer);

        // Step 2: Parse ICS-205 frequency data using AI
        console.log('Parsing ICS-205 frequency data with Gradient AI...');
        const frequencyData = await parseICS205WithAI(extractedText);

        // Step 3: Convert to CHIRP CSV format
        console.log('Converting to CHIRP CSV format...');
        const csv = convertToChirpCSV(frequencyData);

        // Step 4: Generate output filename
        const outputFilename = filename.replace(/\.pdf$/i, '-channels.csv');

        return {
            success: true,
            csv,
            filename: outputFilename,
            channelCount: frequencyData.length,
        };

    } catch (error) {
        console.error('ICS-205 conversion error:', error);
        throw new Error(`Failed to convert ICS-205: ${error.message}`);
    }
}

/**
 * Validate required environment variables
 */
function validateEnvironment() {
    const required = ['GRADIENT_AI_API_KEY'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

/**
 * Extract text from PDF using pdf-parse
 *
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(pdfBuffer) {
    try {
        const data = await pdfParse(pdfBuffer);

        console.log(`PDF parsed: ${data.numpages} pages, ${data.text.length} characters`);

        // Debug: Log first 500 characters of extracted text
        if (data.text && data.text.length > 0) {
            console.log('--- Extracted Text Preview (first 500 chars) ---');
            console.log(data.text.substring(0, 500));
            console.log('--- End Preview ---');
        }

        if (!data.text || data.text.trim().length === 0) {
            throw new Error('PDF contains no extractable text. It may be an image-based PDF that requires OCR.');
        }

        return data.text;

    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

/**
 * Parse ICS-205 frequency data using Gradient AI
 *
 * Uses Gradient AI to intelligently extract structured frequency data
 * from the extracted text.
 *
 * @param {string} text - Extracted text from PDF
 * @returns {Promise<Array>} Array of frequency objects
 */
async function parseICS205WithAI(text) {
    try {
        const apiKey = process.env.GRADIENT_AI_API_KEY;
        const workspaceId = process.env.GRADIENT_AI_WORKSPACE_ID;

        // Initialize Gradient AI client
        const gradient = new Gradient({ accessToken: apiKey, workspaceId });

        // Prepare the prompt for structured extraction
        const prompt = `You are an expert at parsing ICS-205 Radio Communications Plan forms. Extract all frequency information from the following text and return ONLY a valid JSON array.

For each frequency/channel entry, extract:
- name: Channel name or assignment (string)
- rxFreq: Receive frequency in MHz (string, e.g., "146.520")
- txFreq: Transmit frequency in MHz (string, e.g., "146.520", same as rxFreq if simplex)
- tone: CTCSS/PL tone frequency (string, e.g., "100.0", or null if none)
- mode: Radio mode (string, "FM", "NFM", "AM", etc., default to "FM")
- remarks: Any notes or function description (string, or null)

Return ONLY a JSON array with this exact structure, no additional text:
[
  {
    "name": "Channel Name",
    "rxFreq": "146.520",
    "txFreq": "146.520",
    "tone": "100.0",
    "mode": "FM",
    "remarks": "Simplex"
  }
]

If no frequencies are found, return an empty array: []

ICS-205 Text:
${text}

JSON Array:`;

        // Get model (use specified model or default)
        const modelName = process.env.GRADIENT_AI_MODEL || 'nous-hermes-2-mixtral-8x7b-dpo';
        const model = await gradient.getModel({ modelId: modelName });

        // Generate completion
        const response = await model.completeModel({
            prompt: prompt,
            maxGeneratedTokenCount: 2000,
            temperature: 0.1, // Low temperature for structured output
        });

        const completion = response.generatedOutput;
        console.log('AI Response:', completion.substring(0, 200) + '...');

        // Extract JSON from response (handle cases where AI adds extra text)
        let jsonMatch = completion.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.warn('No JSON array found in AI response, attempting fallback parsing...');
            return fallbackParsing(text);
        }

        const frequencies = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(frequencies)) {
            throw new Error('AI response is not an array');
        }

        console.log(`Parsed ${frequencies.length} frequencies from ICS-205`);

        return frequencies;

    } catch (error) {
        console.error('AI parsing error:', error);
        console.log('Attempting fallback parsing...');

        // Fallback to regex-based parsing if AI fails
        return fallbackParsing(text);
    }
}

/**
 * Fallback parsing using regex patterns
 * Used when AI parsing fails
 *
 * @param {string} text - Extracted text from PDF
 * @returns {Array} Array of frequency objects
 */
function fallbackParsing(text) {
    console.log('Using fallback regex-based parsing...');

    const frequencies = [];
    const lines = text.split('\n');

    // Enhanced regex patterns for various frequency formats
    // Matches: 146.520, 146.52, 440.1234, 1467.5250, etc.
    const freqPattern = /\b(\d{2,4}\.\d{1,4})\b/g;

    // Tone pattern: matches 100.0, 88.5, etc.
    const tonePattern = /\b(\d{2,3}\.\d{1})\b/g;

    // Track potential frequencies for debugging
    let linesWithFrequencies = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines and common headers
        if (!line || line.length < 5) continue;
        if (line.toLowerCase().includes('frequency') && line.toLowerCase().includes('channel')) continue;
        if (line.toLowerCase().includes('radio communications plan')) continue;

        // Look for frequency patterns
        const freqMatches = line.match(freqPattern);
        if (freqMatches && freqMatches.length >= 1) {
            // Filter out frequencies that are likely not radio frequencies
            // Radio frequencies are typically in ranges:
            // VHF: 30-300 MHz, UHF: 300-3000 MHz
            const validFreqs = freqMatches.filter(freq => {
                const num = parseFloat(freq);
                return num >= 30 && num <= 3000;
            });

            if (validFreqs.length === 0) continue;

            linesWithFrequencies++;
            const rxFreq = validFreqs[0];
            const txFreq = validFreqs.length >= 2 ? validFreqs[1] : rxFreq;

            // Extract tone if present (but not if it's a frequency)
            const toneMatches = line.match(tonePattern);
            let tone = null;
            if (toneMatches) {
                // Tones are typically 67-254.1 Hz
                const toneNum = parseFloat(toneMatches[0]);
                if (toneNum >= 67 && toneNum <= 254.1) {
                    tone = toneMatches[0];
                }
            }

            // Try to extract channel name (usually at beginning of line)
            let name = line.substring(0, 30).split(/\s{2,}/)[0].trim();
            // Remove leading numbers/special chars if present
            name = name.replace(/^[\d\s\.\-]+/, '').trim();
            if (!name || name.length < 2) {
                name = `Channel ${frequencies.length + 1}`;
            }

            console.log(`Found frequency on line ${i + 1}: ${rxFreq} MHz (${name})`);

            frequencies.push({
                name: name,
                rxFreq: rxFreq,
                txFreq: txFreq,
                tone: tone,
                mode: 'FM',
                remarks: line.length > 50 ? line.substring(50, 100).trim() : null,
            });
        }
    }

    console.log(`Processed ${lines.length} lines, found ${linesWithFrequencies} lines with frequencies`);

    if (frequencies.length === 0) {
        // More helpful error message with debugging info
        console.error('=== DEBUGGING INFO ===');
        console.error(`Total lines processed: ${lines.length}`);
        console.error(`Lines with frequency patterns: ${linesWithFrequencies}`);
        console.error('First 1000 characters of text:');
        console.error(text.substring(0, 1000));
        console.error('=== END DEBUGGING INFO ===');

        throw new Error('No frequencies found in PDF. Possible issues: (1) PDF is image-based and needs OCR, (2) Frequencies are in an unsupported format, (3) File is not a valid ICS-205 form. Check server logs for extracted text.');
    }

    console.log(`Fallback parsing found ${frequencies.length} frequencies`);
    return frequencies;
}

/**
 * Convert frequency data to CHIRP CSV format
 *
 * @param {Array} frequencies - Array of frequency objects
 * @returns {string} CHIRP-compatible CSV
 */
function convertToChirpCSV(frequencies) {
    // CHIRP CSV header
    const header = [
        'Location',      // Memory location number
        'Name',          // Channel name
        'Frequency',     // RX frequency
        'Duplex',        // Duplex mode (+, -, off)
        'Offset',        // Frequency offset
        'Tone',          // Tone mode (Tone, TSQL, DTCS)
        'rToneFreq',     // Repeater tone frequency
        'cToneFreq',     // CTCSS tone frequency
        'DtcsCode',      // DTCS code
        'DtcsPolarity',  // DTCS polarity
        'Mode',          // Mode (FM, NFM, AM)
        'TStep',         // Tuning step
        'Skip',          // Skip setting
        'Comment',       // Comment/remarks
    ].join(',');

    // Convert each frequency to CHIRP format
    const rows = frequencies.map((freq, index) => {
        const location = index;
        const name = (freq.name || `Channel ${index + 1}`).substring(0, 16); // CHIRP name limit
        const rxFreq = parseFloat(freq.rxFreq || '0');
        const txFreq = parseFloat(freq.txFreq || freq.rxFreq || '0');

        // Calculate duplex and offset
        let duplex = '';
        let offset = '0.000000';
        if (rxFreq !== txFreq) {
            const diff = txFreq - rxFreq;
            if (diff > 0) {
                duplex = '+';
                offset = Math.abs(diff).toFixed(6);
            } else if (diff < 0) {
                duplex = '-';
                offset = Math.abs(diff).toFixed(6);
            }
        }

        // Tone settings
        const tone = freq.tone ? 'Tone' : '';
        const rToneFreq = freq.tone || '88.5';
        const cToneFreq = freq.tone || '88.5';

        // Mode
        const mode = freq.mode || 'FM';

        // Comment
        const comment = (freq.remarks || '').replace(/,/g, ';').substring(0, 256); // Remove commas for CSV

        return [
            location,
            name,
            rxFreq.toFixed(6),
            duplex,
            offset,
            tone,
            rToneFreq,
            cToneFreq,
            '023',        // Default DTCS code
            'NN',         // Default DTCS polarity
            mode,
            '5.00',       // Default tuning step
            '',           // Skip
            comment,
        ].join(',');
    });

    // Combine header and rows
    return [header, ...rows].join('\n');
}

module.exports = {
    convertICS205ToChirp,
};
