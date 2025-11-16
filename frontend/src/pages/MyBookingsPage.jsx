import { useEffect, useMemo, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const formatDateRange = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  return `${checkInDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} → ${checkOutDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
};

export default function MyBookingsPage() {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const loadBookings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/bookings/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Unable to load bookings");
        const data = await response.json();
        const placeCache = new Map();

        const getPlace = async (placeId) => {
          if (placeCache.has(placeId)) return placeCache.get(placeId);
          try {
            const placeRes = await fetch(`${API_URL}/api/v1/places/${placeId}`);
            if (!placeRes.ok) throw new Error();
            const place = await placeRes.json();
            placeCache.set(placeId, place);
            return place;
          } catch {
            placeCache.set(placeId, null);
            return null;
          }
        };

        const enriched = await Promise.all(
          data.map(async (booking) => {
            const place = await getPlace(booking.place_id);
            return place ? { ...booking, place } : booking;
          })
        );
        setBookings(enriched);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setActionMessage("Please log in again to cancel this booking.");
      return;
    }

    if (!window.confirm("Cancel this booking?")) return;

    try {
      setActionMessage("Cancelling booking...");
      const response = await fetch(`${API_URL}/api/v1/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to cancel booking");
      }
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      setActionMessage("Booking cancelled.");
    } catch (error) {
      setActionMessage(error.message || "Cancellation failed.");
    }
  };

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-28 pb-16 px-6 max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm uppercase tracking-[0.3em]">
            <Calendar className="w-4 h-4" />
            Bookings
          </div>
          <h1 className="text-4xl font-light">My Trips</h1>
          <p className="text-gray-600">All future and past reservations using this account.</p>
        </header>

        {!isAuthenticated && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-3 text-gray-600">
            <AlertCircle className="w-5 h-5" />
            Log in to view your bookings.
          </div>
        )}

        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-gray-500 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading bookings...
          </div>
        )}

        {error && (
          <div className="bg-white border border-red-200 text-red-600 rounded-2xl p-4 text-sm">
            {error}
          </div>
        )}

        {actionMessage && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-sm text-gray-600">
            {actionMessage}
          </div>
        )}

        {!loading && isAuthenticated && bookings.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-gray-600">
            No bookings yet. Start exploring stays on the home page.
          </div>
        )}

        <div className="grid gap-4">
          {bookings.map((booking) => {
            const placeTitle = booking.place?.title || "Untitled stay";
            const placeLocation = booking.place?.description?.slice(0, 80) || booking.place_id;
            const isUpcoming = new Date(booking.check_in_date) >= today && ["pending", "confirmed"].includes(booking.status);
            return (
              <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">Stay</p>
                    <p className="text-lg font-medium">{placeTitle}</p>
                    <p className="text-sm text-gray-500">{placeLocation}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDateRange(booking.check_in_date, booking.check_out_date)}</p>
                  </div>
                  <div className="text-sm text-gray-600 text-right">
                    <p className="uppercase tracking-[0.2em] text-gray-400">Status</p>
                    <p className="text-lg font-medium capitalize">{booking.status}</p>
                    <p className="text-sm text-gray-500">${booking.total_price?.toLocaleString() || Math.round(booking.place?.price || 0).toLocaleString()}</p>
                  </div>
                </div>
                {isUpcoming && (
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleCancel(booking.id)}>
                    Cancel booking
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
