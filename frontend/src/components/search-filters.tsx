import { useState, useMemo, useEffect } from "react";
import { Calendar, Users, MapPin, Home, DollarSign, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchPlaces } from "@/api/places";
import { FavoriteButton } from "@/components/favorites-list";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const priceOptions = [
  { label: "Any Price", min: null, max: null },
  { label: "$0 - $500", min: 0, max: 500 },
  { label: "$500 - $1,000", min: 500, max: 1000 },
  { label: "$1,000 - $2,000", min: 1000, max: 2000 },
  { label: "$2,000+", min: 2000, max: null }
];

export function SearchFilters() {
  const [location, setLocation] = useState("");
  const [type, setType] = useState("All Types");
  const [price, setPrice] = useState(priceOptions[0]);
  const [guests, setGuests] = useState(2);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const locationPreview = useMemo(() => {
    if (!results.length) return null;
    const uniqueLocations = Array.from(new Set(results.map((place) => place.location || place.fullLocation)));
    return uniqueLocations.slice(0, 4);
  }, [results]);

  useEffect(() => {
    fetchPlaces()
      .then((data) => setResults(data))
      .catch((error) => setError(error.message || "Unable to load places"))
      .finally(() => setLoading(false));
  }, []);

  const filteredResults = useMemo(() => {
    return results.filter((place) => {
      let matches = true;

      if (location.trim()) {
        matches =
          matches &&
          (place.fullLocation || "").toLowerCase().includes(location.toLowerCase()) ||
          (place.location || "").toLowerCase().includes(location.toLowerCase());
      }

      if (type !== "All Types") {
        matches = matches && place.type === type;
      }

      if (price) {
        if (price.min !== null) {
          matches = matches && place.price >= price.min;
        }
        if (price.max !== null) {
          matches = matches && place.price <= price.max;
        }
      }

      if (guests > place.guests) {
        matches = matches && place.guests >= guests;
      }

      return matches;
    });
  }, [results, location, type, price, guests]);

  return (
    <div className="pt-20 px-6 max-w-6xl mx-auto pb-16 space-y-10">
      <section className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-light mb-4">Search Stays</h1>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <div className="flex items-center gap-3 px-4 py-4 border border-gray-200 rounded-2xl">
            <MapPin className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Where are you going?"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>
          {locationPreview && location && (
            <div className="flex gap-2 flex-wrap text-xs text-gray-500">
              {locationPreview.map((preview) => (
                <button
                  key={preview}
                  onClick={() => setLocation(preview)}
                  className="px-3 py-1 rounded-full border border-gray-200"
                >
                  {preview}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Type and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Property Type</label>
            <div className="flex items-center gap-3 px-4 py-4 border border-gray-200 rounded-2xl">
              <Home className="w-5 h-5 text-gray-400" />
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
              >
                <option>All Types</option>
                <option>Minimalist</option>
                <option>Modern</option>
                <option>Luxury</option>
                <option>Cabin</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range</label>
            <div className="flex items-center gap-3 px-4 py-4 border border-gray-200 rounded-2xl">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <select
                value={price.label}
                onChange={(event) => setPrice(priceOptions.find((option) => option.label === event.target.value)!)}
                className="flex-1 outline-none text-sm bg-transparent"
              >
                {priceOptions.map((option) => (
                  <option key={option.label} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Guests</label>
          <div className="flex items-center justify-between px-4 py-4 border border-gray-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm">{guests} Guests</span>
            </div>
            <div className="flex items-center gap-3">
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

        <Button variant="outline" className="w-full rounded-2xl py-6 border-2">
          <SlidersHorizontal className="w-5 h-5 mr-2" />
          More Filters
        </Button>
      </section>

      {/* Results */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="uppercase text-xs tracking-[0.3em] text-gray-500">Results</p>
            <h2 className="text-2xl font-light">{filteredResults.length} stays match your search</h2>
          </div>
        </div>
        {loading && (
          <div className="text-center py-12 text-gray-500">
            Loading search results...
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && filteredResults.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            No stays matched those filters. Try adjusting your search.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResults.map((place) => (
            <Link to={`/property/${place.id}`} key={place.id} className="group bg-white rounded-3xl border border-gray-100 p-4 space-y-3 hover:shadow-lg transition">
              <div className="relative h-56 rounded-2xl overflow-hidden">
                <img src={place.image || "/placeholder.svg"} alt={place.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute top-3 right-3">
                  <FavoriteButton placeId={place.id} size="sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{place.title || place.name}</p>
                  <p className="text-sm text-gray-500">{place.location || place.fullLocation}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-black" />
                  {place.rating || "4.9"}
                </div>
              </div>
              <p className="text-sm text-gray-500">{place.description?.slice(0, 80)}...</p>
              <p className="text-lg font-medium">${place.price?.toLocaleString()} <span className="text-sm text-gray-500">/ night</span></p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
