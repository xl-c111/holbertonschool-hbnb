# Deployment Guide

Quick reference for deploying the HBnB application to production.

## Prerequisites

- AWS CLI configured with appropriate credentials
- SSH key at `~/.ssh/hbnb-backend-key.pem`
- Node.js and npm installed locally
- Git repository access

## Deployment Scripts

### 1. Deploy Frontend Only

Builds the React app and deploys to S3 + CloudFront:

```bash
./deploy-frontend.sh
```

**What it does:**
- Builds frontend with `npm run build`
- Syncs `dist/` folder to S3 bucket
- Invalidates CloudFront cache
- Shows CloudFront URL

**When to use:**
- Frontend code changes only
- UI updates, styling changes
- React component modifications

---

### 2. Deploy Backend Only

Deploys backend to EC2 instance:

```bash
./deploy-backend.sh
```

**What it does:**
- SSHs into EC2 instance
- Pulls latest code from `main` branch
- Installs/updates Python dependencies
- Restarts the backend service
- Verifies service is running

**When to use:**
- Backend API changes
- Database model updates
- New API endpoints
- Business logic changes

---

### 3. Deploy Everything

Deploys both frontend and backend:

```bash
./deploy-all.sh
```

**What it does:**
- Runs `deploy-backend.sh` first
- Then runs `deploy-frontend.sh`
- Shows all live URLs

**When to use:**
- Major releases
- Full-stack feature deployments
- After merging feature branches to main

---

### 4. Add Sample Data to Production

Populates production database with test data:

```bash
./add-production-data.sh
```

**What it does:**
- SSHs into EC2 instance
- Runs `scripts/add_sample_data.py`
- Creates sample users, properties, and reviews

**When to use:**
- First deployment to empty database
- After database reset
- Demo/testing purposes

---

## Production URLs

- **Frontend:** https://d2gfqpg21nkiyl.cloudfront.net
- **Backend API:** https://d145487492x221.cloudfront.net/api/v1/
- **Backend Direct:** http://98.82.136.20/api/v1/

---

## Deployment Workflow

### For Regular Updates:

1. Make changes locally and test
2. Commit changes to git
3. Push to `main` branch:
   ```bash
   git push origin main
   ```
4. Run deployment script:
   ```bash
   ./deploy-all.sh
   ```
5. Wait 2-3 minutes for CloudFront cache invalidation
6. Test the live site

### For Frontend-Only Changes:

```bash
git push origin main
./deploy-frontend.sh
```

### For Backend-Only Changes:

```bash
git push origin main
./deploy-backend.sh
```

---

## Troubleshooting

### Frontend not updating?
- Wait 2-3 minutes for CloudFront invalidation
- Check invalidation status:
  ```bash
  aws cloudfront list-invalidations --distribution-id E1G4F0IQPBP8RJ
  ```
- Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Backend deployment fails?
- Check EC2 instance is running:
  ```bash
  aws ec2 describe-instances --filters "Name=tag:Name,Values=HBnB Backend" --query "Reservations[*].Instances[*].[State.Name]"
  ```
- Verify SSH key permissions:
  ```bash
  ls -la ~/.ssh/hbnb-backend-key.pem
  # Should show -r-------- or -rw-------
  ```
- Check service logs on EC2:
  ```bash
  ssh -i ~/.ssh/hbnb-backend-key.pem ubuntu@98.82.136.20
  sudo journalctl -u hbnb -n 50 --no-pager
  ```

### Database connection errors?
- Verify RDS instance is running
- Check security group allows EC2 access
- Verify environment variables on EC2:
  ```bash
  ssh -i ~/.ssh/hbnb-backend-key.pem ubuntu@98.82.136.20
  cat /home/ubuntu/holbertonschool-hbnb/backend/.env
  ```

### Properties not loading on frontend?
- Check if production database has data:
  ```bash
  curl https://d145487492x221.cloudfront.net/api/v1/places/
  ```
- If empty, run:
  ```bash
  ./add-production-data.sh
  ```
- Wait 2-3 minutes for CloudFront cache to refresh

### Frontend shows "local network permission" dialog?
- This means frontend was built with localhost API URL
- Verify `.env.production` exists with correct API URL:
  ```
  VITE_API_URL=https://d145487492x221.cloudfront.net
  ```
- Rebuild and redeploy:
  ```bash
  ./deploy-frontend.sh
  ```

---

## Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://d145487492x221.cloudfront.net
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Frontend (.env.development)
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend (.env on EC2)
```
DB_USER=admin
DB_PASSWORD=...
DB_HOST=...rds.amazonaws.com
DB_NAME=hbnb_production
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Manual Deployment Steps

If scripts fail, you can deploy manually:

### Manual Frontend Deployment:
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://hbnb-frontend/ --delete
aws cloudfront create-invalidation --distribution-id E1G4F0IQPBP8RJ --paths "/*"
```

### Manual Backend Deployment:
```bash
ssh -i ~/.ssh/hbnb-backend-key.pem ubuntu@98.82.136.20
cd /home/ubuntu/holbertonschool-hbnb
git stash
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl daemon-reload
sudo systemctl restart hbnb
sudo systemctl status hbnb
```

---

## Monitoring

### Check Frontend Status:
```bash
curl -I https://d2gfqpg21nkiyl.cloudfront.net
```

### Check Backend Status:
```bash
curl https://d145487492x221.cloudfront.net/api/v1/places/
```

### Check Backend Service on EC2:
```bash
ssh -i ~/.ssh/hbnb-backend-key.pem ubuntu@98.82.136.20 "sudo systemctl status hbnb"
```

---

## Rollback Procedure

If deployment breaks production:

1. **Revert git commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Redeploy:**
   ```bash
   ./deploy-all.sh
   ```

3. **Or deploy specific commit:**
   ```bash
   # On EC2
   cd /home/ubuntu/holbertonschool-hbnb
   git checkout <previous-commit-hash>
   sudo systemctl restart hbnb
   ```

---

## Best Practices

1. **Always test locally first** before deploying to production
2. **Deploy backend before frontend** to ensure API compatibility
3. **Check logs after deployment** to verify no errors
4. **Keep backups** of database before major schema changes
5. **Use git tags** for production releases:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```
