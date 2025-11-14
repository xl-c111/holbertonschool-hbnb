# AWS Native Deployment Guide (100% Free)

## Architecture Overview

This guide deploys the HBnB application using AWS native services while staying within the free tier.

```
User Request
    ↓
CloudFront (CDN) → S3 Bucket (Frontend - HTML/CSS/JS)
    ↓
Application Load Balancer (Optional)
    ↓
EC2 Instance (Backend - Flask API)
    ↓
RDS MySQL (Database)
```

---

## AWS Services Used

| Service | Purpose | Free Tier | Interview Value |
|---------|---------|-----------|----------------|
| **EC2** | Host Flask backend | 750 hrs/month (12 months) | Server management, Linux, systemd |
| **RDS** | MySQL database | 750 hrs/month (12 months) | Managed databases, backups |
| **S3** | Static frontend hosting | 5GB storage (always free) | Object storage, static hosting |
| **CloudFront** | CDN for HTTPS | 50GB transfer (always free) | CDN, edge locations, HTTPS |
| **VPC** | Network isolation | Always free | Networking, subnets, routing |
| **Security Groups** | Firewall rules | Always free | Network security |
| **Route 53** | DNS (optional) | $0.50/month per hosted zone | DNS management |

---

## Prerequisites

- AWS Account (sign up at https://aws.amazon.com)
- Credit/debit card (for verification - won't be charged in free tier)
- SSH client (Terminal on Mac/Linux, PuTTY on Windows)
- Git installed locally

---

## Phase 1: VPC and Network Setup

### Why Start Here?
Proper network architecture is crucial for security. This shows you understand infrastructure fundamentals.

### Steps:

**1. Create VPC (or use default):**
```
AWS Console → VPC → Your VPCs

For learning, we'll use the default VPC to keep it simple.
Note the VPC ID (e.g., vpc-xxxxx)
```

**2. Verify Subnets:**
```
VPC → Subnets

You should see subnets in different availability zones (AZs)
- Public subnets: For EC2 (has internet gateway route)
- Private subnets: For RDS (no direct internet access)
```

**Interview Talking Point:**
"I deployed the backend in a public subnet for internet access, and the database in a private subnet following security best practices."

---

## Phase 2: RDS MySQL Database

### Why Start With Database?
You need the database connection string before deploying the backend.

### Steps:

**1. Create RDS Instance:**
```
AWS Console → RDS → Create database

Engine options:
- Engine type: MySQL
- Version: MySQL 8.0.x (latest)

Templates:
- Select: Free tier ✓

Settings:
- DB instance identifier: hbnb-db
- Master username: admin
- Master password: [Create strong password - SAVE THIS!]

DB instance class:
- db.t3.micro (free tier eligible)

Storage:
- Allocated storage: 20 GB (free tier)
- Storage autoscaling: Disable (to avoid charges)

Connectivity:
- VPC: Use default VPC
- Public access: Yes (for now - you can restrict later)
- VPC security group: Create new
  - Name: hbnb-db-sg

Additional configuration:
- Initial database name: hbnb_db
- Backup retention: 7 days (free tier includes backups)
- Enable Enhanced monitoring: No (costs extra)

Click: Create database
```

**2. Configure Security Group:**
```
Wait for RDS instance to be "Available" (5-10 minutes)

EC2 → Security Groups → Find "hbnb-db-sg"

Inbound rules:
- Type: MySQL/Aurora (port 3306)
- Source: Custom (we'll update this after creating EC2)
  - For now: My IP (to test connection)

Click: Save rules
```

**3. Get Database Endpoint:**
```
RDS → Databases → hbnb-db

Under "Connectivity & security":
- Copy the Endpoint: hbnb-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
```

**4. Test Connection (from your local machine):**
```bash
# Install MySQL client if needed
# Mac: brew install mysql-client
# Ubuntu: sudo apt install mysql-client

# Test connection
mysql -h hbnb-db.xxxxxxxxx.us-east-1.rds.amazonaws.com \
      -u admin -p hbnb_db

# Enter your password when prompted
# If connected, you'll see:
# mysql>

# Verify database
SHOW DATABASES;
USE hbnb_db;
EXIT;
```

**Interview Talking Points:**
- "I used RDS for managed MySQL with automated backups"
- "I configured security groups to restrict database access"
- "I chose t3.micro to stay within free tier limits"

---

## Phase 3: EC2 Backend Deployment

### Create EC2 Instance

**1. Launch Instance:**
```
AWS Console → EC2 → Launch Instance

Name: hbnb-backend

Application and OS Images (Amazon Machine Image):
- Quick Start: Ubuntu
- Ubuntu Server 22.04 LTS (Free tier eligible)

Instance type:
- t2.micro (Free tier eligible)

Key pair (login):
- Click: Create new key pair
- Key pair name: hbnb-key
- Key pair type: RSA
- Private key format: .pem (for Mac/Linux) or .ppk (for Windows/PuTTY)
- Click: Create key pair
- SAVE THE .pem FILE - you can't download it again!

Network settings:
- VPC: default VPC
- Subnet: No preference (default)
- Auto-assign public IP: Enable
- Firewall (security groups): Create new
  - Security group name: hbnb-backend-sg
  - Description: Security group for HBnB backend

Inbound security group rules:
- Rule 1: SSH
  - Type: SSH
  - Port: 22
  - Source: My IP (your current IP)

- Rule 2: HTTP
  - Type: HTTP
  - Port: 80
  - Source: Anywhere (0.0.0.0/0)

- Rule 3: Custom TCP (for Flask during testing)
  - Type: Custom TCP
  - Port: 5000
  - Source: Anywhere (0.0.0.0/0)
  - Note: We'll remove this after nginx setup

Configure storage:
- 8 GB gp3 (free tier includes up to 30GB)

Advanced details:
- Leave as default

Click: Launch instance
```

**2. Wait for instance to start:**
```
Refresh the instances page until:
Instance state: Running
Status check: 2/2 checks passed (takes 2-3 minutes)
```

**3. Note the Public IP:**
```
Select your instance → Copy "Public IPv4 address"
Example: 54.123.45.67
```

**4. Update RDS Security Group:**
```
Now that we have EC2, let's secure the database properly.

EC2 → Security Groups → hbnb-db-sg

Edit inbound rules:
- Remove "My IP" rule
- Add new rule:
  - Type: MySQL/Aurora
  - Source: Custom → Search for "hbnb-backend-sg" (select the security group)
  - Description: Allow from EC2 backend

This means: Only your EC2 instance can access the database!
```

**Interview Talking Point:**
"I configured security groups so the database only accepts connections from the application server, not from the public internet."

---

## Phase 4: Configure EC2 Instance

### Connect to EC2

**1. Set key permissions (Mac/Linux):**
```bash
chmod 400 ~/Downloads/hbnb-key.pem
```

**2. SSH into instance:**
```bash
ssh -i ~/Downloads/hbnb-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Example:
ssh -i ~/Downloads/hbnb-key.pem ubuntu@54.123.45.67

# Type 'yes' when asked about fingerprint
```

**For Windows users:**
```
Use PuTTY:
1. Open PuTTY
2. Host Name: ubuntu@YOUR_EC2_PUBLIC_IP
3. Connection → SSH → Auth → Browse for your .ppk file
4. Click: Open
```

### Setup Backend Application

**3. Update system:**
```bash
sudo apt update && sudo apt upgrade -y
```

**4. Install dependencies:**
```bash
# Python and pip
sudo apt install python3-pip python3-venv -y

# Nginx (web server)
sudo apt install nginx -y

# MySQL client (for testing DB connection)
sudo apt install mysql-client -y

# Git (to clone your repo)
sudo apt install git -y
```

**5. Clone your repository:**
```bash
cd ~
git clone https://github.com/YOUR_USERNAME/holbertonschool-hbnb.git
cd holbertonschool-hbnb/backend
```

**6. Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**7. Install Python packages:**
```bash
pip install --upgrade pip
pip install -r requirements-prod.txt
```

**8. Create environment file:**
```bash
# Generate secure keys first
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
JWT_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

# Create .env file
cat > .env << EOF
FLASK_ENV=production
SECRET_KEY=${SECRET_KEY}
JWT_SECRET_KEY=${JWT_KEY}
DATABASE_URL=mysql+mysqlconnector://admin:YOUR_RDS_PASSWORD@YOUR_RDS_ENDPOINT/hbnb_db
ALLOWED_ORIGINS=https://YOUR_CLOUDFRONT_URL
EOF

# Replace placeholders with actual values
nano .env
```

**Update the .env file:**
```bash
# Replace:
# YOUR_RDS_PASSWORD → Your RDS master password
# YOUR_RDS_ENDPOINT → Your RDS endpoint (from Phase 2, step 3)
# YOUR_CLOUDFRONT_URL → We'll add this later

# Example DATABASE_URL:
# mysql+mysqlconnector://admin:MyPass123!@hbnb-db.xxxxx.us-east-1.rds.amazonaws.com/hbnb_db
```

**9. Test database connection:**
```bash
# From EC2, test RDS connection
mysql -h YOUR_RDS_ENDPOINT -u admin -p hbnb_db

# Should connect successfully!
# Type: EXIT
```

**10. Initialize database tables:**
```bash
# Still in backend directory with venv activated
python3 << 'PYEOF'
from app import create_app
from app.extensions import db

app = create_app("config.ProductionConfig")
with app.app_context():
    db.create_all()
    print("✓ Database tables created successfully!")
PYEOF
```

**11. Test Flask app:**
```bash
# Start Flask temporarily on port 5000
gunicorn --bind 0.0.0.0:5000 run:app

# Keep this running and open new terminal
```

**12. Test from your local machine:**
```bash
# New terminal on your laptop
curl http://YOUR_EC2_PUBLIC_IP:5000/api/v1/

# Should return API info
```

**13. Stop gunicorn (Ctrl+C) and continue**

---

## Phase 5: Production Setup with Nginx

### Why Nginx?
- Handles static files efficiently
- Provides reverse proxy
- Enables HTTPS (with Let's Encrypt)
- Industry standard

### Configure Nginx

**1. Create Nginx configuration:**
```bash
sudo nano /etc/nginx/sites-available/hbnb
```

**Add this content:**
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/hbnb_access.log;
    error_log /var/log/nginx/hbnb_error.log;

    # Proxy to Flask app
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers (adjust as needed)
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;

        # Handle preflight
        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:5000/api/v1/health;
    }
}
```

**2. Enable the site:**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/hbnb /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Should see: "syntax is ok" and "test is successful"

# Restart nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

**3. Create systemd service for Flask:**
```bash
sudo nano /etc/systemd/system/hbnb.service
```

**Add this content:**
```ini
[Unit]
Description=HBnB Flask Application
After=network.target

[Service]
Type=notify
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/holbertonschool-hbnb/backend
Environment="PATH=/home/ubuntu/holbertonschool-hbnb/backend/venv/bin"
EnvironmentFile=/home/ubuntu/holbertonschool-hbnb/backend/.env
ExecStart=/home/ubuntu/holbertonschool-hbnb/backend/venv/bin/gunicorn \
    --bind 127.0.0.1:5000 \
    --workers 2 \
    --timeout 60 \
    --access-logfile /var/log/hbnb/access.log \
    --error-logfile /var/log/hbnb/error.log \
    run:app

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**4. Create log directory:**
```bash
sudo mkdir -p /var/log/hbnb
sudo chown ubuntu:www-data /var/log/hbnb
```

**5. Start the service:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (starts on boot)
sudo systemctl enable hbnb

# Start service
sudo systemctl start hbnb

# Check status
sudo systemctl status hbnb

# Should see: "active (running)"
```

**6. Update EC2 security group:**
```bash
# Now that nginx is handling HTTP on port 80,
# we can remove port 5000 from security group

AWS Console → EC2 → Security Groups → hbnb-backend-sg

Edit inbound rules:
- Remove: Custom TCP Port 5000
- Keep: SSH (22), HTTP (80)

Save rules
```

**7. Test the deployment:**
```bash
# From your laptop
curl http://YOUR_EC2_PUBLIC_IP/api/v1/

# Should return API info through nginx!
```

**Interview Talking Points:**
- "I used nginx as a reverse proxy for the Flask application"
- "I configured systemd to manage the application as a service with automatic restarts"
- "I set up proper logging and process management for production"

---

## Phase 6: Frontend Deployment (S3 + CloudFront)

### Why S3 + CloudFront?
- S3: Cheap, reliable static hosting
- CloudFront: Free HTTPS, global CDN, caching

### Setup S3 Bucket

**1. Create S3 bucket:**
```
AWS Console → S3 → Create bucket

Bucket name: hbnb-frontend-YOUR_NAME
  (must be globally unique - try: hbnb-frontend-xiaoling)

Region: us-east-1 (same as your EC2)

Object Ownership:
- ACLs disabled (recommended)

Block Public Access:
- UNCHECK "Block all public access"
- Check the acknowledgment box
  (We need public access for website hosting)

Versioning: Disable (to save space)

Default encryption: Enable (Server-side encryption with Amazon S3 managed keys)

Click: Create bucket
```

**2. Enable static website hosting:**
```
S3 → Buckets → hbnb-frontend-YOUR_NAME

Properties tab → Scroll to "Static website hosting"

Click: Edit

Static website hosting: Enable
Hosting type: Host a static website
Index document: index.html
Error document: index.html (SPA fallback)

Click: Save changes

Note the "Bucket website endpoint":
http://hbnb-frontend-YOUR_NAME.s3-website-us-east-1.amazonaws.com
```

**3. Set bucket policy:**
```
Permissions tab → Bucket policy → Edit

Add this policy (replace BUCKET_NAME):
```

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::hbnb-frontend-YOUR_NAME/*"
        }
    ]
}
```

**4. Update frontend API URL:**
```bash
# On your laptop
cd ~/holbertonschool-hbnb/frontend/js

# Edit scripts.js
nano scripts.js

# Find: const API_BASE_URL = 'http://127.0.0.1:5000';
# Replace with: const API_BASE_URL = 'http://YOUR_EC2_PUBLIC_IP';

# Save and exit
```

**5. Upload frontend files:**
```bash
# Install AWS CLI
# Mac: brew install awscli
# Ubuntu/WSL: sudo apt install awscli

# Configure AWS CLI
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Region: us-east-1
# Output format: json

# Upload frontend
cd ~/holbertonschool-hbnb/frontend
aws s3 sync . s3://hbnb-frontend-YOUR_NAME/ \
    --exclude ".DS_Store" \
    --exclude "*.md"

# Verify
aws s3 ls s3://hbnb-frontend-YOUR_NAME/
```

**6. Test S3 website:**
```
Open browser: http://hbnb-frontend-YOUR_NAME.s3-website-us-east-1.amazonaws.com

Should see your frontend!
But it's HTTP only (no HTTPS) - CloudFront will fix this.
```

### Setup CloudFront CDN

**7. Create CloudFront distribution:**
```
AWS Console → CloudFront → Create distribution

Origin domain:
- Click in the box → Select your S3 bucket website endpoint
  (NOT the bucket itself, but the website endpoint from step 2)
  Example: hbnb-frontend-YOUR_NAME.s3-website-us-east-1.amazonaws.com

Origin path: Leave blank

Name: hbnb-s3-origin

Enable Origin Shield: No

Default cache behavior:
- Viewer protocol policy: Redirect HTTP to HTTPS
- Allowed HTTP methods: GET, HEAD, OPTIONS
- Cache policy: CachingOptimized

Price class: Use all edge locations (best performance)

Alternate domain name (CNAME): Leave blank (unless you have a custom domain)

Custom SSL certificate: Default CloudFront certificate

Default root object: index.html

Click: Create distribution
```

**8. Wait for deployment:**
```
Status will be "Deploying" for 10-15 minutes
Once complete, status → "Enabled"

Copy the "Distribution domain name":
Example: d1234abcd5678.cloudfront.net
```

**9. Update backend CORS:**
```bash
# SSH back into EC2
ssh -i ~/Downloads/hbnb-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

cd ~/holbertonschool-hbnb/backend

# Edit .env
nano .env

# Update ALLOWED_ORIGINS:
ALLOWED_ORIGINS=https://YOUR_CLOUDFRONT_DOMAIN

# Example:
# ALLOWED_ORIGINS=https://d1234abcd5678.cloudfront.net

# Save and restart service
sudo systemctl restart hbnb
```

**10. Test the full deployment:**
```
Open browser: https://YOUR_CLOUDFRONT_DOMAIN

1. Register a new user
2. Login
3. Create a place
4. Add a review

All should work!
```

**Interview Talking Points:**
- "I deployed the frontend to S3 with CloudFront for HTTPS and global CDN"
- "I configured proper CORS between the CloudFront frontend and EC2 backend"
- "I used CloudFront's free SSL certificate for HTTPS"

---

## Phase 7: Monitoring and Maintenance

### Essential Commands

**Check backend logs:**
```bash
# SSH into EC2
ssh -i ~/Downloads/hbnb-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Application logs
sudo tail -f /var/log/hbnb/error.log

# Nginx logs
sudo tail -f /var/log/nginx/hbnb_error.log

# Service status
sudo systemctl status hbnb
```

**Restart backend:**
```bash
sudo systemctl restart hbnb
sudo systemctl restart nginx
```

**Update code:**
```bash
cd ~/holbertonschool-hbnb/backend
git pull origin main
source venv/bin/activate
pip install -r requirements-prod.txt
sudo systemctl restart hbnb
```

**Update frontend:**
```bash
# On your laptop
cd ~/holbertonschool-hbnb/frontend

# Make changes to frontend files

# Upload to S3
aws s3 sync . s3://hbnb-frontend-YOUR_NAME/ \
    --exclude ".DS_Store" \
    --delete

# Invalidate CloudFront cache (force immediate update)
aws cloudfront create-invalidation \
    --distribution-id YOUR_DISTRIBUTION_ID \
    --paths "/*"
```

**Database backup:**
```bash
# RDS automatically backs up daily
# To create manual snapshot:
AWS Console → RDS → Databases → hbnb-db
Actions → Take snapshot
```

---

## Cost Monitoring

### Staying in Free Tier

**Monitor usage:**
```
AWS Console → Billing Dashboard → Free Tier

Check:
- EC2: < 750 hours/month
- RDS: < 750 hours/month
- S3: < 5GB storage
- CloudFront: < 50GB data transfer
```

**Set up billing alert:**
```
Billing Dashboard → Billing preferences

Check: "Receive Free Tier Usage Alerts"
Email: your-email@example.com

Also set up Cost Budget:
- Budget amount: $1
- Alert threshold: 80% ($0.80)
```

**What happens after 12 months?**
```
EC2 t2.micro: ~$8/month
RDS db.t3.micro: ~$15/month
S3 + CloudFront: ~$1-2/month (for small traffic)

Total: ~$24-25/month

Or migrate to:
- Backend: Railway/Render (free tier)
- Database: Railway MySQL (free tier)
- Frontend: Keep on CloudFront (always free)
```

---

## Interview Preparation

### Architecture Diagram to Draw

```
┌─────────────────────────────────────────────────────┐
│                    User Browser                     │
└────────────┬────────────────────────────────────────┘
             │ HTTPS
             ▼
┌─────────────────────────────────────────────────────┐
│  CloudFront CDN (Edge Locations Worldwide)          │
│  - HTTPS/SSL Termination                            │
│  - Caching                                          │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  S3 Bucket (Static Website Hosting)                 │
│  - index.html, CSS, JS                              │
│  - Public read access                               │
└──────────────────────────┬──────────────────────────┘
                           │ API Calls
                           ▼
              ┌─────────────────────────┐
              │  Internet Gateway       │
              └────────────┬────────────┘
                           │
              ┌────────────▼──────────────┐
              │   VPC (Virtual Network)   │
              │  ┌────────────────────┐   │
              │  │  Public Subnet     │   │
              │  │ ┌────────────────┐ │   │
              │  │ │   EC2 Instance │ │   │
              │  │ │   - Nginx      │ │   │
              │  │ │   - Gunicorn   │ │   │
              │  │ │   - Flask API  │ │   │
              │  │ └────────┬───────┘ │   │
              │  └─────────│──────────┘   │
              │            │               │
              │  ┌─────────▼──────────┐   │
              │  │  Private Subnet    │   │
              │  │ ┌────────────────┐ │   │
              │  │ │  RDS MySQL     │ │   │
              │  │ │  - hbnb_db     │ │   │
              │  │ └────────────────┘ │   │
              │  └────────────────────┘   │
              └───────────────────────────┘
```

### Key Interview Talking Points

**1. Architecture & Design:**
"I deployed a 3-tier architecture on AWS:
- Frontend tier: S3 + CloudFront for static content delivery
- Application tier: EC2 with nginx reverse proxy and gunicorn WSGI server
- Data tier: RDS MySQL in a private subnet for security"

**2. Security:**
"I implemented multiple security layers:
- Database in private subnet, only accessible from application server
- Security groups act as stateful firewalls
- HTTPS everywhere using CloudFront's SSL certificate
- Environment variables for secrets, never committed to git
- Nginx security headers to prevent XSS and clickjacking"

**3. Scalability Considerations:**
"Currently running on a single EC2 instance. To scale, I would:
- Add Application Load Balancer
- Deploy multiple EC2 instances in different AZs
- Use RDS read replicas for read-heavy workloads
- Implement auto-scaling based on CPU metrics
- Add ElastiCache for Redis caching"

**4. High Availability:**
"For production, I'd improve availability by:
- Multi-AZ RDS deployment for automatic failover
- EC2 instances across multiple availability zones
- CloudFront already provides edge caching globally
- Route 53 health checks for DNS failover"

**5. Cost Optimization:**
"I optimized for the free tier by:
- Using t2.micro EC2 (750 hours/month free)
- RDS db.t3.micro with 20GB storage (free tier)
- S3 + CloudFront for frontend (minimal costs)
- Set up billing alerts at $1 threshold
- After free tier, estimated $25/month for always-on service"

**6. DevOps Practices:**
"I implemented:
- Systemd for process management and auto-restart
- Centralized logging to /var/log
- Environment-based configuration
- Automated RDS backups
- Easy deployment with git pull + service restart"

**7. Next Steps for Production:**
"To make this production-ready, I would add:
- CI/CD pipeline with GitHub Actions deploying to EC2
- Infrastructure as Code using Terraform or CloudFormation
- Monitoring with CloudWatch alarms
- Log aggregation with CloudWatch Logs
- SSL certificate from Let's Encrypt or ACM for custom domain
- Database migration tool like Alembic
- Automated testing in CI before deployment"

---

## Troubleshooting Guide

### Backend won't start

**Check logs:**
```bash
sudo journalctl -u hbnb -n 50 --no-pager
sudo tail -50 /var/log/hbnb/error.log
```

**Common issues:**
```bash
# Database connection failed
# → Check RDS security group allows EC2 security group
# → Verify DATABASE_URL in .env is correct
# → Test: mysql -h RDS_ENDPOINT -u admin -p

# Import errors
# → Activate venv: source venv/bin/activate
# → Reinstall: pip install -r requirements-prod.txt

# Permission errors
# → Check file ownership: ls -la
# → Fix: sudo chown -R ubuntu:www-data /home/ubuntu/holbertonschool-hbnb
```

### Nginx errors

**Check config:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Common issues:**
```bash
# 502 Bad Gateway
# → Backend not running: sudo systemctl status hbnb
# → Wrong proxy_pass port in nginx config

# Connection refused
# → Firewall blocking: check security groups
# → Nginx not started: sudo systemctl start nginx
```

### CORS errors

**Update CORS settings:**
```bash
# Edit .env on EC2
nano ~/holbertonschool-hbnb/backend/.env

# Make sure ALLOWED_ORIGINS matches CloudFront URL exactly
# Restart backend
sudo systemctl restart hbnb
```

### Can't SSH into EC2

```bash
# Check key permissions
chmod 400 hbnb-key.pem

# Check security group allows SSH from your IP
# Your IP might have changed!
AWS Console → EC2 → Security Groups → hbnb-backend-sg
Edit inbound rules → SSH → Update "My IP"

# Verify instance is running
AWS Console → EC2 → Instances → Should be "Running"
```

### RDS connection timeout

```bash
# Check security group
EC2 → Security Groups → hbnb-db-sg
Inbound rules should allow MySQL (3306) from hbnb-backend-sg

# Check RDS is available
RDS → Databases → hbnb-db → Status should be "Available"

# Verify endpoint
Make sure you're using the correct RDS endpoint in DATABASE_URL
```

---

## Deployment Checklist

Before telling interviewers about your deployment:

- [ ] EC2 instance running and accessible
- [ ] RDS database accessible from EC2 only
- [ ] Backend service running via systemd
- [ ] Nginx configured and proxying to backend
- [ ] Frontend uploaded to S3
- [ ] CloudFront distribution deployed
- [ ] HTTPS working on CloudFront URL
- [ ] CORS configured correctly
- [ ] Can register and login on frontend
- [ ] Can create places and reviews
- [ ] Logs are accessible and clean
- [ ] No exposed secrets in git
- [ ] Billing alerts set up
- [ ] Architecture diagram prepared
- [ ] Know how to explain each component

---

## Quick Reference

### SSH to EC2
```bash
ssh -i ~/Downloads/hbnb-key.pem ubuntu@YOUR_EC2_IP
```

### Restart backend
```bash
sudo systemctl restart hbnb
```

### View logs
```bash
sudo tail -f /var/log/hbnb/error.log
```

### Update frontend
```bash
aws s3 sync . s3://hbnb-frontend-YOUR_NAME/
```

### Your URLs
```
Frontend: https://YOUR_CLOUDFRONT_DOMAIN
Backend: http://YOUR_EC2_PUBLIC_IP
API Docs: http://YOUR_EC2_PUBLIC_IP/api/v1/
```

---

## Additional Resources

- [AWS Free Tier](https://aws.amazon.com/free)
- [EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Guide](https://docs.aws.amazon.com/cloudfront/)

---

## Summary

You've now deployed a production-grade application using:
- **5 AWS services** (EC2, RDS, S3, CloudFront, VPC)
- **Industry-standard tools** (nginx, gunicorn, systemd)
- **Security best practices** (private subnets, security groups, HTTPS)
- **Free tier** (12 months free for compute/database)

This demonstrates to interviewers that you understand:
- Cloud infrastructure
- Network architecture
- Security fundamentals
- Production deployment
- Linux server administration

**Estimated time to deploy:** 2-3 hours for first time

**Cost:** $0 for 12 months, then ~$25/month

Good luck with your interviews!
