# Frontend Deployment Guide: S3 + CloudFront

Complete step-by-step guide to deploy your HBnB frontend to AWS S3 with CloudFront CDN.

---

## Prerequisites

- AWS Account with access to S3 and CloudFront
- Frontend code ready to build
- Backend API deployed and running (http://98.82.136.20)

---

## Step 1: Build Your Frontend

### 1.1 Update API Endpoint

Before building, update your frontend to point to your production backend:

**File: `frontend/src/config.js` (or wherever API URL is configured)**

```javascript
// Change from localhost to your EC2 public IP
export const API_URL = 'http://98.82.136.20/api/v1';
```

### 1.2 Build for Production

```bash
cd frontend
npm install
npm run build
```

This creates a `dist/` or `build/` folder with optimized static files.

**✓ Checkpoint:** Verify the build folder contains `index.html` and static assets (CSS, JS).

---

## Step 2: Create S3 Bucket

### 2.1 Create Bucket

1. Go to **AWS Console** → **S3** → **Create bucket**
2. **Bucket name:** `hbnb-frontend` (must be globally unique)
   - If taken, try: `hbnb-frontend-[your-name]` or `hbnb-frontend-2024`
3. **Region:** `us-east-1` (N. Virginia) - recommended for CloudFront
4. **Object Ownership:** ACLs disabled (recommended)
5. **Block Public Access:**
   - ❌ **UNCHECK** "Block all public access"
   - ✅ Check the acknowledgment box
6. **Bucket Versioning:** Disabled (optional for now)
7. **Encryption:** Server-side encryption (default is fine)
8. Click **Create bucket**

### 2.2 Enable Static Website Hosting

1. Go to your bucket → **Properties** tab
2. Scroll to **Static website hosting**
3. Click **Edit**
4. Select **Enable**
5. **Hosting type:** Host a static website
6. **Index document:** `index.html`
7. **Error document:** `index.html` (for SPA routing)
8. Click **Save changes**
9. **Note the endpoint URL** (e.g., `http://hbnb-frontend.s3-website-us-east-1.amazonaws.com`)

### 2.3 Configure Bucket Policy

1. Go to **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit**
4. Paste this policy (replace `hbnb-frontend` with your bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::hbnb-frontend/*"
        }
    ]
}
```

5. Click **Save changes**

**✓ Checkpoint:** Your bucket should now allow public read access to objects.

---

## Step 3: Upload Frontend Files to S3

### Option A: Using AWS Console (Easier)

1. Go to your bucket → **Objects** tab
2. Click **Upload**
3. Click **Add files** and **Add folder**
4. Select ALL files from your `frontend/dist/` or `frontend/build/` folder
5. **Important:** Make sure to upload the folder CONTENTS, not the folder itself
6. Click **Upload**
7. Wait for upload to complete

### Option B: Using AWS CLI (Faster)

If you have AWS CLI installed and configured:

```bash
cd frontend
aws s3 sync dist/ s3://hbnb-frontend/ --delete
# or if your build folder is named 'build':
# aws s3 sync build/ s3://hbnb-frontend/ --delete
```

**✓ Checkpoint:** Test your S3 website endpoint (from Step 2.2) - it should load your frontend!

---

## Step 4: Create CloudFront Distribution

### 4.1 Create Distribution

1. Go to **AWS Console** → **CloudFront** → **Create distribution**
2. **Origin domain:** Select your S3 bucket from dropdown
   - Choose the **S3 website endpoint** (not the bucket itself)
   - Or manually enter: `hbnb-frontend.s3-website-us-east-1.amazonaws.com`
3. **Origin path:** Leave blank
4. **Name:** `hbnb-frontend-origin` (auto-filled)
5. **Origin access:** Public (since we enabled public access)

### 4.2 Default Cache Behavior Settings

1. **Viewer protocol policy:** Redirect HTTP to HTTPS
2. **Allowed HTTP methods:** GET, HEAD, OPTIONS
3. **Cache policy:** CachingOptimized (recommended)
4. **Origin request policy:** None
5. **Response headers policy:** None (or SimpleCORS if needed)

### 4.3 Distribution Settings

1. **Price class:** Use all edge locations (best performance)
   - Or choose "Use only North America and Europe" (cheaper)
2. **Alternate domain names (CNAMEs):** Leave blank (for now)
3. **Custom SSL certificate:** Default CloudFront certificate
4. **Default root object:** `index.html`
5. **Description:** `HBnB Frontend Distribution` (optional)
6. **IPv6:** Enabled ✓

### 4.4 Error Pages (Important for SPAs!)

After creating the distribution:

1. Go to **Error pages** tab
2. Click **Create custom error response**
3. **HTTP error code:** 403 Forbidden
4. **Customize error response:** Yes
5. **Response page path:** `/index.html`
6. **HTTP Response code:** 200 OK
7. Click **Create**
8. **Repeat for 404 Not Found:**
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP Response code: 200 OK

### 4.5 Wait for Deployment

1. CloudFront will show **Status: Deploying** (takes 5-15 minutes)
2. **Copy the Distribution domain name** (e.g., `d1234abcd.cloudfront.net`)
3. Wait for **Status: Enabled** and **State: Deployed**

**✓ Checkpoint:** Once deployed, test your CloudFront URL - your frontend should load!

---

## Step 5: Update Backend CORS Settings

Your backend needs to allow requests from your CloudFront domain.

### 5.1 Get Your CloudFront Domain

From CloudFront console, copy your distribution domain (e.g., `d1234abcd.cloudfront.net`)

### 5.2 Update Backend .env File

SSH into your EC2 instance:

```bash
ssh -i ~/.ssh/hbnb-backend-key.pem ubuntu@98.82.136.20
```

Edit the environment file:

```bash
sudo nano /etc/hbnb.env
```

Update the `ALLOWED_ORIGINS` line:

```env
ALLOWED_ORIGINS=https://d1234abcd.cloudfront.net,http://98.82.136.20
```

(Replace `d1234abcd.cloudfront.net` with your actual CloudFront domain)

Save and exit (Ctrl+X, Y, Enter)

### 5.3 Restart Backend Service

```bash
sudo systemctl restart hbnb
sudo systemctl status hbnb
```

Exit SSH:
```bash
exit
```

**✓ Checkpoint:** Your backend now accepts requests from CloudFront!

---

## Step 6: Test Your Deployment

### 6.1 Test Frontend

1. Open your CloudFront URL: `https://d1234abcd.cloudfront.net`
2. Verify the homepage loads
3. Check browser console for any errors
4. Test navigation between pages

### 6.2 Test API Integration

1. Try logging in (if you have authentication)
2. Test CRUD operations (create, read, update, delete)
3. Check browser Network tab to verify API calls go to `http://98.82.136.20`

### 6.3 Test from Different Locations

CloudFront is a CDN, so test from different devices/networks to verify it's working globally.

---

## Step 7: Update Frontend (After Changes)

When you make changes to your frontend:

### 7.1 Rebuild and Upload

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://hbnb-frontend/ --delete
```

### 7.2 Invalidate CloudFront Cache

Your changes won't appear immediately due to CloudFront caching.

**Option A: Using Console**
1. Go to CloudFront → Your distribution
2. **Invalidations** tab → **Create invalidation**
3. **Object paths:** `/*` (invalidate everything)
4. Click **Create**

**Option B: Using AWS CLI**
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

Wait 1-2 minutes for invalidation to complete.

**✓ Checkpoint:** Refresh your CloudFront URL - changes should appear!

---

## Troubleshooting

### Frontend loads but shows blank page
- Check browser console for errors
- Verify API_URL is correctly set to your backend IP
- Check CORS settings on backend

### API calls fail with CORS error
- Verify `ALLOWED_ORIGINS` in `/etc/hbnb.env` includes your CloudFront domain
- Restart backend service: `sudo systemctl restart hbnb`
- Check if using `https://` for CloudFront URL (not `http://`)

### 404 errors on page refresh
- Make sure you created custom error responses (Step 4.4)
- Both 403 and 404 should redirect to `/index.html` with 200 status

### Changes don't appear after updating S3
- Create a CloudFront invalidation (Step 7.2)
- Or wait 24 hours for cache to expire (not recommended)

### S3 bucket policy rejected
- Verify you unchecked "Block all public access" in bucket settings
- Make sure bucket name in policy matches your actual bucket name

---

## Summary

### Your Deployment URLs:

- **Frontend (CloudFront):** `https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net`
- **Backend API:** `http://98.82.136.20/api/v1/`
- **S3 Website Endpoint:** `http://hbnb-frontend.s3-website-us-east-1.amazonaws.com`

### Architecture:

```
User Browser
     ↓
CloudFront CDN (Global)
     ↓
S3 Bucket (Frontend Static Files)
     ↓ API Calls
EC2 Instance (Backend API)
     ↓
RDS MySQL (Database)
```

### Benefits of This Setup:

- ✅ **Fast:** CloudFront CDN delivers content from edge locations worldwide
- ✅ **Scalable:** S3 + CloudFront handle unlimited traffic
- ✅ **Secure:** HTTPS enabled by default on CloudFront
- ✅ **Cost-effective:** Pay only for what you use
- ✅ **Reliable:** 99.99% uptime SLA

---

## Optional: Custom Domain (Advanced)

If you have a custom domain (e.g., `hbnb.yourdomain.com`):

1. **Route 53:** Create hosted zone for your domain
2. **ACM Certificate:** Request SSL certificate in `us-east-1`
3. **CloudFront:** Add custom domain as alternate domain name (CNAME)
4. **Route 53:** Create A record (Alias) pointing to CloudFront

---

## Next Steps

1. ✅ Follow this guide to deploy frontend
2. Test thoroughly
3. Monitor CloudFront usage in AWS Console
4. Consider setting up CI/CD for automated deployments

**Good luck with your deployment!** 🚀
