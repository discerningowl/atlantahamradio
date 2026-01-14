# DigitalOcean App Platform Worker Setup Guide
## ICS-205 to CHIRP CSV AI Worker (Atlanta - ATL1 Datacenter)

This guide walks you through setting up an AI-powered worker service on DigitalOcean App Platform to parse ICS-205 Radio Communications Plan PDFs and convert them to CHIRP CSV format.

---

## 📋 Overview

### Architecture
```
┌──────────────────────────────────────────────────────────┐
│                  DigitalOcean App Platform                │
│                      (ATL1 Region)                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────┐    ┌─────────────────────┐    │
│  │   Static Site       │    │   Worker Service     │    │
│  │  atlantahamradio.org│◄──►│  ics205-parser       │    │
│  │   (HTML/CSS/JS)     │    │   (Node.js + API)    │    │
│  └─────────────────────┘    └──────────┬──────────┘    │
│                                         │                │
│                                         ▼                │
│                              ┌─────────────────────┐    │
│                              │   Gradient AI API   │    │
│                              │  (PDF Processing)   │    │
│                              └─────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### What You'll Build
1. **Worker Service**: Node.js HTTP server that accepts PDF uploads
2. **AI Processing**: Uses Gradient AI to extract frequency data from ICS-205 PDFs
3. **API Endpoint**: RESTful API accessible from your static site
4. **Secure**: API keys stored as DigitalOcean environment variables

---

## 🚀 Step-by-Step Setup

### Step 1: Prepare Your Local Environment

1. **Ensure you have the foundation files** (already done ✓):
   ```bash
   ls -la .env.example
   ls -la scripts/pdf-to-chirp.js
   ls -la GRADIENT_SETUP.md
   ```

2. **Create your local `.env` file**:
   ```bash
   cp .env.example .env
   ```

3. **Add your Gradient AI credentials to `.env`**:
   ```bash
   # Edit .env and add:
   GRADIENT_AI_API_KEY=your_gradient_ai_api_key_here
   GRADIENT_AI_WORKSPACE_ID=your_workspace_id_here
   GRADIENT_AI_MODEL=your_model_name_here
   ```

### Step 2: Create Worker Service Files

You'll need these additional files (we'll create them):

```
atlantahamradio/
├── worker/                         # New worker service directory
│   ├── server.js                  # HTTP API server
│   ├── ics205-parser.js           # ICS-205 parsing logic with Gradient AI
│   ├── package.json               # Dependencies for worker
│   └── .node-version              # Node.js version specification
├── .do/
│   └── app.yaml                   # Updated with worker config
└── scripts/
    └── pdf-to-chirp.js            # CLI version (already exists)
```

### Step 3: Update DigitalOcean Configuration

The `.do/app.yaml` file needs to include both your static site AND the new worker service.

**Updated structure**:
```yaml
name: atlantahamradio
region: atl  # ATL1 datacenter

# Existing static site
static_sites:
  - name: atlantahamradio-frontend
    # ... existing config ...

# NEW: Worker service
services:
  - name: ics205-parser-worker
    source_dir: /worker
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs

    envs:
      - key: GRADIENT_AI_API_KEY
        scope: RUN_TIME
        type: SECRET
      - key: GRADIENT_AI_WORKSPACE_ID
        scope: RUN_TIME
        type: SECRET
      - key: GRADIENT_AI_MODEL
        scope: RUN_TIME
        type: SECRET
      - key: PORT
        value: "8080"

    http_port: 8080

    routes:
      - path: /api/ics205

    health_check:
      http_path: /health
