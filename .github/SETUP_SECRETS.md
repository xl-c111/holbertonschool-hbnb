# GitHub Actions Secrets Setup

Before the CI/CD workflow can run, you need to add the following secrets to your GitHub repository.

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

---

## Required Secrets

### AWS Credentials

**`AWS_ACCESS_KEY_ID`**
- Your AWS access key ID
- Get from: AWS Console → IAM → Your user → Security credentials
- Example: `AKIAIOSFODNN7EXAMPLE`

**`AWS_SECRET_ACCESS_KEY`**
- Your AWS secret access key
- Get from: Same place as access key ID
- Example: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

### EC2 Configuration

**`EC2_IP`**
- Your EC2 instance public IP address
- Get from: EC2 console or run:
  ```bash
  aws ec2 describe-instances --region us-east-1 \
    --filters "Name=tag:Name,Values=HBnB Backend" \
    --query "Reservations[*].Instances[*].PublicIpAddress" --output text
  ```
- Value: `98.82.136.20`

**`EC2_SSH_KEY`**
- Your private SSH key for EC2 access
- Get from: `~/.ssh/hbnb-backend-key.pem`
- **Important:** Copy the entire key including:
  ```
  -----BEGIN RSA PRIVATE KEY-----
  ... (your key content) ...
  -----END RSA PRIVATE KEY-----
  ```
- To copy:
  ```bash
  cat ~/.ssh/hbnb-backend-key.pem | pbcopy  # macOS
  cat ~/.ssh/hbnb-backend-key.pem           # Linux (copy manually)
  ```

### S3 and CloudFront

**`S3_BUCKET`**
- Your S3 bucket name
- Value: `hbnb-frontend`

**`CLOUDFRONT_DIST_ID`**
- Your CloudFront distribution ID
- Get from: CloudFront console or run:
  ```bash
  aws cloudfront list-distributions \
    --query "DistributionList.Items[?Origins.Items[0].DomainName=='hbnb-frontend.s3-website-us-east-1.amazonaws.com'].Id" \
    --output text
  ```
- Value: `E1G4F0IQPBP8RJ`

**`CLOUDFRONT_URL`**
- Your CloudFront domain name
- Value: `d2gfqpg21nkiyl.cloudfront.net`

### API and Services

**`PROD_API_URL`**
- Your production backend API URL
- Value: `https://d145487492x221.cloudfront.net`

**`STRIPE_PUBLISHABLE_KEY`**
- Your Stripe publishable key
- Get from: Stripe Dashboard → Developers → API keys
- Get current value:
  ```bash
  grep STRIPE_PUBLISHABLE_KEY backend/.env
  ```
- Value starts with: `pk_test_...`

---

## Quick Setup Script

Run this to see all the values you need:

```bash
#!/bin/bash
echo "=== GitHub Secrets Values ==="
echo ""
echo "EC2_IP:"
aws ec2 describe-instances --region us-east-1 \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[*].Instances[*].PublicIpAddress" --output text

echo ""
echo "CLOUDFRONT_DIST_ID:"
aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[0].DomainName=='hbnb-frontend.s3-website-us-east-1.amazonaws.com'].Id" \
  --output text

echo ""
echo "S3_BUCKET: hbnb-frontend"
echo "CLOUDFRONT_URL: d2gfqpg21nkiyl.cloudfront.net"
echo "PROD_API_URL: https://d145487492x221.cloudfront.net"
echo ""
echo "STRIPE_PUBLISHABLE_KEY:"
grep STRIPE_PUBLISHABLE_KEY backend/.env | cut -d= -f2

echo ""
echo "EC2_SSH_KEY:"
echo "Run: cat ~/.ssh/hbnb-backend-key.pem"
echo ""
echo "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:"
echo "Get from AWS Console → IAM → Your user → Security credentials"
```

---

## Verification

After adding all secrets, verify they're set correctly:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all 9 secrets listed:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - CLOUDFRONT_DIST_ID
   - CLOUDFRONT_URL
   - EC2_IP
   - EC2_SSH_KEY
   - PROD_API_URL
   - S3_BUCKET
   - STRIPE_PUBLISHABLE_KEY

---

## Testing the Workflow

Once secrets are configured:

1. Make a small change to your code
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "test: trigger CI/CD workflow"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub to watch the deployment
4. The workflow will:
   - ✅ Run tests
   - ✅ Deploy backend to EC2
   - ✅ Deploy frontend to S3
   - ✅ Invalidate CloudFront cache

---

## Manual Trigger

You can also trigger deployment manually:

1. Go to **Actions** tab
2. Click **Deploy to Production** workflow
3. Click **Run workflow** → Select `main` branch → **Run workflow**

---

## Troubleshooting

### Workflow fails with "Permission denied"
- Check that `EC2_SSH_KEY` includes the full key with headers/footers
- Verify the key has correct line breaks (no extra spaces)

### Workflow fails with "AWS credentials"
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct
- Check IAM user has permissions for S3, CloudFront, and EC2

### Frontend not updating after deployment
- Wait 2-3 minutes for CloudFront invalidation
- Check the **Actions** tab for any errors in the invalidation step

### Backend deployment fails
- Check EC2 instance is running
- Verify the IP address in `EC2_IP` secret is correct
- Check backend service logs on EC2
