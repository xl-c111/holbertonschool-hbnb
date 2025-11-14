# Free AWS Deployment Guide

This guide walks you through deploying the HBnB application **100% FREE** using AWS Free Tier and other free services.

## Architecture Overview

```
Frontend (HTML/CSS/JS) → AWS Amplify (Free forever)
Backend (Flask API)    → Railway.app or Render.com (Free tier)
Database (MySQL)       → Railway MySQL or AWS RDS (Free tier)
```

---

## Option 1: Railway.app (Easiest - Recommended)

### Why Railway?
- ✅ **Truly free** ($5 credit/month - enough for small apps)
- ✅ **Includes MySQL** database
- ✅ **One-click deployment**
- ✅ **Auto-deploys** from GitHub
- ✅ **No credit card** required initially

### Step-by-Step Deployment

#### 1. Deploy Backend to Railway

**A. Sign up:**
```
Visit: https://railway.app
Sign up with GitHub (free)
```

**B. Create new project:**
```
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your holbertonschool-hbnb repository
4. Choose "backend" as root directory
```

**C. Configure environment variables:**
```
Click on your service → Variables → Add variables:

FLASK_ENV=production
SECRET_KEY=<generate-with-command-below>
DATABASE_URL=${{MySQL.DATABASE_URL}}
ALLOWED_ORIGINS=https://your-app.amplifyapp.com
JWT_SECRET_KEY=<another-random-secret>
```

Generate secrets:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**D. Add MySQL database:**
```
1. Click "New" → "Database" → "Add MySQL"
2. Railway automatically sets DATABASE_URL
3. Wait for database to provision (~2 minutes)
```

**E. Update start command:**
```
Settings → Deploy → Custom Start Command:
cd backend && gunicorn --bind 0.0.0.0:$PORT --workers 2 run:app
```

**F. Deploy:**
```
1. Click "Deploy"
2. Wait 2-3 minutes
3. Get your backend URL: https://your-app.up.railway.app
```

#### 2. Test Backend

```bash
# Test health (create this endpoint first - see improvements below)
curl https://your-app.up.railway.app/api/v1/

# Test registration
curl -X POST https://your-app.up.railway.app/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

#### 3. Deploy Frontend to AWS Amplify

**A. Prepare frontend:**

Update `frontend/js/scripts.js` - change API URL:
```javascript
// Replace localhost with your Railway backend URL
const API_BASE_URL = 'https://your-app.up.railway.app';
```

**B. Deploy via AWS Amplify Console (No CLI needed):**

```
1. Go to: https://console.aws.amazon.com/amplify/
2. Click "New app" → "Host web app"
3. Choose GitHub
4. Authorize AWS Amplify
5. Select repository: holbertonschool-hbnb
6. Branch: main
7. App name: hbnb-frontend
8. Build settings:
   - Framework: None
   - Build command: (leave empty)
   - Base directory: frontend
   - Output directory: (leave empty)
9. Click "Save and deploy"
10. Wait 2-3 minutes
```

**C. Get your frontend URL:**
```
https://main.xxxxxx.amplifyapp.com
```

#### 4. Update CORS Settings

Go back to Railway → Backend → Variables:
```
ALLOWED_ORIGINS=https://main.xxxxxx.amplifyapp.com
```

Redeploy backend (it will auto-restart).

#### 5. Initialize Database Tables

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migration
railway run python backend/run.py
```

**Option B: Using Python locally**
```python
# Create init_db.py in backend folder
from app import create_app
from app.extensions import db

app = create_app("config.ProductionConfig")
with app.app_context():
    db.create_all()
    print("Database tables created!")
```

Then run locally (connects to Railway DB):
```bash
export DATABASE_URL="<copy-from-railway>"
cd backend
python init_db.py
```

---

## Option 2: Render.com (Alternative)

### Why Render?
- ✅ **Free tier** for web services
- ✅ **750 hours/month** free
- ✅ **Auto-deploy** from GitHub
- ✅ **Simpler** than AWS EC2

### Quick Steps:

```
1. Sign up: https://render.com (use GitHub)
2. New → Web Service
3. Connect holbertonschool-hbnb repo
4. Settings:
   - Name: hbnb-backend
   - Root Directory: backend
   - Build Command: pip install -r requirements-prod.txt
   - Start Command: gunicorn --bind 0.0.0.0:$PORT run:app
5. Add Environment Variables (same as Railway)
6. Create PostgreSQL database (free tier)
7. Deploy
```

**Note:** Render free tier has limitations:
- Spins down after 15 min of inactivity
- Cold starts (~30 seconds)

---

## Option 3: AWS Free Tier (EC2 + RDS)

### Why AWS EC2?
- ✅ **750 hours/month** free for 12 months
- ✅ **Complete control**
- ✅ **Resume-worthy** (shows AWS experience)
- ❌ **More complex** setup

### Quick Steps:

#### 1. Launch EC2 Instance
```
1. Go to EC2 Console
2. Launch Instance
3. Choose: Ubuntu Server 22.04 LTS
4. Instance type: t2.micro (free tier)
5. Create key pair (download .pem file)
6. Security group:
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow Custom TCP (port 5000) from anywhere
7. Launch
```

#### 2. Connect to EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

#### 3. Setup Backend
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python & MySQL client
sudo apt install python3-pip python3-venv mysql-client -y

