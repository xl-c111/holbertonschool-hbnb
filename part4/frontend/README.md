# HBnB Frontend

Professional frontend for the HBnB (Holberton AirBnB Clone) project.

## Directory Structure

```
public/
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   └── scripts.js          # Main JavaScript file
├── images/
│   ├── logo.png           # App logo
│   ├── icon.png           # Generic icon
│   ├── icon_wifi.png      # WiFi amenity icon
│   ├── icon_bed.png       # Bed amenity icon
│   ├── icon_bath.png      # Bath amenity icon
│   └── cute ghost house.png  # Place thumbnail
├── index.html             # Homepage
├── login.html             # Login page
├── register.html          # Registration page
├── place.html             # Place details page
└── add_review.html        # Add review page
```

## Pages

### index.html
- Homepage with place listings
- Price filter functionality
- Authentication-gated content

### login.html
- User authentication
- JWT token-based login

### register.html
- New user registration
- Password validation
- Email validation

### place.html
- Detailed place information
- Magazine-style layout (image left, details right)
- Reviews display
- Average rating calculation

### add_review.html
- Review submission form
- Rating (1-5 stars)
- Text review

## Features

- **Authentication**: JWT-based with automatic token expiration handling
- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 1024px
- **Cache-Busting**: Versioned CSS and JS files for proper updates
- **Professional UI**: Halloween-themed purple and orange design
- **Error Handling**: Graceful error messages and redirects

## Running the Frontend

### Development Server

```bash
cd /Users/xiaolingcui/holbertonschool-hbnb/part4/public
python3 -m http.server 8000
```

Then visit: `http://localhost:8000`

### API Backend

The frontend expects the backend API to run on:
```
http://127.0.0.1:5000
```

To start the backend:
```bash
cd /Users/xiaolingcui/holbertonschool-hbnb/part4
python3 run.py
```

## API Endpoints Used

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/users/` - User registration
- `GET /api/v1/places/` - List all places
- `GET /api/v1/places/{id}` - Get place details
- `GET /api/v1/places/{id}/reviews` - Get place reviews
- `POST /api/v1/reviews/` - Create review

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Theme

- **Primary Purple**: `#6b46c1`
- **Dark Purple**: `#4c1d95`
- **Light Purple**: `#a78bfa`
- **Accent Orange**: `#f59e0b`
- **Dark Background**: `#1f1b24`
- **Card Background**: `#2d1b69`

## Notes

- All HTML files are in the root of `public/`
- Assets (CSS, JS, images) are organized in subdirectories
- Cache-busting is handled via query parameters (e.g., `?v=6`)
- JavaScript is intentionally kept as a single file for simplicity