```

### Step 4: Add Secrets to DigitalOcean

1. **Go to DigitalOcean App Platform**:
   - Navigate to: https://cloud.digitalocean.com/apps
   - Select your `atlantahamradio` app

2. **Add Environment Variables**:
   - Click on your app → Settings → App-Level Environment Variables
   - OR: Go to the specific component (worker) → Settings → Environment Variables

3. **Add these secrets** (click "Encrypt" for each):
   ```
   GRADIENT_AI_API_KEY = [your-actual-api-key]
   GRADIENT_AI_WORKSPACE_ID = [your-workspace-id]
   GRADIENT_AI_MODEL = [your-model-name]
   ```

4. **Important**: Make sure "Encrypt" is checked for all sensitive values!

### Step 5: Configure CORS for Frontend

Your worker needs to allow requests from your frontend domain:

```javascript
// In worker/server.js
const ALLOWED_ORIGINS = [
  'https://atlantahamradio.org',
  'https://www.atlantahamradio.org',
  'http://localhost:8000', // For local development
];
```

### Step 6: Update Frontend to Use Worker

Add JavaScript to your frontend (e.g., new page or existing page):

```javascript
async function convertICS205(pdfFile) {
  const formData = new FormData();
  formData.append('pdf', pdfFile);

  try {
    const response = await fetch('https://atlantahamradio.org/api/ics205/convert', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Conversion failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Download the CSV
    const blob = new Blob([result.csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename || 'channels.csv';
    a.click();
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Conversion error:', error);
    alert('Failed to convert PDF: ' + error.message);
  }
}
```

---

## 🔧 Worker API Specification

### Endpoints

#### `POST /api/ics205/convert`
Convert ICS-205 PDF to CHIRP CSV format.

**Request**:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: PDF file in `pdf` field

**Response** (Success):
```json
{
  "success": true,
  "csv": "Location,Name,Frequency,Duplex,Offset,...\n0,Channel 1,146.520,,,...",
  "filename": "ics205-channels.csv",
  "channelCount": 25
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Invalid PDF format"
}
```

#### `GET /health`
Health check endpoint for DigitalOcean monitoring.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-14T12:00:00Z"
}
```

---

## 📦 Dependencies

### Worker Service Dependencies (`worker/package.json`)

```json
{
  "name": "ics205-parser-worker",
  "version": "1.0.0",
  "description": "AI-powered ICS-205 to CHIRP CSV converter",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## 🚢 Deployment Process

### Option A: Manual Deploy via DigitalOcean Console

1. **Commit and push your changes**:
   ```bash
   git add .
   git commit -m "Add ICS-205 parser worker with Gradient AI"
   git push origin main
   ```

2. **Update app via DigitalOcean Console**:
   - Go to: https://cloud.digitalocean.com/apps
   - Select your app
   - Click "Settings" → "App Spec"
   - Edit the YAML to include the worker service
   - Click "Save" (this will trigger a deployment)

### Option B: Deploy via `doctl` CLI

1. **Install doctl** (if not already):
   ```bash
   # macOS
   brew install doctl

   # Linux
   snap install doctl

   # Or download from: https://github.com/digitalocean/doctl/releases
   ```

2. **Authenticate**:
   ```bash
   doctl auth init
   # Enter your DigitalOcean API token
   ```

3. **Get your app ID**:
   ```bash
   doctl apps list
   # Note your app ID
   ```

4. **Update app spec**:
   ```bash
   doctl apps update YOUR_APP_ID --spec .do/app.yaml
   ```

### Option C: Automatic Deploy (Already Configured)

Your app is already set to auto-deploy on push to `main` branch:
- Just push changes to `main`
- DigitalOcean will automatically detect and deploy

---

## 🧪 Testing

### Test Health Check

```bash
curl https://atlantahamradio.org/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2026-01-14T..."}
```

### Test PDF Conversion (CLI)

```bash
curl -X POST https://atlantahamradio.org/api/ics205/convert \
  -F "pdf=@test-ics205.pdf" \
  -o output.csv
```

### Test from Frontend

1. Create a simple test page with file upload
2. Upload an ICS-205 PDF
3. Check browser console for errors
4. Verify CSV downloads

---

## 💰 Cost Considerations

### DigitalOcean App Platform Pricing (ATL1)

**Static Site** (existing):
- ✅ **FREE** - Static sites are free on App Platform
- Bandwidth: 100 GB/month included
- You're already using this

**Worker Service** (new):
- **Basic (XXS)**: $5/month
  - 512 MB RAM
  - 1 vCPU
  - Good for light usage (<1000 conversions/month)

- **Basic (XS)**: $12/month
  - 1 GB RAM
  - 1 vCPU
  - Better for moderate usage

- **Scaling**: Can auto-scale if needed (additional cost)

**Gradient AI Costs**:
- Check Gradient AI pricing based on your usage
- Most providers charge per API call or per page processed
- Budget accordingly based on expected conversion volume

### Cost Optimization Tips

1. **Use smaller instance size** initially (Basic XXS)
2. **Implement caching** for repeated conversions
3. **Add rate limiting** to prevent abuse
4. **Monitor usage** via DigitalOcean dashboard
5. **Consider batch processing** for multiple PDFs

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` to git
- ✅ Use encrypted secrets in DigitalOcean
- ✅ Rotate API keys periodically
- ✅ Use minimum required permissions

### API Security
- ✅ Implement CORS restrictions
- ✅ Add rate limiting (prevent abuse)
- ✅ Validate file types (only PDFs)
- ✅ Limit file size (e.g., 10MB max)
- ✅ Sanitize user inputs
- ✅ Add authentication (if needed)

### Network Security
- ✅ HTTPS only (automatic with DO App Platform)
- ✅ Set security headers
- ✅ Use DigitalOcean's built-in DDoS protection

---

## 🐛 Troubleshooting

### Worker Won't Start

**Check logs**:
```bash
doctl apps logs YOUR_APP_ID --type run --follow
```

**Common issues**:
- ❌ Missing environment variables → Add them in DO console
- ❌ Port mismatch → Ensure `PORT=8080` is set
- ❌ Dependencies not installed → Check package.json
- ❌ Syntax errors → Check server.js

### API Returns 500 Error

**Check**:
1. Worker logs for stack traces
2. Gradient AI API key is valid
3. PDF file is valid ICS-205 format
4. Network connectivity to Gradient AI

### CORS Errors

**Check**:
1. Allowed origins in worker code
2. Frontend domain matches exactly
3. HTTPS vs HTTP mismatch
4. Credentials/cookies issues

### Conversion Takes Too Long

**Solutions**:
1. Increase worker instance size
2. Add timeout handling (30s max)
3. Implement progress feedback
4. Consider async processing with webhooks

---

## 📊 Monitoring & Logs

### DigitalOcean Console

1. **View logs**:
   - Go to your app → Runtime Logs
   - Select component: `ics205-parser-worker`
   - View real-time logs

2. **Monitor performance**:
   - Go to your app → Insights
   - Check CPU, memory, and request metrics

3. **Set up alerts**:
   - Go to your app → Settings → Alerts
   - Configure alerts for errors, high CPU, etc.

### Log Levels

Add to your worker:
```javascript
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

function log(level, message, meta = {}) {
  if (shouldLog(level)) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    }));
  }
}
```

---

## 🔄 Maintenance

### Regular Tasks

**Weekly**:
- [ ] Check error logs for issues
- [ ] Monitor conversion success rate
- [ ] Review Gradient AI usage/costs

**Monthly**:
- [ ] Update dependencies (`npm update`)
- [ ] Review and rotate API keys
- [ ] Check DigitalOcean billing
- [ ] Performance optimization

**Quarterly**:
- [ ] Security audit
- [ ] Load testing
- [ ] Review architecture for improvements

---

## 📚 Additional Resources

### Documentation
- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [App Spec Reference](https://docs.digitalocean.com/products/app-platform/reference/app-spec/)
- [Gradient AI Documentation](https://gradient.ai/docs)
- [ICS-205 Form Reference](https://training.fema.gov/emiweb/is/icsresource/assets/ics%20forms/ics%20form%20205,%20incident%20radio%20communications%20plan%20(v3).pdf)

### Tools
- [doctl CLI](https://docs.digitalocean.com/reference/doctl/)
- [DigitalOcean API](https://docs.digitalocean.com/reference/api/)
- [CHIRP Documentation](https://chirp.danplanet.com/projects/chirp/wiki/Home)

### Support
- DigitalOcean Support: https://www.digitalocean.com/support
- Community Forums: https://www.digitalocean.com/community
- GitHub Issues: https://github.com/discerningowl/atlantahamradio/issues

---

## ✅ Deployment Checklist

Before going live, ensure:

- [ ] Gradient AI API key added to DigitalOcean secrets
- [ ] Worker service added to `.do/app.yaml`
- [ ] Worker code committed and pushed to `main`
- [ ] Health check endpoint responds
- [ ] CORS configured for frontend domains
- [ ] File upload size limits set
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Rate limiting added (if needed)
- [ ] Frontend updated to use worker API
- [ ] Test conversion with sample ICS-205 PDF
- [ ] Monitor first deployments for errors
- [ ] Documentation updated

---

## 🎯 Quick Start Summary

1. **Add secrets to DigitalOcean** → Settings → Environment Variables
2. **Update `.do/app.yaml`** → Add worker service configuration
3. **Create worker files** → `worker/server.js`, `worker/ics205-parser.js`, `worker/package.json`
4. **Commit and push** → `git push origin main`
5. **Monitor deployment** → DigitalOcean console → Runtime Logs
6. **Test** → Upload ICS-205 PDF from frontend

---

**Last Updated**: January 14, 2026
**Region**: ATL1 (Atlanta)
**Maintainer**: KQ4JP

**73!** 📻
