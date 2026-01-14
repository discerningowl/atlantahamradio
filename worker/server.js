/**
 * ICS-205 to CHIRP CSV Converter - Worker Service
 *
 * HTTP API server for converting ICS-205 Radio Communications Plan PDFs
 * to CHIRP-compatible CSV files using Gradient AI.
 *
 * Note: This service is routed under /api/ics205 in DigitalOcean
 *
 * Public Endpoints (via atlantahamradio.org):
 *   POST /api/ics205/convert - Convert ICS-205 PDF to CHIRP CSV
 *   GET  /api/ics205/health  - Health check endpoint
 *
 * Internal Routes (in this Express app):
 *   POST /convert - Convert ICS-205 PDF to CHIRP CSV
 *   GET  /health  - Health check endpoint
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { convertICS205ToChirp } = require('./ics205-parser');
const pdfParse = require('pdf-parse');

// Load environment variables (for local development)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration
const ALLOWED_ORIGINS = [
    'https://atlantahamradio.org',
    'https://www.atlantahamradio.org',
    'http://localhost:8000',
    'http://localhost:3000',
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
});

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
        timestamp,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    }));
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ics205-parser-worker',
        version: '1.0.0',
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'ICS-205 to CHIRP CSV Converter',
        version: '1.0.0',
        endpoints: {
            'POST /convert': 'Convert ICS-205 PDF to CHIRP CSV',
            'POST /debug-text': 'Debug: Extract text from PDF (no parsing)',
            'GET /health': 'Health check',
        },
        documentation: 'https://github.com/discerningowl/atlantahamradio',
    });
});

// Debug endpoint: Extract text from PDF without parsing
app.post('/debug-text', upload.single('pdf'), async (req, res) => {
    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No PDF file uploaded.',
            });
        }

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            event: 'debug_text_extraction',
            filename: req.file.originalname,
            fileSize: req.file.size,
        }));

        // Extract text from PDF
        const data = await pdfParse(req.file.buffer);

        // Return extracted text and metadata
        res.json({
            success: true,
            filename: req.file.originalname,
            pages: data.numpages,
            textLength: data.text.length,
            text: data.text,
            info: data.info || {},
        });

    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            event: 'debug_text_extraction_failed',
            filename: req.file?.originalname || 'unknown',
            error: error.message,
        }));

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to extract text from PDF',
        });
    }
});

// Convert ICS-205 PDF to CHIRP CSV
app.post('/convert', upload.single('pdf'), async (req, res) => {
    const startTime = Date.now();

    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No PDF file uploaded. Please upload an ICS-205 PDF file.',
            });
        }

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            event: 'conversion_started',
            filename: req.file.originalname,
            fileSize: req.file.size,
        }));

        // Convert PDF to CHIRP CSV using Gradient AI
        const result = await convertICS205ToChirp(req.file.buffer, {
            filename: req.file.originalname,
        });

        const duration = Date.now() - startTime;

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            event: 'conversion_completed',
            filename: req.file.originalname,
            duration,
            channelCount: result.channelCount,
        }));

        // Return CSV result
        res.json({
            success: true,
            csv: result.csv,
            filename: result.filename,
            channelCount: result.channelCount,
            duration,
        });

    } catch (error) {
        const duration = Date.now() - startTime;

        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            event: 'conversion_failed',
            filename: req.file?.originalname || 'unknown',
            duration,
            error: error.message,
            stack: error.stack,
        }));

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to convert PDF',
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'error',
        error: err.message,
        stack: err.stack,
    }));

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            error: 'CORS policy: Origin not allowed',
        });
    }

    if (err.message === 'Only PDF files are allowed') {
        return res.status(400).json({
            success: false,
            error: 'Invalid file type. Please upload a PDF file.',
        });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            error: 'File too large. Maximum size is 10MB.',
        });
    }

    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'server_started',
        port: PORT,
        env: process.env.NODE_ENV || 'development',
    }));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'server_shutdown',
        signal: 'SIGTERM',
    }));
    process.exit(0);
});
