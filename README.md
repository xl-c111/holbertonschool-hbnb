# HBnB - Luxe Airbnb Clone

A production-ready two-sided marketplace rental platform demonstrating full-stack development with React, Flask, and AWS deployment. Implements Stripe payment processing, JWT authentication, multi-tenant architecture, and real-time booking management with comprehensive host analytics.

<div align="center">

**🚀 [View Live Demo](https://d2gfqpg21nkiyl.cloudfront.net)** | Deployed on AWS with CloudFront - mobile-ready

![HBnB screenshot](frontend/public/hbnb.png)

</div>

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
- MySQL database with multi-tenant schema
- Stripe Payment Intents API

**Frontend:**
- React 18 with modern hooks
- Vite build system
- Tailwind CSS for styling
- React Router for navigation
- Stripe Elements for payment UI
- React DatePicker for booking dates

**DevOps:**
- Terraform for infrastructure as code
- AWS CloudWatch for monitoring
- Environment-based configuration (.env files)

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
# Add your Stripe keys to .env:
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...

# Install Python dependencies inside a virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Add sample data (creates 3 hosts, 6 properties, 3 guests, 6 reviews)
python3 ../scripts/add_sample_data.py

# Start API server
python3 run.py  # Runs at http://127.0.0.1:5000
```

3. **Frontend**
   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Setup environment variables
   # Create .env.development with:
   # VITE_API_URL=http://localhost:5000
   # VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Start development server
   npm run dev  # Runs at http://localhost:5173
   ```

---

## Key Features

### Multi-Tenant Property Management
- **Host Dashboard:** Manage multiple properties with individual analytics
- **Revenue Tracking:** Real-time upcoming revenue, total earnings, and top performers
- **Booking Management:** Confirm/decline booking requests with status tracking
- **Property CRUD:** Create, edit, and delete listings with validation

### Complete Booking System
- **Availability Checking:** Real-time date conflict detection
- **Booking Lifecycle:** Pending → Confirmed → Completed workflow
- **Payment Integration:** Stripe checkout with Payment Intents verification
- **Guest Management:** View upcoming guests and check-in dates

### Review & Rating System
- **Submit Reviews:** Authenticated users can rate and review properties
- **Display Reviews:** Property pages show all reviews with user names and ratings
- **Business Rules:** Users cannot review their own properties or duplicate reviews
- **Star Ratings:** Visual 5-star rating system with aggregated scores

### Authentication & Security
- **JWT Tokens:** Secure token-based authentication
- **Password Security:** Bcrypt hashing with strength validation
- **Role-Based Access:** Host vs guest permission separation
- **Payment Verification:** Server-side Stripe payment validation before booking creation

### User Experience
- **Responsive Design:** Mobile-first UI with Tailwind CSS
- **Custom Date Picker:** Styled calendar matching site aesthetic
- **Real-time Feedback:** Loading states, error handling, success messages
- **Public Browsing:** View listings without authentication

---

## Live Demo Testing

**Test Accounts (All passwords: `Strongpass123!`):**

**Host Accounts:**
- `john.doe@example.com` - 3 luxury properties
- `sarah.chen@example.com` - 2 coastal/mountain properties
- `mike.johnson@example.com` - 1 cozy cabin

**Guest Accounts:**
- `emma.wilson@example.com`
- `alex.martinez@example.com`
- `lisa.anderson@example.com`

**Test Flow:**
1. **Host Flow:**
   - Login as a host → View "Host" page
   - See revenue dashboard (upcoming revenue, total earnings, top earner)
   - View incoming guests and booking requests
   - Confirm/decline bookings
   - Edit property details (title, description, price)

2. **Guest Flow:**
   - Login as a guest → Browse properties
   - Select property → Check availability for dates
   - Complete Stripe payment (test card: `4242 4242 4242 4242`)
   - View booking confirmation

3. **Review Flow:**
   - View property details → See existing reviews
   - Leave a review for properties you've stayed at
   - Star rating + written feedback

**Stripe Test Card:**
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

---

<details>
<summary><strong>Project Structure</strong></summary>

```
backend/
├── app/
│   ├── api/v1/
│   │   ├── auth.py          # Login/register endpoints
│   │   ├── users.py         # User management
│   │   ├── places.py        # Property listings with reviews
│   │   ├── bookings.py      # Booking lifecycle + availability
│   │   ├── payments.py      # Stripe payment intents
│   │   ├── reviews.py       # Review CRUD operations
│   │   └── amenities.py     # Amenity management
│   ├── models/              # SQLAlchemy models
│   ├── persistence/         # Repository pattern implementation
│   ├── services/            # Facade service layer
│   └── extensions.py        # Flask extensions (db, bcrypt, jwt)
├── tests/                   # Pytest test suite
└── run.py                  # Application entry point

frontend/
├── src/
│   ├── api/                # API client utilities
│   ├── components/
│   │   ├── navigation.tsx   # Main navigation
│   │   ├── property-detail.tsx       # Property page with booking
│   │   ├── property-reviews.tsx      # Review display
│   │   ├── booking-form.tsx          # Stripe payment integration
│   │   ├── stripe-checkout-form.tsx  # Payment form
│   │   └── listings-grid.tsx         # Property grid
│   ├── pages/
│   │   ├── HomePage.jsx     # Landing page
│   │   ├── PropertyPage.jsx # Property detail view
│   │   ├── BookingPage.jsx  # Checkout page
│   │   ├── HostPage.jsx     # Host dashboard
│   │   └── ProfilePage.jsx  # User profile
│   ├── contexts/
│   │   └── AuthContext.jsx  # Authentication state
│   ├── data/
│   │   └── properties.js    # Frontend metadata enrichment
│   └── styles/
│       └── datepicker-custom.css  # Custom calendar styling
├── index.html
└── vite.config.js

scripts/
├── add_sample_data.py      # Populate DB with test data
└── cleanup_test_places.py  # Remove test properties

terraform/
├── main.tf                 # AWS infrastructure (EC2, RDS, S3, CloudFront)
└── .gitignore             # Exclude providers and state files
```

</details>

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create new user
- `POST /api/v1/auth/login` - Get JWT token

### Properties
- `GET /api/v1/places/` - List all properties
- `POST /api/v1/places/` - Create property (JWT required)
- `GET /api/v1/places/{id}` - Get property details
- `PUT /api/v1/places/{id}` - Update property (owner only)
- `DELETE /api/v1/places/{id}` - Delete property (owner only)
- `GET /api/v1/places/{id}/reviews` - Get property reviews

### Bookings
- `GET /api/v1/bookings/` - Get user's bookings (JWT required)
- `POST /api/v1/bookings/` - Create booking with payment verification
- `POST /api/v1/bookings/availability/check` - Check date availability
- `PUT /api/v1/bookings/{id}/confirm` - Confirm booking (host only)
- `DELETE /api/v1/bookings/{id}` - Cancel booking

### Payments
- `POST /api/v1/payments/create-payment-intent` - Create Stripe payment (JWT required)

### Reviews
- `POST /api/v1/reviews/` - Submit review (JWT required)
- `GET /api/v1/reviews/` - List all reviews
- `PUT /api/v1/reviews/{id}` - Update review (author only)
- `DELETE /api/v1/reviews/{id}` - Delete review (author only)

---

## Deployment

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

---

## Running Tests
```bash
cd backend && python3 -m pytest -v
```
Uses in-memory SQLite (no MySQL needed). Tests cover auth, users, places, amenities, reviews, and business rules.

---

## Troubleshooting

**Local Development:**
- **Reset DB**: `mysql -u root < docs/hbnb_db.sql && python3 scripts/add_sample_data.py`
- **Free port**: `lsof -ti:5000 | xargs kill -9` (backend) or `lsof -ti:5173 | xargs kill -9` (frontend)
- **Frontend won't start**: `cd frontend && rm -rf node_modules && npm install`

**Production:**
- **Frontend not updating?** Check CloudFront cache invalidation status
- **Backend 502 error?** Check EC2 instance status and application logs
- **Database connection?** Verify RDS security group allows EC2 access
- **Payment failing?** Verify Stripe API keys are correct in backend `.env`

---

## Feature Roadmap

**✅ Completed:**
- Multi-tenant property management system
- Complete booking lifecycle (pending → confirmed → completed)
- Stripe payment integration with verification
- Host dashboard with revenue analytics
- Review submission and display system
- JWT authentication with role-based access
- AWS deployment with Terraform
- HTTPS via CloudFront
- Responsive React UI with Tailwind CSS
- Real-time availability checking

**🚧 Future Enhancements:**
- Image uploads for properties (S3 integration)
- Email notifications (booking confirmations)
- Real-time messaging between hosts and guests
- Advanced search (location, amenities, date range)
- Calendar blocking for unavailable dates
- Automated testing (80%+ coverage)
- CI/CD pipeline (GitHub Actions)

---

**Authors:** Xiaoling Cui

**License:** MIT
