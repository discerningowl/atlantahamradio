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

Required:
- `GRADIENT_AI_API_KEY` - Your Gradient AI API key
- `GRADIENT_AI_WORKSPACE_ID` - Your Gradient AI workspace ID
- `GRADIENT_AI_MODEL` - Model name to use for parsing

Optional:
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

## Implementation Notes

### TODO: Gradient AI Integration

The following functions need actual Gradient AI API integration:

1. **`extractTextWithGradientAI()`** in `ics205-parser.js`
   - Currently throws error (not implemented)
   - Needs to call Gradient AI API to extract text from PDF
   - Should return extracted text as string

2. **`parseICS205WithAI()`** in `ics205-parser.js`
   - Currently throws error (not implemented)
   - Needs to use AI to parse frequency data from text
   - Should return array of frequency objects

### Example Gradient AI Integration

```javascript
async function extractTextWithGradientAI(pdfBuffer) {
    const response = await fetch('https://api.gradient.ai/v1/extract', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GRADIENT_AI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            file: pdfBuffer.toString('base64'),
            model: process.env.GRADIENT_AI_MODEL || 'document-extraction',
        }),
    });

    if (!response.ok) {
        throw new Error(`Gradient AI API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.text;
}
```

Adjust based on actual Gradient AI API documentation.

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
