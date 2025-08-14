# HBNB - Part 4: Simple Web Client

## 📌 Overview

Part 4 of the HBNB project focuses on building a simple web client that interacts with the existing back-end API.  
The front-end is implemented using **HTML5**, **CSS3**, and **JavaScript (ES6)**, following the provided design specifications and ensuring smooth communication with the API.

## 🎯 Objectives

- Develop a user-friendly interface for the application.
- Implement client-side functionality to interact with the back-end API.
- Handle authentication and user sessions using JWT tokens.
- Apply modern front-end development practices for a responsive, dynamic UI.

## 📂 Pages

- **Login (`login.html`)** – User authentication form.
- **List of Places (`index.html`)** – Displays all places with client-side filtering by price.
- **Place Details (`place.html`)** – Shows detailed information about a selected place, including amenities and reviews.
- **Add Review (`add_review.html`)** – Form for submitting a review, accessible only to authenticated users.

## Project Structure

```bash
holbertonschool-hbnb/
│
├── part4/
│   ├── index.html         # List of Places page
│   ├── login.html         # Login form page
│   ├── place.html         # Place details page
│   ├── add_review.html    # Add Review page
│   ├── styles.css         # Base CSS styles
│   ├── scripts.js         # JavaScript logic
│   └── images/            # Images & icons
│
└── ...
```

## 🛠 Features

### Authentication

- JWT token stored in cookies for session management.
- Pages check authentication status on load and adjust UI accordingly.

### Places Listing

- Fetched dynamically from the API.
- Filterable by price without reloading the page.

### Place Details

- Loaded via `place_id` query parameter.
- Includes host info, price, description, amenities, and reviews.
- Review form/button shown only to authenticated users.

### Add Review

- Accessible only when logged in.
- Sends review data to the API via POST request.
- Displays success or error messages.

## ⚙ Technologies

- **HTML5** – Semantic structure.
- **CSS3** – Responsive styling and design.
- **JavaScript (ES6)** – Client-side logic.
- **Fetch API** – Communication with back-end.
- **Cookies** – Session and authentication handling.

## 📌 Authentication Flow

1. User logs in via `login.html`.
2. JWT token is stored in cookies.
3. Pages check for token presence on load.
4. Authenticated requests include `Authorization: Bearer <token>`.

## 🚀 How to Run the Web Client

1. Make sure your back-end API is running and accessible.
2. Start a simple HTTP server for the front-end:
   ```bash
   python3 run.py
   ```
3. Open your browser and visit:
   - **Login Page:** [http://localhost:5000/login.html](http://localhost:5000/login.html)
   - **List of Places:** [http://localhost:5000/index.html](http://localhost:5000/index.html)
   - **Place Details:** [http://localhost:5000/place.html?place_id=<PLACE_ID>](http://localhost:5000/place.html?place_id=<PLACE_ID>)
   - **Add Review:** [http://localhost:5000/add_review.html?place_id=<PLACE_ID>](http://localhost:5000/add_review.html?place_id=<PLACE_ID>)

Replace `<PLACE_ID>` with the actual ID of the place you want to view or review.
