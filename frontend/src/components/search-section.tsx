import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Home, DollarSign, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const locations = [
  "All Locations",
  "Lisbon, Portugal",
  "Bolzano, Italy",
  "Aspen, Colorado",
  "Malibu, California",
  "Portland, Oregon",
  "Palm Springs, California",
  "Lake Tahoe, Nevada"
];

const types = [
  "All Types",
  "Minimalist",
  "Modern",
  "Luxury",
  "Cabin",
  "Beach House",
  "Mountain Villa"
];

const priceRanges = [
  { label: "All Prices", min: null, max: null },
  { label: "500 - 1,000", min: 500, max: 1000 },
  { label: "1,000 - 1,500", min: 1000, max: 1500 },
  { label: "1,500 - 2,000", min: 1500, max: 2000 },
  { label: "2,000 - 3,000", min: 2000, max: 3000 },
  { label: "10,000 - 12,000", min: 10000, max: 12000 }
];

export function SearchSection() {
  const [location, setLocation] = useState("All Locations");
  const [type, setType] = useState("All Types");
  const [priceRange, setPriceRange] = useState(priceRanges[0]);

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  const navigate = useNavigate();

  const handleSearch = () => {
    // Navigate to listings page with search params
    navigate('/listings', {
      state: {
        filters: {
          location,
          type,
          priceMin: priceRange.min,
          priceMax: priceRange.max
        }
      }
    });
  };

  return (
    <div className="relative -mt-24 z-20 px-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Location */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-3 block">Location</label>
            <div
              className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowTypeDropdown(false);
                setShowPriceDropdown(false);
              }}
            >
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="flex-1 text-sm">{location}</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>

            {/* Location Dropdown */}
            {showLocationDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {locations.map((loc) => (
                  <div
                    key={loc}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => {
                      setLocation(loc);
                      setShowLocationDropdown(false);
                    }}
                  >
                    {loc}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Type */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-3 block">Type</label>
            <div
              className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowLocationDropdown(false);
                setShowPriceDropdown(false);
              }}
            >
              <Home className="w-5 h-5 text-gray-400" />
              <span className="flex-1 text-sm">{type}</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>

            {/* Type Dropdown */}
            {showTypeDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {types.map((t) => (
                  <div
                    key={t}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => {
                      setType(t);
                      setShowTypeDropdown(false);
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-3 block">Price</label>
            <div
              className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => {
                setShowPriceDropdown(!showPriceDropdown);
                setShowLocationDropdown(false);
                setShowTypeDropdown(false);
              }}
            >
              <DollarSign className="w-5 h-5 text-gray-400" />
              <span className="flex-1 text-sm">{priceRange.label}</span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>

            {/* Price Dropdown */}
            {showPriceDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                {priceRanges.map((range) => (
                  <div
                    key={range.label}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => {
                      setPriceRange(range);
                      setShowPriceDropdown(false);
                    }}
                  >
                    {range.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <div>
            <Button
              onClick={handleSearch}
              className="w-full bg-black text-white hover:bg-gray-800 rounded-xl px-12 py-6 text-base font-medium mt-7"
            >
              Search Hotel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
