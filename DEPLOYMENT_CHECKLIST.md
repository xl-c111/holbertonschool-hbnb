# AWS Deployment Checklist

## Progress Tracker

### ✅ Completed Steps
- [x] Verify AWS credentials and region configuration
- [x] Create RDS MySQL database instance
  - DB identifier: `hbnb-db`
  - Username: `admin`
  - Password: [SAVED SECURELY]
  - Database name: `hbnb_db`
  - Status: Creating (wait 5-10 minutes for "Available" status)

### 📋 Next Steps

#### 1. ☐ Get RDS Endpoint
**When database status is "Available":**
1. Go to RDS Dashboard → Databases
2. Click on `hbnb-db`
3. Copy the **Endpoint** (looks like: `hbnb-db.xxxxxxx.us-east-1.rds.amazonaws.com`)
4. Note the **Port**: `3306`

**Your DATABASE_URL will be:**
```
mysql+mysqlconnector://admin:YOUR_PASSWORD@YOUR_ENDPOINT:3306/hbnb_db
```

#### 2. ☐ Configure RDS Security Group
1. Go to RDS → Databases → hbnb-db
2. Click on the VPC security group: `hbnb-db-sg`
3. Edit inbound rules → Add rule:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: 0.0.0.0/0 (or your IP for testing)
   - Description: Allow MySQL connections

#### 3. ☐ Create EC2 Instance
1. Go to EC2 Dashboard → Launch Instance
2. **Name:** `hbnb-backend`
3. **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
4. **Instance type:** t2.micro (Free tier eligible)
5. **Key pair:** Create new or use existing (IMPORTANT: Download .pem file!)
6. **Network settings:**
   - VPC: Default VPC (same as RDS)
   - Auto-assign public IP: Enable
   - Create security group: `hbnb-ec2-sg`
   - Inbound rules:
     - SSH (22): My IP (for security)
     - HTTP (80): 0.0.0.0/0
     - HTTPS (443): 0.0.0.0/0
     - Custom TCP (5000): 0.0.0.0/0 (for testing)
7. **Storage:** 8 GB gp2 (default, free tier)
8. Click **Launch Instance**

#### 4. ☐ Connect to EC2 Instance
```bash
# Make sure your .pem file has correct permissions
chmod 400 your-key-pair.pem

# Connect to EC2
ssh -i your-key-pair.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

#### 5. ☐ Set Up EC2 Environment
Run these commands on your EC2 instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install -y python3 python3-pip python3-venv git nginx

# Clone your repository
cd /home/ubuntu
git clone https://github.com/xl-c111/holbertonschool-hbnb.git
cd holbertonschool-hbnb/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements-prod.txt
```

#### 6. ☐ Configure .env File on EC2
Create the `.env` file with your actual credentials:

```bash
cd /home/ubuntu/holbertonschool-hbnb/backend

# Create .env file
nano .env
```

Add this content (replace with your actual values):
```env
FLASK_ENV=production
SECRET_KEY=your-generated-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=mysql+mysqlconnector://admin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:3306/hbnb_db
ALLOWED_ORIGINS=*
```

**Generate secret keys:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Save and exit (Ctrl+X, Y, Enter)

#### 7. ☐ Initialize Database
```bash
cd /home/ubuntu/holbertonschool-hbnb/backend
source venv/bin/activate
python init_db.py
```

#### 8. ☐ Set Up systemd Service
Create systemd service file:

```bash
sudo nano /etc/systemd/system/hbnb.service
```

Add this content:
```ini
[Unit]
Description=HBnB Flask Application
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/holbertonschool-hbnb/backend
Environment="PATH=/home/ubuntu/holbertonschool-hbnb/backend/venv/bin"
ExecStart=/home/ubuntu/holbertonschool-hbnb/backend/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 run:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable hbnb
sudo systemctl start hbnb
sudo systemctl status hbnb
```

#### 9. ☐ Configure Nginx as Reverse Proxy
Create nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/hbnb
```

Add this content:
```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/hbnb /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default config
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

#### 10. ☐ Test Backend API
```bash
# From your local machine
curl http://YOUR_EC2_PUBLIC_IP/api/v1/

# Or visit in browser:
# http://YOUR_EC2_PUBLIC_IP/api/v1/
```

#### 11. ☐ Set Up S3 + CloudFront for Frontend (Optional)
This is optional - you can serve frontend from EC2 for now.

If you want to use S3 + CloudFront:
1. Create S3 bucket for static hosting
2. Upload frontend files
3. Create CloudFront distribution
4. Update ALLOWED_ORIGINS in backend .env

---

## Useful Commands

### Check Service Status
```bash
sudo systemctl status hbnb
sudo systemctl status nginx
```

### View Logs
```bash
# Application logs
sudo journalctl -u hbnb -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart Services
```bash
sudo systemctl restart hbnb
sudo systemctl restart nginx
```

### Update Deployment
When you push changes to GitHub:
```bash
cd /home/ubuntu/holbertonschool-hbnb/backend
git pull origin main
source venv/bin/activate
pip install -r requirements-prod.txt
sudo systemctl restart hbnb
```

---

## Important Information to Save

**RDS Database:**
- Endpoint: [COPY FROM AWS CONSOLE]
- Port: 3306
- Database name: hbnb_db
- Username: admin
- Password: [YOUR PASSWORD]

**EC2 Instance:**
- Public IP: [COPY FROM AWS CONSOLE]
- Private IP: [COPY FROM AWS CONSOLE]
- Key pair: [NAME OF YOUR .PEM FILE]

**Security Groups:**
- RDS: hbnb-db-sg
- EC2: hbnb-ec2-sg

---

## Troubleshooting

### Database Connection Issues
```bash
# Test connection from EC2
mysql -h YOUR_RDS_ENDPOINT -u admin -p hbnb_db
```

### Service Not Starting
```bash
# Check logs
sudo journalctl -u hbnb -n 50 --no-pager

# Check if port is in use
sudo lsof -i :5000
```

### Nginx Issues
```bash
# Test nginx config
sudo nginx -t

# Check nginx status
sudo systemctl status nginx
```

---

**Created:** 2025-11-14
**Last Updated:** 2025-11-14
