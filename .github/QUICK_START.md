# CI/CD Quick Start Guide

## What Was Added

✅ **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
- Automatically deploys on push to `main`
- Runs tests before deploying
- Deploys backend and frontend in parallel

✅ **Setup Guide** (`.github/SETUP_SECRETS.md`)
- Complete list of required secrets
- Commands to get each value
- Troubleshooting tips

---

## Setup (One-Time)

### Step 1: Add GitHub Secrets

You need to add 9 secrets to your GitHub repository:

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click "New repository secret" for each:

| Secret Name | Where to Get It | Example Value |
|-------------|----------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS Console → IAM | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Console → IAM | `wJalrXUt...` |
| `EC2_IP` | AWS EC2 Console | `98.82.136.20` |
| `EC2_SSH_KEY` | `cat ~/.ssh/hbnb-backend-key.pem` | `-----BEGIN RSA...` |
| `S3_BUCKET` | Manual | `hbnb-frontend` |
| `CLOUDFRONT_DIST_ID` | AWS CloudFront Console | `E1G4F0IQPBP8RJ` |
| `CLOUDFRONT_URL` | AWS CloudFront Console | `d2gfqpg21nkiyl.cloudfront.net` |
| `PROD_API_URL` | Manual | `https://d145487492x221.cloudfront.net` |
| `STRIPE_PUBLISHABLE_KEY` | `grep STRIPE_PUBLISHABLE_KEY backend/.env` | `pk_test_...` |

**See `.github/SETUP_SECRETS.md` for detailed instructions.**

---

## Usage

### Automatic Deployment (Recommended)

Just push to main:
```bash
git add .
git commit -m "your changes"
git push origin main
```

The workflow automatically:
1. Runs tests
2. Deploys backend to EC2
3. Deploys frontend to S3
4. Invalidates CloudFront

Watch progress: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

---

### Manual Deployment (Alternative)

Still prefer scripts? They still work:

```bash
# Deploy everything
./deploy-all.sh

# Or deploy individually
./deploy-backend.sh
./deploy-frontend.sh
```

---

## Monitoring

### View Deployment Status

1. Go to **Actions** tab in GitHub
2. Click on the latest workflow run
3. See real-time logs for each step

### Check if Deployment Succeeded

The workflow will show:
- ✅ Green checkmark = Success
- ❌ Red X = Failed (click to see logs)

### Verify Live Site

After deployment (wait 2-3 min for CloudFront):
- Frontend: https://d2gfqpg21nkiyl.cloudfront.net
- Backend: https://d145487492x221.cloudfront.net/api/v1/places/

---

## Common Issues

### "Secret not found" error
→ Add all 9 secrets to GitHub repository settings

### "Permission denied (publickey)"
→ Check `EC2_SSH_KEY` secret has full key including headers

### "AWS credentials error"
→ Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct

### Frontend not updating
→ Wait 2-3 minutes for CloudFront cache invalidation

---

## Benefits

✅ **Automated Testing** - Catches bugs before deployment
✅ **Zero-Downtime** - Backend and frontend deploy in parallel
✅ **Rollback Easy** - Just revert the git commit
✅ **Audit Trail** - All deployments logged in GitHub Actions
✅ **Team Friendly** - Anyone with push access can deploy

---

## Next Steps

1. **Test the workflow**: Make a small change and push to `main`
2. **Watch it deploy**: Go to Actions tab
3. **Verify it works**: Check your live site

Need help? See `.github/SETUP_SECRETS.md` for detailed troubleshooting.