# Clone your repo
git clone https://github.com/YOUR_USERNAME/holbertonschool-hbnb.git
cd holbertonschool-hbnb/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements-prod.txt

# Create .env file
cat > .env << EOF
FLASK_ENV=production
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
DATABASE_URL=mysql+mysqlconnector://admin:password@your-rds-endpoint/hbnb_db
ALLOWED_ORIGINS=https://your-amplify-url.amplifyapp.com
EOF

# Run with gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 2 run:app
```

#### 4. Setup RDS MySQL (Free Tier)
```
1. Go to RDS Console
2. Create database
3. Engine: MySQL 8.0
4. Templates: Free tier
5. DB instance: db.t3.micro
6. Master username: admin
7. Password: (set strong password)
8. Public access: Yes
9. Security group: Allow MySQL (3306) from EC2 security group
10. Create database
```

#### 5. Keep Backend Running (systemd)
```bash
# Create service file
sudo nano /etc/systemd/system/hbnb.service
```

Add:
```ini
[Unit]
Description=HBnB Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/holbertonschool-hbnb/backend
Environment="PATH=/home/ubuntu/holbertonschool-hbnb/backend/venv/bin"
ExecStart=/home/ubuntu/holbertonschool-hbnb/backend/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 run:app

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl enable hbnb
sudo systemctl start hbnb
sudo systemctl status hbnb
```

---

## Post-Deployment Checklist

### ✅ Backend Verification
```bash
# Check API is running
curl https://your-backend-url/api/v1/

# Test user registration
curl -X POST https://your-backend-url/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Demo",
    "last_name": "User",
    "email": "demo@example.com",
    "password": "SecurePass123!"
  }'

# Test login
curl -X POST https://your-backend-url/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "SecurePass123!"
  }'
```

### ✅ Frontend Verification
```
1. Visit your Amplify URL
2. Register a new account
3. Login
4. Create a place
5. Add review
6. Check browser console for errors
```

### ✅ Database Verification
```bash
# Railway: Use built-in MySQL client in dashboard
# RDS: Connect from local machine
mysql -h your-rds-endpoint -u admin -p

USE hbnb_db;
SHOW TABLES;
SELECT * FROM users;
```

---

## Cost Breakdown (All Free!)

| Service | Free Tier | Cost After Free Tier |
|---------|-----------|---------------------|
| **AWS Amplify** | Unlimited (static hosting) | Always free |
| **Railway.app** | $5 credit/month | $5/month if exceeded |
| **Render.com** | 750 hours/month | Always free (with limits) |
| **AWS EC2** | 750 hours/month (12 months) | ~$8/month after |
| **AWS RDS** | 750 hours/month (12 months) | ~$15/month after |

**Recommended for staying free:**
- Frontend: AWS Amplify (always free)
- Backend: Railway or Render (stays free with limits)
- Database: Railway MySQL (stays free)

---

## Troubleshooting

### Backend won't start
```bash
# Check logs on Railway
Railway Dashboard → Deployments → View logs

# Check environment variables
Make sure DATABASE_URL is set correctly
```

### Database connection fails
```bash
# Test connection
python3 -c "import mysql.connector; print('OK')"

# Check DATABASE_URL format
mysql+mysqlconnector://user:password@host:port/database
```

### CORS errors in browser
```javascript
// Update backend/app/__init__.py
ALLOWED_ORIGINS=https://your-exact-amplify-url.amplifyapp.com

// Update frontend API URL in js/scripts.js
const API_BASE_URL = 'https://your-backend-url';
```

### Frontend shows old code
```
Amplify auto-deploys on git push
Make sure you pushed your changes:
git add .
git commit -m "Update API URL"
git push origin main
```

---

## Interview Talking Points

When discussing deployment in interviews:

1. **"I deployed a full-stack app using AWS Amplify for frontend and Railway for backend"**
   - Shows cloud deployment experience
   - Demonstrates understanding of separation of concerns

2. **"I chose Railway because it includes managed MySQL and auto-deploys from GitHub"**
   - Shows cost-consciousness and pragmatism
   - Demonstrates CI/CD understanding

3. **"I configured CORS security to only allow my frontend domain in production"**
   - Shows security awareness
   - Demonstrates environment-specific configuration

4. **"I used gunicorn with 2 workers for production deployment"**
   - Shows understanding of WSGI servers vs development servers
   - Demonstrates production best practices

5. **"The app automatically redeploys when I push to main branch"**
   - Shows modern DevOps practices
   - Demonstrates automation mindset

---

## Next Steps for Interview Readiness

After deployment, add these improvements:

1. ✅ **Custom Domain** (Optional)
   - Buy domain on Namecheap ($1/year .com domains for students)
   - Add to Amplify (free SSL included)

2. ✅ **Monitoring**
   - Railway has built-in metrics
   - Add logging for errors

3. ✅ **CI/CD Badge**
   - Add deployment status badge to README

4. ✅ **Demo Account**
   - Create demo@example.com account
   - Add credentials to README for interviewers

---

## Support & Resources

- Railway Docs: https://docs.railway.app
- AWS Amplify Docs: https://docs.amplify.aws
- Render Docs: https://render.com/docs
- AWS Free Tier: https://aws.amazon.com/free

**Questions?** Check the troubleshooting section or create an issue on GitHub.
