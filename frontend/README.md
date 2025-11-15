# HBnB Frontend - Modular Architecture

Professional frontend for the HBnB (Holberton AirBnB Clone) project, refactored from a 918-line monolithic JavaScript file into a modern, maintainable modular structure using Vite.

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API layer
│   │   ├── client.js     # Base HTTP client with auth headers
│   │   ├── places.js     # Places API endpoints
│   │   └── reviews.js    # Reviews API endpoints
│   ├── auth/             # Authentication
│   │   └── index.js      # Login, register, logout, token management
│   ├── components/       # Reusable UI components
│   │   ├── Message.js    # Toast notifications
│   │   ├── PlaceCard.js  # Place card display
│   │   └── ReviewCard.js # Review card with star ratings
│   ├── pages/            # Page-specific logic
│   │   ├── home.js       # Home page (place listing & filtering)
│   │   ├── login.js      # Login page
│   │   ├── register.js   # Registration page
│   │   ├── place.js      # Place details page
│   │   └── review.js     # Add review page
│   ├── utils/            # Utility functions
│   │   ├── amenities.js  # Amenity icons and rendering
│   │   ├── cookies.js    # Cookie management
│   │   └── validation.js # Form validation
│   └── config.js         # Environment configuration
├── css/                  # Stylesheets
├── images/               # Static images
├── *.html                # HTML pages
├── .env.development      # Development environment config
├── .env.production       # Production environment config
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite build configuration
```

## Architecture Patterns

### 1. API Layer
- **Centralized HTTP client** (`api/client.js`): All API calls go through a single client that automatically injects JWT tokens from cookies
- **Domain-specific APIs**: Separate modules for places and reviews with typed methods

### 2. Authentication Module
- Token storage in cookies
- Automatic token injection in API requests
- Login/logout/registration flows

### 3. Reusable Components
- Pure functions that return HTML strings
- No side effects
- Easy to test and maintain

### 4. Page Modules
- Each page has its own initialization function
- Handles page-specific DOM manipulation and event listeners
- Clear separation of concerns

## Development

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
# Opens at http://localhost:3000
```

### Build for Production
```bash
npm run build
# Output in dist/ directory
```

### Preview Production Build
```bash
npm run preview
```

## Environment Configuration

### Development
- API URL: `http://127.0.0.1:5000` (local backend)
- Configured in `.env.development`

### Production
- API URL: `http://98.82.136.20` (deployed backend)
- Configured in `.env.production`

## Pages

### index.html
- Homepage with place listings
- Price filter functionality
- Authentication-gated content
- Dynamic place cards

### login.html
- User authentication
- JWT token-based login
- Form validation

### register.html
- New user registration
- Password complexity validation
- Email validation

### place.html
- Detailed place information
- Magazine-style layout (image left, details right)
- Reviews display
- Average rating calculation
- Amenities list

### add_review.html
- Review submission form
- Rating (1-5 stars)
- Text review with validation
- Token expiration handling

## Features

- **Authentication**: JWT-based with automatic token expiration handling
- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 1024px
- **Modern Build Tools**: Vite for fast development and optimized production builds
- **Code Splitting**: Automatic chunking for optimal loading performance
- **Hot Module Replacement**: Instant updates during development
- **Professional UI**: Halloween-themed purple and orange design
- **Error Handling**: Graceful error messages and redirects

## API Endpoints Used

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/users/` - User registration
- `GET /api/v1/places/` - List all places
- `GET /api/v1/places/{id}` - Get place details
- `GET /api/v1/places/{id}/reviews` - Get place reviews
- `POST /api/v1/reviews/` - Create review

## Benefits of Modular Structure

1. **Maintainability**: Each file has a single responsibility
2. **Scalability**: Easy to add new features without affecting existing code
3. **Testability**: Pure functions and clear interfaces make testing straightforward
4. **Performance**: Vite provides HMR, code splitting, and optimized production builds
5. **Developer Experience**: Fast dev server, clear error messages, ES6 module support

## Adding New Features

### Adding a New Page
1. Create page module in `src/pages/newpage.js`
2. Create HTML file `newpage.html`
3. Import and initialize in HTML:
   ```html
   <script type="module">
     import { initNewPage } from './src/pages/newpage.js';
     document.addEventListener('DOMContentLoaded', () => {
       initNewPage();
     });
   </script>
   ```
4. Add to Vite config `rollupOptions.input`

### Adding a New API Endpoint
1. Add method to appropriate API module in `src/api/`
2. Use the base client for authentication and error handling

### Adding a New Component
1. Create component in `src/components/`
2. Export pure function that returns HTML string
3. Import and use in page modules

## Migration from Monolith

The original monolithic `js/scripts.js` (918 lines) has been split into:
- **16 modular JavaScript files**
- Average file size: ~50-100 lines
- Clear separation between API, UI, and business logic
- No breaking changes to functionality
- All features preserved and improved

## Theme

- **Primary Purple**: `#6b46c1`
- **Dark Purple**: `#4c1d95`
- **Light Purple**: `#a78bfa`
- **Accent Orange**: `#f59e0b`
- **Dark Background**: `#1f1b24`
- **Card Background**: `#2d1b69`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps for Deployment

To deploy the refactored frontend to AWS:
1. Build production bundle: `npm run build`
2. Upload `dist/` contents to S3 bucket
3. Configure CloudFront distribution
4. Update backend CORS to allow CloudFront domain

See `FRONTEND_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.
