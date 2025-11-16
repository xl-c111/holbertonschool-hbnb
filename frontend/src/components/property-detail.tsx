import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker-custom.css";
import { Star, Users, Bed, Bath, Calendar, ArrowRight, CheckCircle2, AlertCircle, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FavoriteButton } from "@/components/favorites-list";
import { PropertyReviews } from "@/components/property-reviews";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function PropertyDetail({ property }) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityState, setAvailabilityState] = useState("idle");
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [startDate, endDate] = dateRange;
  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const cleaningFee = 150;
  const serviceFee = 280;
  const subtotal = nights * property.price;
  const total = subtotal + (nights > 0 ? cleaningFee + serviceFee : 0);

  const formatDateForApi = (date: Date) => date.toISOString().split("T")[0];

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) {
      setStatusError("Choose your check-in and check-out dates first.");
      return;
    }

    setIsChecking(true);
    setStatusMessage(null);
    setStatusError(null);
    setAvailabilityState("idle");

    try {
      const response = await fetch(`${API_URL}/api/v1/bookings/availability/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          place_id: property.id,
          check_in_date: formatDateForApi(startDate),
          check_out_date: formatDateForApi(endDate),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to check availability");
      }

      const data = await response.json();
      if (data.available) {
        setAvailabilityState("available");
        setStatusMessage("Great news! This stay is available for your dates.");
      } else {
        setAvailabilityState("unavailable");
        setStatusMessage("Those dates are no longer available. Try new dates.");
      }
    } catch (error: any) {
      setStatusError(error.message || "Unable to check availability at the moment.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleReserve = () => {
    if (!startDate || !endDate) {
      setStatusError("Select your check-in and check-out dates first.");
      return;
    }

    if (availabilityState !== "available") {
      setStatusError("Check availability before reserving.");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/property/${property.id}` } });
      return;
    }

    navigate("/booking", {
      state: {
        property,
        checkInDate: formatDateForApi(startDate),
        checkOutDate: formatDateForApi(endDate),
        nights,
        cleaningFee,
        serviceFee,
        subtotal,
        total,
      },
    });
  };

  return (
    <div className="pt-20 px-6 max-w-7xl mx-auto pb-16 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN - Property Details */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Title */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-[42px] md:text-[56px] leading-tight font-normal">{property.name}</h1>
                <p className="text-[15px] text-gray-900">{property.fullLocation}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <div className="flex items-center gap-2">
                  <FavoriteButton placeId={property.id} />
                  <span className="text-sm text-gray-600 hidden sm:block">Save</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              {property.description.slice(0, 120)}...
            </p>
          </div>

          {/* Price */}
          <div className="pt-2">
            <span className="text-[40px] font-semibold">${property.price.toLocaleString()}</span>
            <span className="text-[18px] text-gray-900 font-normal"> / night</span>
          </div>

          {/* Availability Widget */}
          <div className="pt-4">
            <div className="bg-white border border-gray-200 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Select dates</p>
                  {startDate && endDate ? (
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium">
                        {startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        {" – "}
                        {endDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                      <button
                        onClick={() => {
                          setDateRange([null, null]);
                          setAvailabilityState("idle");
                          setStatusMessage(null);
                          setStatusError(null);
                        }}
                        className="text-sm text-gray-600 hover:text-black underline"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <p className="text-lg font-medium text-gray-700">Choose check-in & check-out</p>
                  )}
                </div>
                <Calendar className="w-6 h-6 text-gray-600 ml-3" />
              </div>

              <div className="overflow-x-auto">
                <DatePicker
                  selected={startDate}
                  onChange={(update) => {
                    setDateRange(update);
                    setAvailabilityState("idle");
                    setStatusMessage(null);
                    setStatusError(null);
                  }}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  minDate={new Date()}
                  monthsShown={1}
                  inline
                  calendarClassName="custom-calendar"
                  dayClassName={(date) => {
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return isWeekend ? "weekend-day" : "";
                  }}
                />
              </div>

              <div className="mt-4 space-y-3">
                {nights > 0 && (
                  <div className="text-sm text-gray-600 flex justify-between">
                    <span>{nights} night{nights > 1 ? "s" : ""}</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                )}
                {availabilityState === "available" && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-2xl px-4 py-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{statusMessage}</span>
                  </div>
                )}
                {availabilityState === "unavailable" && statusMessage && (
                  <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{statusMessage}</span>
                  </div>
                )}
                {statusError && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{statusError}</span>
                  </div>
                )}
                <Button
                  onClick={handleCheckAvailability}
                  disabled={isChecking}
                  className="w-full rounded-2xl py-3 bg-black text-white hover:bg-gray-900 disabled:opacity-60"
                >
                  {isChecking ? "Checking..." : "Check availability"}
                </Button>
                <Button
                  onClick={handleReserve}
                  variant="outline"
                  className="w-full rounded-2xl py-3"
                  disabled={availabilityState !== "available"}
                >
                  Reserve
                </Button>
                {nights > 0 && (
                  <p className="text-xs text-gray-500 text-center">
                    Estimated total: ${total.toLocaleString()} (includes ${cleaningFee} cleaning + ${serviceFee} service)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Property Stats */}
          <div className="flex items-start gap-16 pt-6">
            <div>
              <Users className="w-9 h-9 mb-2 stroke-[1.5]" />
              <p className="text-[15px] font-normal">{property.guests} Guests</p>
            </div>
            <div>
              <Bed className="w-9 h-9 mb-2 stroke-[1.5]" />
              <p className="text-[15px] font-normal">{property.bedrooms} Bedrooms</p>
            </div>
            <div>
              <Bath className="w-9 h-9 mb-2 stroke-[1.5]" />
              <p className="text-[15px] font-normal">{property.bathrooms} Bathroom{property.bathrooms > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Description */}
          <div className="pt-8">
            <p className={`text-[15px] text-gray-900 leading-relaxed ${!showFullDescription && 'line-clamp-4'}`}>
              {property.description}
            </p>
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-black font-medium underline mt-2 text-[15px]"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          </div>

          {/* Amenities */}
          <div className="pt-8">
            <div className="grid grid-cols-2 gap-x-32 gap-y-4">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3">
                  <ArrowRight className="w-4 h-4 flex-shrink-0 stroke-[2]" />
                  <span className="text-[15px]">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <PropertyReviews
            placeId={property.id}
            rating={property.rating}
            reviewCount={property.reviews}
          />
        </div>

        {/* RIGHT COLUMN - Images */}
        <div className="order-1 lg:order-2 space-y-4">
          <div className="relative h-[500px] rounded-3xl overflow-hidden">
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>

          {property.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {property.images.slice(1, 3).map((image, index) => (
                <div key={index} className="relative h-[240px] rounded-2xl overflow-hidden">
                  <img
                    src={image}
                    alt={`${property.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {property.images.length > 3 && (
            <div className="relative h-[320px] rounded-3xl overflow-hidden">
              <img
                src={property.images[3]}
                alt={`${property.name} 4`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
