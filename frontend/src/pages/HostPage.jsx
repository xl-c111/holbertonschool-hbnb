import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShieldCheck,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  Home,
  ListChecks,
  Inbox,
  Edit,
  Trash2,
  AlertTriangle,
  DollarSign,
  TrendingUp
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const locationPresets = [
  { label: 'Choose a preset', latitude: '', longitude: '' },
  { label: 'Bolzano, Italy', latitude: 46.498295, longitude: 11.354758 },
  { label: 'Aspen, Colorado', latitude: 39.191098, longitude: -106.817539 },
  { label: 'Malibu, California', latitude: 34.025921, longitude: -118.779757 },
  { label: 'Portland, Oregon', latitude: 45.5152, longitude: -122.6784 },
  { label: 'Palm Springs, California', latitude: 33.830296, longitude: -116.545292 },
  { label: 'Lake Tahoe, Nevada', latitude: 39.096849, longitude: -120.032351 }
];

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Host Protection',
    description: 'Automatic damage protection and responsive support when you need it.'
  },
  {
    icon: Sparkles,
    title: 'Design Guidance',
    description: 'Curated tips to keep your space aligned with HBnB’s elevated aesthetic.'
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Host on your own time—blackout dates anytime from the dashboard.'
  }
];

const initialForm = {
  title: '',
  description: '',
  price: '',
  latitude: '',
  longitude: '',
  preset: locationPresets[0].label
};

