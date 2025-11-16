import { useState } from "react";
import { Calendar, Users, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookingForm({ property }) {
  const [guests, setGuests] = useState(2);
  const nights = 5;
  const pricePerNight = property?.price || 1600;
  const cleaningFee = 150;
  const serviceFee = 280;
  const total = pricePerNight * nights + cleaningFee + serviceFee;

  // Default property if none provided
  const displayProperty = property || {
    name: "Property",
    location: "Select a property",
    image: "/modern-luxury-house.png",
    rating: 0,
    reviews: 0
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
                  <p className="text-sm text-gray-600">Apr 15 - 20, 2024</p>
                </div>
                <Button variant="ghost" className="text-sm">
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

          {/* Payment Method */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <h3 className="font-medium text-lg">Payment Method</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-4 border-2 border-black rounded-2xl">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Credit Card</span>
                <Check className="w-5 h-5 ml-auto" />
              </div>

              <input
                type="text"
                placeholder="Card Number"
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl outline-none text-sm"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="px-4 py-4 border border-gray-200 rounded-2xl outline-none text-sm"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="px-4 py-4 border border-gray-200 rounded-2xl outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Price Breakdown */}
        <div>
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6 sticky top-24">
            <h3 className="font-medium text-lg">Price Details</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>
                  ${pricePerNight} x {nights} nights
                </span>
                <span>${pricePerNight * nights}</span>
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
                <span>${total}</span>
              </div>
            </div>

            <Button className="w-full bg-black text-white rounded-2xl py-6 hover:bg-gray-800">Confirm and Pay</Button>

            <p className="text-xs text-gray-500 text-center">You won't be charged yet. Final charges may vary.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
