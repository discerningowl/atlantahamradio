# Gradient AI Worker Setup

This document describes how to set up and use the Gradient AI worker for PDF to CHIRP CSV conversion.

## 🔐 Security & Environment Setup

### Local Development

1. **Copy the environment template**
   ```bash
   cp .env.example .env
   ```

2. **Add your Gradient AI credentials to `.env`**

   Open `.env` and replace the placeholder values:
   ```bash
   GRADIENT_AI_API_KEY=your_actual_api_key_here
   GRADIENT_AI_WORKSPACE_ID=your_actual_workspace_id
   GRADIENT_AI_MODEL=your_model_name
   ```

3. **Get your Gradient AI credentials**
   - Visit [Gradient AI](https://gradient.ai/)
   - Sign up or log in to your account
   - Navigate to API settings
   - Copy your API key and workspace ID

### GitHub Actions (CI/CD)

For automated workflows, secrets are stored in GitHub repository settings:

1. **Add secrets to GitHub**
   - Go to your repository on GitHub
   - Click `Settings` → `Secrets and variables` → `Actions`
   - Click `New repository secret`
   - Add the following secrets:
     - `GRADIENT_AI_API_KEY` - Your Gradient AI API key
     - `GRADIENT_AI_WORKSPACE_ID` - Your workspace ID (if required)
     - `GRADIENT_AI_MODEL` - Your model name (if required)

2. **Secrets are accessed in workflows like this:**
   ```yaml
   - name: Run Gradient AI Worker
     env:
       GRADIENT_AI_API_KEY: ${{ secrets.GRADIENT_AI_API_KEY }}
       GRADIENT_AI_WORKSPACE_ID: ${{ secrets.GRADIENT_AI_WORKSPACE_ID }}
     run: node scripts/pdf-to-chirp.js
   ```

## 📁 Project Structure

```
atlantahamradio/
├── scripts/
│   ├── generate-calendar.js      # Existing calendar generator
│   └── pdf-to-chirp.js           # New: PDF to CHIRP CSV converter
├── .github/
│   └── workflows/
│       ├── generate-calendar.yml  # Existing workflow
│       └── pdf-to-chirp.yml      # New: Gradient AI workflow
├── .env.example                   # Template for environment variables
├── .env                          # Your local secrets (NOT committed)
└── .gitignore                    # Excludes .env and secrets
```

## 🚀 Running the Worker

### Locally

```bash
# Make sure you have Node.js installed
node --version  # Should be 18 or higher

# Ensure .env file is configured
cat .env

# Run the worker
node scripts/pdf-to-chirp.js /path/to/input.pdf
```

### Via GitHub Actions

The worker will run automatically when:
- A PDF file is added to a specific directory
- Manually triggered via workflow dispatch
- Scheduled (if configured)

## 🔒 Security Best Practices

### ✅ DO

- ✅ Use `.env` files for local development
- ✅ Store secrets in GitHub repository secrets for CI/CD
- ✅ Keep `.env.example` updated with required variables (without values)
- ✅ Use environment variable validation in your scripts
- ✅ Rotate API keys periodically
- ✅ Limit API key permissions to only what's needed

### ❌ DON'T

- ❌ Commit `.env` files to git
- ❌ Hardcode API keys in source code
- ❌ Share API keys in public channels
- ❌ Store secrets in comments or documentation
- ❌ Push secrets to public repositories
- ❌ Log API keys to console or files

## 🔍 Troubleshooting

### "API Key not found" error

Make sure:
1. `.env` file exists in project root
2. `GRADIENT_AI_API_KEY` is set in `.env`
3. No extra spaces around the `=` sign
4. No quotes around values (unless needed)

### GitHub Actions workflow fails with authentication error

Make sure:
1. Secrets are added to GitHub repository settings
2. Secret names match exactly in workflow file
3. Secrets are accessible to the workflow (check repository permissions)

### "Module not found" error

Install dependencies:
```bash
npm install
```

## 📚 Additional Resources

- [Gradient AI Documentation](https://gradient.ai/docs)
- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Environment Variables Best Practices](https://12factor.net/config)

## 🤝 Contributing

When adding new environment variables:

1. Add to `.env.example` with placeholder values
2. Document the variable in this file
3. Update GitHub Actions workflows if needed
4. Update `.gitignore` if new secret file patterns are added

---

**Last Updated**: January 14, 2026
