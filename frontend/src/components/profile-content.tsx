import { useEffect, useMemo, useState } from "react";
import { Calendar, Settings, MapPin, Mail, Phone, Loader2, Home, Upload, AlertCircle, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const formatDateRange = (checkIn: string, checkOut: string) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${checkInDate.toLocaleDateString(undefined, options)} - ${checkOutDate.toLocaleDateString(undefined, options)}`;
};

const extractLocation = (place?: any) => {
  if (!place) return "View details";
  if (place.latitude && place.longitude) {
    return `${place.latitude.toFixed(3)}, ${place.longitude.toFixed(3)}`;
  }
  return place.title;
};

export function ProfileContent() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone_number: "", home_location: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [bookingAction, setBookingAction] = useState<string | null>(null);
  const [reviewForms, setReviewForms] = useState<Record<string, { rating: number; text: string }>>({});
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        phone_number: user.phone_number || "",
        home_location: user.home_location || ""
      });
      const storedAvatar = localStorage.getItem(`hbnb_avatar_${user.id}`);
      setAvatarPreview(storedAvatar || null);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/v1/bookings/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Unable to load bookings");
        }
        const bookingData = await response.json();
        const placeCache = new Map<string, any | null>();
        const getPlace = async (placeId: string) => {
          if (placeCache.has(placeId)) {
            return placeCache.get(placeId);
          }
          try {
            const placeRes = await fetch(`${API_URL}/api/v1/places/${placeId}`);
            if (!placeRes.ok) {
              throw new Error();
            }
            const place = await placeRes.json();
            placeCache.set(placeId, place);
            return place;
          } catch {
            placeCache.set(placeId, null);
            return null;
          }
        };
        const enriched = await Promise.all(
          bookingData.map(async (booking: any) => {
            const place = await getPlace(booking.place_id);
            return place ? { ...booking, place } : booking;
          })
        );
        setBookings(enriched);
        setBookingsError(null);
      } catch (error: any) {
        setBookings([]);
        setBookingsError(error.message);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setListings([]);
      return;
    }

    const fetchListings = async () => {
      setListingsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/v1/places/`);
        if (!response.ok) {
          throw new Error("Unable to load listings");
        }
        const places = await response.json();
        const owned = places.filter((place: any) => place.owner_id === user.id);
        setListings(owned);
      } catch (error) {
        setListings([]);
      } finally {
        setListingsLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const upcomingTrips = useMemo(() => bookings.filter((booking) => new Date(booking.check_out_date) >= today), [bookings, today]);
  const pastTrips = useMemo(
    () => bookings.filter((booking) => new Date(booking.check_out_date) < today),
    [bookings, today]
  );
  const nextTrip = useMemo(() => {
    const upcoming = bookings.filter((booking) => new Date(booking.check_in_date) >= today);
    return upcoming.sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())[0];
  }, [bookings, today]);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileMessage({ type: "error", text: "Please log in again to update your profile." });
      return;
    }
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/v1/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Unable to update profile");
      }
      await refreshUser?.();
      setProfileMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error: any) {
      setProfileMessage({ type: "error", text: error.message || "Update failed." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMessage("Choose an image smaller than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      if (user?.id) {
        localStorage.setItem(`hbnb_avatar_${user.id}`, dataUrl);
      }
      setAvatarMessage("Avatar saved locally.");
    };
    reader.readAsDataURL(file);
  };

  const handleCancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setBookingAction("Please log in again to cancel this booking.");
      return;
    }
    try {
      setBookingAction("Cancelling booking...");
      const response = await fetch(`${API_URL}/api/v1/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to cancel booking");
      }
      setBookingAction("Booking cancelled.");
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    } catch (error: any) {
      setBookingAction(error.message || "Cancellation failed.");
    }
  };

  const toggleReviewForm = (bookingId: string) => {
    if (activeReviewId === bookingId) {
      setActiveReviewId(null);
      setReviewMessage(null);
      return;
    }
    setActiveReviewId(bookingId);
    if (!reviewForms[bookingId]) {
      setReviewForms((prev) => ({ ...prev, [bookingId]: { rating: 5, text: "" } }));
    }
    setReviewMessage(null);
  };

  const submitReview = async (booking) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setReviewMessage("Please log in again to leave a review.");
      return;
    }
    const form = reviewForms[booking.id];
    if (!form?.text.trim()) {
      setReviewMessage("Share a few words about your stay.");
      return;
    }
    try {
      setReviewMessage("Submitting review...");
      const response = await fetch(`${API_URL}/api/v1/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          place_id: booking.place_id,
          rating: form.rating,
          text: form.text.trim()
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to submit review");
      }
      setReviewMessage("Thanks for leaving a review!");
      setActiveReviewId(null);
    } catch (error: any) {
      setReviewMessage(error.message || "Review failed.");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 px-6 max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-light">Log in to view your profile</h1>
        <p className="text-gray-600">Your trips, listings, and saved preferences appear once you sign in.</p>
        <Button asChild className="rounded-2xl px-8 py-6 bg-black text-white hover:bg-gray-800">
          <a href="/login">Sign in</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 max-w-7xl mx-auto pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Upload</div>
                )}
              </div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em] cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Update Avatar
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              {avatarMessage && <p className="text-xs text-gray-500">{avatarMessage}</p>}
              <h2 className="text-2xl font-light">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-600 text-sm">HBnB Host & Guest</p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{profileForm.phone_number || 'Add a phone number'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{profileForm.home_location || 'Add a home base'}</span>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <label htmlFor="phone_number" className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em]">
                  Phone Number
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  value={profileForm.phone_number}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, phone_number: event.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="home_location" className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em]">
                  Home Base
                </label>
                <input
                  id="home_location"
                  name="home_location"
                  value={profileForm.home_location}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, home_location: event.target.value }))}
                  placeholder="San Francisco, CA"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              {profileMessage && (
                <div
                  className={`text-sm rounded-2xl px-4 py-3 ${
                    profileMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}
              <Button
                type="submit"
                disabled={profileSaving}
                className="w-full bg-black text-white rounded-2xl py-3 hover:bg-gray-800 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Settings className="w-4 h-4" />
                {profileSaving ? "Saving..." : "Save Contact Info"}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {nextTrip && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="uppercase text-xs tracking-[0.3em] text-white/60">Next Trip</p>
                <h2 className="text-2xl font-light">{nextTrip.place?.title || "Upcoming stay"}</h2>
                <p className="text-sm text-white/80">
                  {formatDateRange(nextTrip.check_in_date, nextTrip.check_out_date)} · {nextTrip.place?.location || nextTrip.place?.fullLocation}
                </p>
                {nextTrip.cancellation_deadline && nextTrip.can_cancel && (
                  <p className="text-xs text-white/60 mt-1">
                    Free cancellation until {new Date(nextTrip.cancellation_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 px-5" asChild>
                  <a href={`/property/${nextTrip.place_id}`}>View details</a>
                </Button>
                <button
                  className={`rounded-2xl bg-white text-gray-900 font-medium px-5 py-3 transition ${nextTrip.can_cancel ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                  onClick={() => nextTrip.can_cancel && handleCancelBooking(nextTrip.id)}
                  disabled={!nextTrip.can_cancel}
                >
                  Cancel trip
                </button>
              </div>
            </div>
          )}
          {/* Host Listings */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5" />
              <h2 className="text-2xl font-light">My Listings</h2>
            </div>
            {listingsLoading ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading listings...
              </div>
            ) : listings.length === 0 ? (
              <p className="text-gray-500 text-sm">You haven’t published any stays yet.</p>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{listing.title}</h3>
                      <span className="text-sm text-gray-500">${listing.price.toLocaleString()} / night</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                    <span className="text-xs text-gray-400">
                      {listing.latitude.toFixed(3)}, {listing.longitude.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Trips */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <h2 className="text-2xl font-light">Upcoming Trips</h2>
            </div>
            {bookingAction && (
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 rounded-2xl px-4 py-2">
                <AlertCircle className="w-4 h-4" />
                <span>{bookingAction}</span>
              </div>
            )}
            {bookingsLoading ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading trips...
              </div>
            ) : bookingsError ? (
              <p className="text-sm text-red-600">{bookingsError}</p>
            ) : upcomingTrips.length === 0 ? (
              <p className="text-gray-500 text-sm">No trips booked yet.</p>
            ) : (
              <div className="space-y-4">
                {upcomingTrips.map((trip) => {
                  const canCancel = trip.can_cancel ?? false;
                  const deadline = trip.cancellation_deadline ? new Date(trip.cancellation_deadline) : null;
                  return (
                    <div key={trip.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{trip.place?.title || 'Upcoming stay'}</h3>
                        <p className="text-sm text-gray-600">{extractLocation(trip.place)}</p>
                        <p className="text-sm text-gray-500 mt-1">{formatDateRange(trip.check_in_date, trip.check_out_date)}</p>
                        {deadline && canCancel && (
                          <p className="text-xs text-gray-500 mt-2">
                            Free cancellation until {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </p>
                        )}
                        {deadline && !canCancel && ['pending', 'confirmed'].includes(trip.status) && (
                          <p className="text-xs text-amber-600 mt-2">
                            Cancellation deadline passed
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{trip.status}</span>
                          <span className="text-gray-300">•</span>
                          <span>${trip.total_price?.toLocaleString() || Math.round(trip.place?.price || 0).toLocaleString()} total</span>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleCancelBooking(trip.id)}
                          disabled={!canCancel}
                          className={!canCancel ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          Cancel booking
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Trips */}
          {pastTrips.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h2 className="text-2xl font-light text-gray-700">Past Trips</h2>
              </div>
              {reviewMessage && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 rounded-2xl px-4 py-2">
                  <Check className="w-4 h-4" />
                  <span>{reviewMessage}</span>
                </div>
              )}
              <div className="space-y-4">
                {pastTrips.map((trip) => (
                  <div key={trip.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{trip.place?.title || 'Previous stay'}</h3>
                      <p className="text-sm text-gray-600">{extractLocation(trip.place)}</p>
                      <p className="text-sm text-gray-500 mt-1">{formatDateRange(trip.check_in_date, trip.check_out_date)}</p>
                    </div>
                    <div className="text-sm text-gray-500 flex flex-col gap-2">
                      <span>Completed · ${trip.total_price?.toLocaleString() || Math.round(trip.place?.price || 0).toLocaleString()}</span>
                      <Button variant="outline" onClick={() => toggleReviewForm(trip.id)}>
                        {activeReviewId === trip.id ? "Close review" : "Leave review"}
                      </Button>
                      {activeReviewId === trip.id && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <select
                              value={reviewForms[trip.id]?.rating || 5}
                              onChange={(event) =>
                                setReviewForms((prev) => ({
                                  ...prev,
                                  [trip.id]: { ...(prev[trip.id] || { text: "" }), rating: Number(event.target.value) }
                                }))
                              }
                              className="border border-gray-200 rounded-xl px-3 py-1"
                            >
                              {[5, 4, 3, 2, 1].map((score) => (
                                <option key={score} value={score}>
                                  {score} star{score > 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            rows={3}
                            value={reviewForms[trip.id]?.text || ""}
                            onChange={(event) =>
                              setReviewForms((prev) => ({
                                ...prev,
                                [trip.id]: { ...(prev[trip.id] || { rating: 5 }), text: event.target.value }
                              }))
                            }
                            placeholder="Share your thoughts about this stay..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2"
                          />
                          <Button onClick={() => submitReview(trip)}>Submit review</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