export default function HostPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState(null);
  const [bookingRequests, setBookingRequests] = useState({});
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [editingListingId, setEditingListingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '' });
  const [editMessage, setEditMessage] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePresetChange = (event) => {
    const selected = locationPresets.find((option) => option.label === event.target.value);
    updateField('preset', event.target.value);
    if (selected) {
      updateField('latitude', selected.latitude);
      updateField('longitude', selected.longitude);
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.title.trim()) nextErrors.title = 'Add a short, descriptive title.';
    if (!formData.description.trim() || formData.description.length < 40) {
      nextErrors.description = 'Tell guests what makes your space special (min 40 characters).';
    }
    const priceValue = Number(formData.price);
    if (!priceValue || priceValue <= 0) nextErrors.price = 'Enter a nightly rate above $0.';
    const latitudeValue = Number(formData.latitude);
    const longitudeValue = Number(formData.longitude);
    if (Number.isNaN(latitudeValue) || latitudeValue < -90 || latitudeValue > 90) {
      nextErrors.latitude = 'Latitude must be between -90 and 90.';
    }
    if (Number.isNaN(longitudeValue) || longitudeValue < -180 || longitudeValue > 180) {
      nextErrors.longitude = 'Longitude must be between -180 and 180.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialForm);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!isAuthenticated) {
      setFeedback({
        type: 'error',
        message: 'Please log in to publish a listing.'
      });
      navigate('/login', { state: { from: '/host' } });
      return;
    }

    if (!validateForm()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setFeedback({
        type: 'error',
        message: 'Authentication token missing. Log in again to continue.'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/api/v1/places/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to create listing.');
      }

      const data = await response.json();
      setFeedback({
        type: 'success',
        message: 'Your listing is live! You can add photos and amenities from your dashboard next.'
      });
      resetForm();

      if (data?.id) {
        localStorage.setItem('last_created_place', data.id);
      }
      loadListings();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadListings = () => {
    if (!user?.id) return;
    setListingsLoading(true);
    setListingsError(null);
    fetch(`${API_URL}/api/v1/places/`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load listings');
        return response.json();
      })
      .then((data) => {
        const mine = data.filter((place) => place.owner_id === user.id);
        setListings(mine);
      })
      .catch((error) => setListingsError(error.message))
      .finally(() => setListingsLoading(false));
  };

  const loadBookings = () => {
    const token = localStorage.getItem('token');
    if (!token || !listings.length) {
      setBookingRequests({});
      return;
    }
    setBookingsLoading(true);
    Promise.all(
      listings.map((listing) =>
        fetch(`${API_URL}/api/v1/bookings/places/${listing.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((response) => {
            if (!response.ok) throw new Error('Unable to load bookings');
            return response.json();
          })
          .then((bookings) => ({ placeId: listing.id, bookings }))
      )
    )
      .then((results) => {
        const map = {};
        results.forEach(({ placeId, bookings }) => {
          map[placeId] = bookings;
        });
        setBookingRequests(map);
      })
      .catch(() => setBookingRequests({}))
      .finally(() => setBookingsLoading(false));
  };

  useEffect(() => {
    if (user?.id && isAuthenticated) {
      loadListings();
    }
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (listings.length) {
      loadBookings();
    }
  }, [listings]);

  const handleBookingAction = async (bookingId, action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setBookingMessage('Please log in again to manage bookings.');
      return;
    }

    try {
      const endpoint =
        action === 'confirm'
          ? `${API_URL}/api/v1/bookings/${bookingId}/confirm`
          : `${API_URL}/api/v1/bookings/${bookingId}`;
      const method = action === 'confirm' ? 'PUT' : 'DELETE';
      const response = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to update booking');
      }
      setBookingMessage(action === 'confirm' ? 'Booking confirmed.' : 'Booking cancelled.');
      loadBookings();
    } catch (error) {
      setBookingMessage(error.message || 'Action failed.');
    }
  };

  const startEditing = (listing) => {
    setEditingListingId(listing.id);
    setEditForm({
      title: listing.title,
      description: listing.description,
      price: listing.price
    });
    setEditMessage(null);
  };

  const cancelEditing = () => {
    setEditingListingId(null);
    setEditForm({ title: '', description: '', price: '' });
    setEditMessage(null);
  };

  const submitListingEdit = async (listingId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setEditMessage('Please log in again to edit this listing.');
      return;
    }
    if (!editForm.title.trim() || !editForm.description.trim()) {
      setEditMessage('Title and description cannot be empty.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/v1/places/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          price: Number(editForm.price)
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to update listing');
      }
      setEditMessage('Listing updated.');
      setEditingListingId(null);
      loadListings();
    } catch (error) {
      setEditMessage(error.message || 'Update failed.');
    }
  };

  const deleteListing = async (listingId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setDeleteMessage('Please log in again to delete this listing.');
      return;
    }
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    try {
      const response = await fetch(`${API_URL}/api/v1/places/${listingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to delete listing');
      }
      setDeleteMessage('Listing deleted.');
      if (editingListingId === listingId) {
        cancelEditing();
      }
      loadListings();
    } catch (error) {
      setDeleteMessage(error.message || 'Delete failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <section className="pt-28 pb-20 px-6 space-y-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Hosting</p>
            <h1 className="text-5xl md:text-[56px] leading-tight font-light">
              Share your design-forward space with discerning travelers.
            </h1>
            <p className="text-gray-600 text-lg">
              HBnB is a curated marketplace for architecturally unique stays. Our host onboarding keeps
              the process calm, clear, and intentional so you can focus on exceptional hospitality.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{benefit.title}</p>
                      <p className="text-sm text-gray-500">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-3xl bg-white border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-medium">Design-first standards</p>
                  <p className="text-gray-500 text-sm">
                    Every listing is reviewed by our team to ensure it meets HBnB’s bar for architecture,
                    craftsmanship, and guest experience.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-900" />
                  24/7 guest support team
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-900" />
                  Complimentary listing photography (select markets)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-900" />
                  Earnings dashboard with transparent payouts
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="space-y-1 mb-8">
                <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Quick Start</p>
                <h2 className="text-3xl font-light">List your stay</h2>
                <p className="text-gray-500 text-sm">
                  It takes under five minutes to publish the essentials. You can add photos, amenities, and calendar rules later.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Listing title
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    placeholder="Modern hillside retreat"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    rows={4}
                    placeholder="Highlight the architecture, surroundings, and guest experience."
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Nightly rate (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="50"
                      value={formData.price}
                      onChange={(event) => updateField('price', event.target.value)}
                      placeholder="1600"
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Location preset</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={formData.preset}
                      onChange={handlePresetChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                    >
                      {locationPresets.map((option) => (
                        <option key={option.label} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use preset coordinates or enter custom latitude and longitude below.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="latitude" className="text-sm font-medium text-gray-700">
                      Latitude
                    </label>
                    <input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(event) => updateField('latitude', event.target.value)}
                      placeholder="39.191098"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    {errors.latitude && <p className="text-sm text-red-600">{errors.latitude}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="longitude" className="text-sm font-medium text-gray-700">
                      Longitude
                    </label>
                    <input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(event) => updateField('longitude', event.target.value)}
                      placeholder="-106.817539"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    {errors.longitude && <p className="text-sm text-red-600">{errors.longitude}</p>}
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                  Add photography, amenities, and calendar rules from the dashboard after publishing. Guests can only book dates you make available.
                </div>

                {feedback && (
                  <div
                    className={`rounded-2xl p-4 text-sm ${
                      feedback.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}
                  >
                    {feedback.message}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-2xl py-6 bg-black text-white hover:bg-gray-800 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? 'Publishing...' : 'Publish listing'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Host Dashboard Tabs */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 border-b border-gray-100 pb-4">
            {['listings', 'bookings'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-2xl text-sm font-medium ${
                  activeTab === tab ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'listings' ? 'My Listings' : 'Booking Requests'}
              </button>
            ))}
          </div>

          {activeTab === 'listings' && (
            <ListingsPanel
              isAuthenticated={isAuthenticated}
              userId={user?.id}
              listings={listings}
              loading={listingsLoading}
              error={listingsError}
              onRefresh={loadListings}
              editingListingId={editingListingId}
              editForm={editForm}
              onEditFieldChange={setEditForm}
              onStartEdit={startEditing}
              onCancelEdit={cancelEditing}
              onSubmitEdit={submitListingEdit}
              editMessage={editMessage}
              onDeleteListing={deleteListing}
              deleteMessage={deleteMessage}
            />
          )}

          {activeTab === 'bookings' && (
            <>
              <RevenueHighlight bookingRequests={bookingRequests} listings={listings} />
              <BookingHighlight bookingRequests={bookingRequests} listings={listings} />
              <BookingsPanel
                isAuthenticated={isAuthenticated}
                listings={listings}
                bookingRequests={bookingRequests}
                loading={bookingsLoading}
                message={bookingMessage}
                onRefresh={loadBookings}
                onAction={handleBookingAction}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ListingsPanel({
  isAuthenticated,
  userId,
  listings,
  loading,
  error,
  onRefresh,
  editingListingId,
  editForm,
  onEditFieldChange,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  editMessage,
  onDeleteListing,
  deleteMessage
}) {
  if (!isAuthenticated) {
    return (
      <div className="p-6 text-sm text-gray-600 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-gray-500" />
        Log in to see and manage your listings.
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-light flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            Your Listings
          </h3>
          <p className="text-sm text-gray-500">Edit pricing or coordinates any time.</p>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading listings...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {editMessage && <p className="text-sm text-gray-700">{editMessage}</p>}
      {deleteMessage && <p className="text-sm text-gray-700">{deleteMessage}</p>}
      {!loading && !error && listings.length === 0 && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-2xl p-4">
          You haven’t published any stays yet.
        </div>
      )}

      <div className="space-y-4">
        {listings.map((listing) => (
          <div key={listing.id} className="border border-gray-100 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
              {editingListingId === listing.id ? (
                <div className="flex-1 space-y-2">
                  <input
                    value={editForm.title}
                    onChange={(event) => onEditFieldChange((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(event) => onEditFieldChange((prev) => ({ ...prev, description: event.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <h4 className="font-medium">{listing.title}</h4>
                  <p className="text-sm text-gray-500">{listing.description}</p>
                </div>
              )}
              <div className="text-right">
                {editingListingId === listing.id ? (
                  <input
                    type="number"
                    min="0"
                    value={editForm.price}
                    onChange={(event) => onEditFieldChange((prev) => ({ ...prev, price: event.target.value }))}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-right"
                  />
                ) : (
                  <p className="text-sm font-medium">${listing.price.toLocaleString()}</p>
                )}
                <p className="text-xs text-gray-400">
                  {listing.latitude.toFixed(3)}, {listing.longitude.toFixed(3)}
                </p>
              </div>
            </div>
            {editingListingId === listing.id ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full sm:flex-1" onClick={() => onSubmitEdit(listing.id)}>
                  Save
                </Button>
                <Button variant="outline" className="w-full sm:flex-1" onClick={onCancelEdit}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex items-center gap-2 justify-center" onClick={() => onStartEdit(listing)}>
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 justify-center"
                  onClick={() => onDeleteListing(listing.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueHighlight({ bookingRequests, listings }) {
  const stats = useMemo(() => {
    const allBookings = Object.values(bookingRequests).flat();
    const now = new Date();

    const upcomingRevenue = allBookings
      .filter(b => b.status === 'confirmed' && new Date(b.check_in_date) >= now)
      .reduce((sum, b) => sum + (b.total_price || 0), 0);

    const totalEarnings = allBookings
      .filter(b => b.status === 'confirmed' && new Date(b.check_out_date) < now)
      .reduce((sum, b) => sum + (b.total_price || 0), 0);

    const earningsByPlace = {};
    allBookings
      .filter(b => b.status === 'confirmed')
      .forEach(b => {
        earningsByPlace[b.place_id] = (earningsByPlace[b.place_id] || 0) + (b.total_price || 0);
      });

    const topPlaceId = Object.entries(earningsByPlace).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topPlace = listings.find(l => l.id === topPlaceId);

    return { upcomingRevenue, totalEarnings, topPlace };
  }, [bookingRequests, listings]);

  if (!listings.length) return null;

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-3xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5" />
        <p className="uppercase text-xs tracking-[0.3em] text-white/80">Revenue Overview</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/70 mb-1">Upcoming Revenue</p>
          <p className="text-2xl font-semibold">${stats.upcomingRevenue.toLocaleString()}</p>
          <p className="text-xs text-white/60 mt-1">Confirmed bookings</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/70 mb-1">Total Earnings</p>
          <p className="text-2xl font-semibold">${stats.totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-white/60 mt-1">Completed stays</p>
        </div>
        {stats.topPlace && (
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-xs text-white/70 mb-1">Top Earner</p>
            <p className="text-sm font-medium truncate">{stats.topPlace.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-white/60" />
              <p className="text-xs text-white/60">Best performer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingHighlight({ bookingRequests, listings }) {
  const listingMap = useMemo(() => {
    const map = new Map();
    listings.forEach((listing) => map.set(listing.id, listing));
    return map;
  }, [listings]);

  const upcoming = useMemo(() => {
    const rows = [];
    Object.values(bookingRequests).forEach((bookings) => {
      bookings.forEach((booking) => {
        if (new Date(booking.check_in_date) >= new Date() && ["pending", "confirmed"].includes(booking.status)) {
          rows.push(booking);
        }
      });
    });
    return rows.sort((a, b) => new Date(a.check_in_date) - new Date(b.check_in_date)).slice(0, 3);
  }, [bookingRequests]);

  if (!upcoming.length) return null;

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-3xl p-6">
      <p className="uppercase text-xs tracking-[0.3em] text-white/60">Incoming guests</p>
      <div className="grid gap-4 mt-4 md:grid-cols-3">
        {upcoming.map((booking) => {
          const listing = listingMap.get(booking.place_id);
          return (
            <div key={booking.id} className="bg-white/10 rounded-2xl p-4 space-y-2">
              <p className="text-sm font-medium">{listing?.title || booking.place_id}</p>
              <p className="text-xs text-white/70">
                {booking.check_in_date} → {booking.check_out_date}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">{booking.status}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingsPanel({ isAuthenticated, listings, bookingRequests, loading, message, onRefresh, onAction }) {
  const rows = useMemo(() => {
    const data = [];
    listings.forEach((listing) => {
      const bookings = bookingRequests[listing.id] || [];
      bookings.forEach((booking) => data.push({ listing, booking }));
    });
    return data;
  }, [listings, bookingRequests]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-sm text-gray-600 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-gray-500" />
        Log in to manage booking requests.
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-light flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Booking Requests
          </h3>
          <p className="text-sm text-gray-500">Confirm or decline upcoming stays.</p>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {message && <p className="text-sm text-gray-700">{message}</p>}
      {loading && <p className="text-sm text-gray-500">Loading booking requests...</p>}
      {!loading && rows.length === 0 && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-2xl p-4">
          No booking requests at the moment.
        </div>
      )}

      <div className="space-y-4">
        {rows.map(({ listing, booking }) => (
          <div key={booking.id} className="border border-gray-100 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-medium">{listing.title}</p>
                <p className="text-sm text-gray-500">
                  {booking.check_in_date} → {booking.check_out_date}
                </p>
                <p className="text-xs text-gray-400 capitalize">{booking.status}</p>
              </div>
              <div className="text-sm text-gray-600">
                ${(booking.total_price || listing.price).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              {booking.status === 'pending' ? (
                <>
                  <Button className="w-full sm:flex-1" onClick={() => onAction(booking.id, 'confirm')}>
                    Confirm
                  </Button>
                  <Button variant="outline" className="w-full sm:flex-1" onClick={() => onAction(booking.id, 'cancel')}>
                    Cancel
                  </Button>
                </>
              ) : (
                <span className="text-sm text-gray-500">Already {booking.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
