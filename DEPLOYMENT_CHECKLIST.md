# DigitalOcean Worker Deployment Checklist

Quick reference checklist for deploying the ICS-205 parser worker to DigitalOcean App Platform (ATL1).

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Gradient AI account created
- [ ] Gradient AI API key obtained
- [ ] Local `.env` file created from `.env.example`
- [ ] All required environment variables set locally

### 2. Code Preparation
- [ ] Worker files created in `/worker` directory:
  - [ ] `server.js`
  - [ ] `ics205-parser.js`
  - [ ] `package.json`
  - [ ] `.node-version`
  - [ ] `README.md`
- [ ] `.do/app.yaml` updated with worker service configuration
- [ ] Gradient AI integration implemented (or placeholder ready)
- [ ] Local testing completed

### 3. DigitalOcean Configuration
- [ ] DigitalOcean account with App Platform access
- [ ] Repository connected to DigitalOcean App Platform
- [ ] Secrets added to DigitalOcean:
  - [ ] `GRADIENT_AI_API_KEY` (encrypted)
  - [ ] `GRADIENT_AI_WORKSPACE_ID` (encrypted)
  - [ ] `GRADIENT_AI_MODEL` (encrypted)

### 4. Code Review
- [ ] No secrets in committed code
- [ ] `.gitignore` properly excludes `.env` files
- [ ] CORS origins correctly configured
- [ ] Error handling implemented
- [ ] Logging configured

## 🚀 Deployment Steps

### Step 1: Add Secrets to DigitalOcean

```bash
# Via Console:
1. Go to https://cloud.digitalocean.com/apps
2. Select "atlantahamradio" app
3. Settings → App-Level Environment Variables
4. Click "Add Variable"
5. Add each secret:
   - GRADIENT_AI_API_KEY (mark as "Encrypt")
   - GRADIENT_AI_WORKSPACE_ID (mark as "Encrypt")
   - GRADIENT_AI_MODEL (mark as "Encrypt")
6. Save changes
```

### Step 2: Commit and Push

```bash
# Review changes
git status
git diff

# Commit worker files
git add .do/app.yaml
git add worker/
git add DO_WORKER_SETUP.md
git add DEPLOYMENT_CHECKLIST.md
git add GRADIENT_SETUP.md

git commit -m "Add ICS-205 parser worker with Gradient AI integration"

# Push to main branch (triggers auto-deploy)
git push origin main
```

### Step 3: Monitor Deployment

```bash
# Via CLI (if doctl installed):
doctl apps list
doctl apps logs YOUR_APP_ID --type build --follow

# Via Console:
# Go to https://cloud.digitalocean.com/apps
# Select your app → Activity tab
# Watch deployment progress
```

### Step 4: Verify Deployment

```bash
# Test health endpoint
curl https://atlantahamradio.org/health

# Expected response:
# {"status":"healthy","timestamp":"2026-01-14T..."}

# If health check fails, check logs:
doctl apps logs YOUR_APP_ID --type run --follow
```

### Step 5: Test Conversion API

```bash
# Test with sample ICS-205 PDF
curl -X POST https://atlantahamradio.org/api/ics205/convert \
  -F "pdf=@sample-ics205.pdf" \
  -o test-output.csv

# Check output
cat test-output.csv
```

## 📊 Post-Deployment Verification

### Health Checks
- [ ] `/health` endpoint returns 200 OK
- [ ] Response includes correct service name and version
- [ ] Health check completes within 5 seconds

### API Functionality
- [ ] `/api/ics205/convert` endpoint accessible
- [ ] PDF upload works (multipart/form-data)
- [ ] Conversion returns valid CSV
- [ ] Error handling works (invalid files, oversized, etc.)

### Security
- [ ] CORS allows only specified origins
- [ ] Secrets not exposed in logs or responses
- [ ] File size limits enforced (10MB)
- [ ] Only PDF files accepted

### Monitoring
- [ ] Logs visible in DigitalOcean console
- [ ] No error messages in startup logs
- [ ] Request logging working
- [ ] Performance metrics available

## 🔧 Troubleshooting

### Deployment Fails

**Check build logs:**
```bash
doctl apps logs YOUR_APP_ID --type build
```

**Common issues:**
- Missing `package.json` in worker directory
- Node.js version mismatch
- Syntax errors in JavaScript files
- Missing dependencies

### Worker Won't Start

**Check runtime logs:**
```bash
doctl apps logs YOUR_APP_ID --type run
```

**Common issues:**
- Missing environment variables (add to DigitalOcean)
- Port configuration mismatch (should be 8080)
- Module import errors
- Gradient AI API connection issues

### Health Check Fails

**Verify endpoint:**
```bash
curl -v https://atlantahamradio.org/health
```

**Common issues:**
- Route configuration wrong in `.do/app.yaml`
- Server not listening on correct port (PORT=8080)
- Server crashed on startup (check logs)
- Health check timeout too short

### API Returns 500 Error

**Check error logs:**
```bash
doctl apps logs YOUR_APP_ID --type run | grep error
```

**Common issues:**
- Gradient AI API key invalid or expired
- Gradient AI integration not implemented
- PDF parsing errors
- Memory/timeout issues

### CORS Errors

**Check allowed origins in `server.js`:**
```javascript
const ALLOWED_ORIGINS = [
    'https://atlantahamradio.org',
    'https://www.atlantahamradio.org',
];
```

**Test CORS:**
```bash
curl -H "Origin: https://atlantahamradio.org" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://atlantahamradio.org/api/ics205/convert
```

## 📈 Monitoring & Maintenance

### Daily
- [ ] Check error logs for issues
- [ ] Monitor conversion success rate
- [ ] Review response times

### Weekly
- [ ] Review Gradient AI usage and costs
- [ ] Check DigitalOcean billing
- [ ] Monitor traffic patterns
- [ ] Review error rates

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Rotate API keys (security best practice)
- [ ] Review and optimize performance
- [ ] Update documentation as needed

## 📞 Support

### Documentation
- `DO_WORKER_SETUP.md` - Full setup guide
- `GRADIENT_SETUP.md` - Gradient AI configuration
- `worker/README.md` - Worker service documentation

### Resources
- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Gradient AI Docs](https://gradient.ai/docs)
- [GitHub Repository](https://github.com/discerningowl/atlantahamradio)

### Help
- DigitalOcean Support: https://www.digitalocean.com/support
- GitHub Issues: https://github.com/discerningowl/atlantahamradio/issues

---

## 🎯 Quick Command Reference

```bash
# Get app ID
doctl apps list

# View build logs
doctl apps logs YOUR_APP_ID --type build --follow

# View runtime logs
doctl apps logs YOUR_APP_ID --type run --follow

# Update app spec
doctl apps update YOUR_APP_ID --spec .do/app.yaml

# Test health endpoint
curl https://atlantahamradio.org/health

# Test conversion API
curl -X POST https://atlantahamradio.org/api/ics205/convert \
  -F "pdf=@test.pdf" -o output.csv
```

---

**Last Updated**: January 14, 2026
**Region**: ATL1 (Atlanta)
**Maintainer**: KQ4JP
