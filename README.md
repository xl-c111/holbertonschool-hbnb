# HBnB Evolution

A full-stack two-sided marketplace rental platform built with Flask, React-like vanilla JavaScript, and deployed on AWS. Users can list properties, browse listings, and leave reviews - similar to Airbnb.

> **🚀 [View Live Demo](https://d2gfqpg21nkiyl.cloudfront.net)** | Deployed on AWS with CloudFront

---

## Architecture

### AWS Infrastructure
- **Frontend:** S3 + CloudFront (global CDN)
- **Backend:** EC2 instance + Application Load Balancer
- **Database:** RDS MySQL (Multi-AZ for high availability)
- **CDN:** CloudFront for both frontend and backend API
- **IaC:** Terraform for infrastructure management

### Tech Stack
**Backend:**
- Python 3.13, Flask, SQLAlchemy
- JWT authentication with bcrypt
- RESTful API with flask-restx
- MySQL database

**Frontend:**
- Vanilla JavaScript (component-based architecture)
- Vite build system
- CSS3 with custom properties
- Responsive design

**DevOps:**
- Terraform for infrastructure as code
- AWS CloudWatch for monitoring
- Environment-based configuration

---

## Quick Start

1. **Database**
   ```bash
   # Install MySQL if you don't have it yet
   brew install mysql

   # Start MySQL
   brew services start mysql
   mysql -u root

   # Inside MySQL prompt:
   CREATE USER IF NOT EXISTS 'hbnb_user'@'localhost' IDENTIFIED BY '1234';
   GRANT ALL PRIVILEGES ON *.* TO 'hbnb_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;

   # Import schema
   mysql -u root < docs/hbnb_db.sql
   ```

2. **Backend**
```bash
cd backend

# Setup environment variables
cp .env.example .env
# Edit .env with your MySQL credentials if different from defaults

# Install Python dependencies inside a virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start services
python3 ../scripts/add_sample_data.py  # Add test data
python3 run.py                          # Start API at http://127.0.0.1:5000
```

3. **Frontend**
   ```bash
   cd frontend
   python3 -m http.server 3000
   # Visit http://localhost:3000
   ```

---

## Key Features

### Two-Sided Marketplace
- **Host Mode:** Any user can list properties for rent
- **Guest Mode:** Browse and review places (same account, different roles)
- **Business Logic:** Users cannot review their own properties

### Authentication & Security
- JWT token-based authentication
- Bcrypt password hashing
- HTTPS/SSL via CloudFront
- Environment-based configuration

### Core Functionality
- **Places:** CRUD operations for property listings
- **Reviews:** Rating and review system (1-5 stars)
- **Amenities:** Tag places with amenities
- **Filtering:** Price range and amenity filters
- **Public Browsing:** View listings without authentication

### Code Quality
- Layered architecture (models → repositories → facade → API)
- RESTful API design with proper HTTP status codes
- Input validation and error handling
- Automated testing with pytest
- Interactive API documentation

---

## Live Demo Testing

**Test Flow:**
1. **Register** - Create account (password: min 8 chars, uppercase, lowercase, number, special char)
2. **List a Property** - Click "List Your Place" → fill form → submit
3. **Browse** - View all listings → filter by price
4. **Review** - Click on a place you don't own → leave a review
5. **Logout** - Test authentication flow

**Business Rules to Test:**
- ✅ Can list multiple properties
- ✅ Can browse all listings
- ✅ Cannot review own properties
- ✅ Cannot duplicate reviews
- ✅ Must be logged in to list or review

---

## Running Tests
```bash
cd backend && python3 -m pytest -v
```
Uses in-memory SQLite (no MySQL needed). Tests cover auth, users, places, amenities, reviews, and business rules.

## Project Structure

```
backend/
├── app/
│   ├── api/v1/          # API endpoints (users, places, reviews, amenities)
│   ├── models/          # SQLAlchemy models
│   ├── persistence/     # Repository pattern implementation
│   ├── services/        # Facade service layer
│   └── extensions.py    # Flask extensions (db, bcrypt, jwt)
├── tests/               # Pytest test suite
└── run.py              # Application entry point

frontend/
├── src/
│   ├── api/            # API client and endpoints
│   ├── auth/           # Authentication utilities
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page controllers (home, login, place, etc.)
│   ├── styles/         # CSS modules
│   └── utils/          # Validation, cookies, helpers
├── *.html              # HTML entry points
└── vite.config.js      # Build configuration

terraform/
├── main.tf             # AWS infrastructure (EC2, RDS, S3, CloudFront)
└── .gitignore          # Exclude providers and state files

docs/                   # Database schema and API documentation
scripts/                # Setup and utility scripts
```

## Deployment

### AWS Resources (Managed by Terraform)
- **Frontend:** S3 bucket + CloudFront distribution
- **Backend:** EC2 t3.micro (Ubuntu) + CloudFront
- **Database:** RDS MySQL (db.t3.micro)
- **Networking:** VPC, Security Groups, Internet Gateway

### Deploy Frontend
```bash
cd frontend
npm run build                    # Build with Vite
aws s3 sync dist/ s3://hbnb-frontend/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Deploy Backend
```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Pull latest code and restart
cd /home/ubuntu/holbertonschool-hbnb
git pull origin main
sudo systemctl restart hbnb
```

## Troubleshooting

**Local Development:**
- **Reset DB**: `mysql -u root < docs/hbnb_db.sql && python3 scripts/add_sample_data.py`
- **Free port**: `lsof -ti:5000 | xargs kill -9`

**Production:**
- **Frontend not updating?** Check CloudFront cache invalidation status
- **Backend 502 error?** Check EC2 instance status and application logs
- **Database connection?** Verify RDS security group allows EC2 access

## Roadmap

**✅ Completed:**
- Two-sided marketplace (users can host and review)
- AWS deployment with Terraform
- HTTPS via CloudFront
- JWT authentication
- Place listings and reviews

**🚧 In Progress:**
- Booking/reservation system
- User dashboard (manage listings and bookings)
- Image uploads for places
- Search and advanced filters

**📋 Planned:**
- Automated testing (80%+ coverage)
- Email notifications
- Real-time messaging
- Payment integration (Stripe)
- CI/CD pipeline

See [TECH_INTERVIEW_ROADMAP.md](TECH_INTERVIEW_ROADMAP.md) for detailed implementation plan.

---

**Authors:** Xiaoling Cui & Wawa

**License:** MIT

