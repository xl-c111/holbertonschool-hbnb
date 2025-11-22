import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, Check, AlertCircle, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripeCheckoutForm } from "@/components/stripe-checkout-form";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export function BookingForm({ bookingDetails }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [guests, setGuests] = useState(bookingDetails?.guests || 2);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);

  const property = bookingDetails?.property;
  const checkInDate = bookingDetails?.checkInDate ? new Date(bookingDetails.checkInDate) : null;
  const checkOutDate = bookingDetails?.checkOutDate ? new Date(bookingDetails.checkOutDate) : null;

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkInDate, checkOutDate]);

  const cleaningFee = bookingDetails?.cleaningFee ?? 150;
  const serviceFee = bookingDetails?.serviceFee ?? 280;
  const pricePerNight = property?.price || bookingDetails?.pricePerNight || 0;
  const subtotal = bookingDetails?.subtotal ?? pricePerNight * nights;
  const total = bookingDetails?.total ?? (nights > 0 ? subtotal + cleaningFee + serviceFee : 0);

  const displayProperty = property || {
    name: "Property",
    location: "Select a property to continue",
    image: "/modern-luxury-house.png",
    rating: 0,
    reviews: 0,
    id: null,
  };

  const formatDateRange = () => {
    if (!checkInDate || !checkOutDate) return "Select dates from the property page.";
    const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
    return `${formatter.format(checkInDate)} — ${formatter.format(checkOutDate)}`;
  };

  const canSubmit = Boolean(property?.id && checkInDate && checkOutDate && nights > 0);

  // Create payment intent when component mounts
  useEffect(() => {
    if (!canSubmit || !isAuthenticated) return;

    const createPaymentIntent = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setCreatingIntent(true);
      try {
        const response = await fetch(`${API_URL}/api/v1/payments/create-payment-intent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currency: "usd",
            place_id: property.id,
            check_in_date: bookingDetails.checkInDate,
            check_out_date: bookingDetails.checkOutDate,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const data = await response.json();
        setClientSecret(data.client_secret);
        setPaymentIntentId(data.payment_intent_id);
      } catch (error: any) {
        setSubmitError(error.message || "Failed to initialize payment");
      } finally {
        setCreatingIntent(false);
      }
    };

    createPaymentIntent();
  }, [canSubmit, isAuthenticated, total, property, bookingDetails]);

  const createBooking = async (paymentId: string) => {
    if (!canSubmit) {
      setSubmitError("Choose a property and dates before confirming.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: "/booking" } });
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);
      const response = await fetch(`${API_URL}/api/v1/bookings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          place_id: property.id,
          check_in_date: bookingDetails.checkInDate,
          check_out_date: bookingDetails.checkOutDate,
          payment_intent_id: paymentId,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to confirm booking");
      }

      const data = await response.json();
      setSubmitSuccess("Booking confirmed! Redirecting to your trips...");
      setTimeout(() => {
        navigate("/profile", { state: { highlightBookingId: data.id } });
      }, 1200);
    } catch (error: any) {
      setSubmitError(error.message || "Unable to confirm booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    createBooking(paymentId);
  };

  const handlePaymentError = (error: string) => {
    setSubmitError(error);
  };

  return (
    <div className="pt-20 px-6 max-w-6xl mx-auto pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Property Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-light">Confirm and Pay</h1>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex gap-4">
              <div className="relative w-32 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={displayProperty.image} alt={displayProperty.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{displayProperty.name}</h3>
                <p className="text-gray-600 text-sm">{displayProperty.location}</p>
                {displayProperty.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm">★ {displayProperty.rating}</span>
                    <span className="text-sm text-gray-500">({displayProperty.reviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <h3 className="font-medium text-lg">Your Trip</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dates</p>
                  <p className="text-sm text-gray-600">{formatDateRange()}</p>
                </div>
                <Button
                  variant="ghost"
                  className="text-sm"
                  onClick={() => {
                    if (property?.id) {
                      navigate(`/property/${property.id}`);
                    } else {
                      navigate("/");
                    }
                  }}
                >
                  Edit
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Guests</p>
                    <p className="text-sm text-gray-600">{guests} guests</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setGuests(guests + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          {checkInDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 mb-1">Cancellation Policy</p>
                  <p className="text-amber-800">
                    Free cancellation until{" "}
                    <strong>
                      {new Date(
                        new Date(checkInDate).getTime() - 48 * 60 * 60 * 1000
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </strong>{" "}
                    (48 hours before check-in).{" "}
                    <Link to="/cancellation-policy" className="underline hover:text-amber-900">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <h3 className="font-medium text-lg">Payment</h3>

            {creatingIntent && (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                <p className="text-sm">Preparing payment...</p>
              </div>
            )}

            {!creatingIntent && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#000000",
                      colorBackground: "#ffffff",
                      colorText: "#111827",
                      colorDanger: "#dc2626",
                      fontFamily: "system-ui, sans-serif",
                      borderRadius: "16px",
                    },
                  },
                }}
              >
                <StripeCheckoutForm
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  amount={total}
                />
              </Elements>
            )}

            {!creatingIntent && !clientSecret && !submitError && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Please ensure all booking details are correct</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Price Breakdown */}
        <div>
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6 sticky top-24">
            <h3 className="font-medium text-lg">Price Details</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>
                  ${pricePerNight} x {nights || 1} night{nights === 1 ? "" : "s"}
                </span>
                <span>${(nights > 0 ? pricePerNight * nights : pricePerNight).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cleaning fee</span>
                <span>${cleaningFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service fee</span>
                <span>${serviceFee}</span>
              </div>

              <div className="border-t pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span>${(total || pricePerNight).toLocaleString()}</span>
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <AlertCircle className="w-4 h-4" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                <Check className="w-4 h-4" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {submitting && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Confirming your booking...</p>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              Secure payment processed by Stripe. You will be charged ${total.toLocaleString()}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
