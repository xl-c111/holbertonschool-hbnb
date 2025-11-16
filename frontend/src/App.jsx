import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import PropertyPage from './pages/PropertyPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import ReviewsPage from './pages/ReviewsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HostPage from './pages/HostPage';
import MyBookingsPage from './pages/MyBookingsPage';
import FavoritesPage from './pages/FavoritesPage';
import MessagesPage from './pages/MessagesPage';
import CancellationPolicyPage from './pages/CancellationPolicyPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/property/:id" element={<PropertyPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/host" element={<HostPage />} />
          <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
