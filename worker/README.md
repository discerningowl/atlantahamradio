# ICS-205 Parser Worker

AI-powered worker service for converting ICS-205 Radio Communications Plan PDFs to CHIRP CSV format.

## Overview

This worker service runs on DigitalOcean App Platform and provides an HTTP API for converting ICS-205 PDFs to CHIRP-compatible CSV files using Gradient AI.

## Files

- **`server.js`** - Express HTTP server with API endpoints
- **`ics205-parser.js`** - ICS-205 parsing logic with Gradient AI integration
- **`package.json`** - Node.js dependencies
- **`.node-version`** - Node.js version specification (20)

## API Endpoints

### `POST /api/ics205/convert`

Convert ICS-205 PDF to CHIRP CSV format.

**Request:**
- Content-Type: `multipart/form-data`
- Body: PDF file in `pdf` field
- Max file size: 10MB

**Response (Success):**
```json
{
  "success": true,
  "csv": "Location,Name,Frequency,...\n0,Channel 1,146.520,...",
  "filename": "ics205-channels.csv",
  "channelCount": 25,
  "duration": 1234
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

### `GET /health`

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-14T12:00:00Z",
  "service": "ics205-parser-worker",
  "version": "1.0.0"
}
```

## Local Development

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Gradient AI API key

### Setup

1. **Install dependencies:**
   ```bash
   cd worker
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy .env.example to .env in project root
   cp ../.env.example ../.env

   # Edit ../.env and add your Gradient AI credentials
   nano ../.env
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

   Or with auto-reload during development:
   ```bash
   npm run dev
   ```

4. **Test the health endpoint:**
   ```bash
   curl http://localhost:8080/health
   ```

### Testing PDF Conversion

```bash
curl -X POST http://localhost:8080/api/ics205/convert \
  -F "pdf=@path/to/ics205.pdf" \
  -o output.csv
```

## Environment Variables

### AI Provider Configuration

The worker supports multiple AI providers with automatic fallback:

**Primary (Recommended):**
- `OPENAI_API_KEY` - Your OpenAI API key (supports PDF with OCR)
  - Get from: https://platform.openai.com/api-keys
  - Model used: gpt-4o
  - Features: Direct PDF processing, built-in OCR for scanned documents

**Fallback:**
- `GRADIENT_AI_API_KEY` - Your Gradient AI API key
- `GRADIENT_AI_WORKSPACE_ID` - Your Gradient AI workspace ID
- `GRADIENT_AI_MODEL` - Model name to use for parsing

**Note:** At least one AI provider must be configured. If both are configured, OpenAI will be used first (recommended for best results with image-based PDFs).

**Other Settings:**
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (development/production)

## Deployment

This service is deployed to DigitalOcean App Platform via `.do/app.yaml`.

### Deploy Process

1. Commit changes to `main` branch
2. Push to GitHub: `git push origin main`
3. DigitalOcean automatically deploys

### Monitoring

View logs:
```bash
doctl apps logs YOUR_APP_ID --type run --follow
```

## Processing Flow

The worker uses a multi-tiered approach for maximum reliability:

### Tier 1: OpenAI Direct PDF Processing (Primary)
- **Method:** OpenAI GPT-4o with vision
- **Input:** Raw PDF buffer (base64 encoded)
- **Features:**
  - ✅ Handles text-based PDFs
  - ✅ Handles image-based PDFs (OCR)
  - ✅ Handles scanned documents
  - ✅ Best accuracy for frequency extraction
- **Used when:** `OPENAI_API_KEY` is configured

### Tier 2: Text Extraction + AI Parsing (Fallback)
- **Method:** pdf-parse + AI (OpenAI or Gradient AI)
- **Input:** Extracted text from PDF
- **Features:**
  - ✅ Works with text-based PDFs
  - ❌ Cannot handle image-based PDFs
  - ✅ Good accuracy for well-formatted PDFs
- **Used when:** Tier 1 fails or OpenAI not configured

### Tier 3: Regex-based Parsing (Final Fallback)
- **Method:** Regular expression pattern matching
- **Input:** Extracted text from PDF
- **Features:**
  - ✅ Works with text-based PDFs
  - ❌ Cannot handle image-based PDFs
  - ⚠️ Limited accuracy with unusual formats
- **Used when:** All AI methods fail

## Recommended Configuration

For best results (handles all PDF types including scanned documents):
```bash
OPENAI_API_KEY=sk-...your-key-here
GRADIENT_AI_API_KEY=your-gradient-key  # Optional fallback
```

For budget-conscious setups (text-based PDFs only):
```bash
GRADIENT_AI_API_KEY=your-gradient-key
GRADIENT_AI_WORKSPACE_ID=your-workspace-id
```

## Security

- CORS is configured to only allow requests from atlantahamradio.org
- File upload limited to PDFs only
- Maximum file size: 10MB
- Environment variables are encrypted in DigitalOcean
- All requests are logged for monitoring

## Troubleshooting

### "Missing required environment variables"

Make sure secrets are added in DigitalOcean App Platform:
1. Go to your app → Settings → Environment Variables
2. Add `GRADIENT_AI_API_KEY` and mark as "Encrypt"

### "Gradient AI integration not yet implemented"

The AI integration functions need to be implemented with actual API calls to Gradient AI. See implementation notes above.

### CORS errors

Check that the frontend domain is in the `ALLOWED_ORIGINS` array in `server.js`.

### File upload errors

- Verify file is a valid PDF
- Check file size is under 10MB
- Ensure `Content-Type: multipart/form-data` header is set

## Documentation

See parent directory:
- `../DO_WORKER_SETUP.md` - Full deployment guide
- `../GRADIENT_SETUP.md` - Gradient AI setup instructions
- `../.do/app.yaml` - DigitalOcean configuration

---

**Last Updated**: January 14, 2026
