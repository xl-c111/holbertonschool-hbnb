import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { fetchPlaces } from "@/api/places";
import { FavoriteButton } from "@/components/favorites-list";

export function ListingsGrid({ filters }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchPlaces()
      .then((data) => {
        if (!isMounted) return;
        setPlaces(data);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Unable to load listings");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProperties = useMemo(() => {
    return places.filter((property) => {
      if (!filters) return true;

      let matches = true;

      if (filters.location && filters.location !== "All Locations") {
        const query = filters.location.toLowerCase().split(",")[0];
        const haystack = (property.location || property.fullLocation || property.description || "").toLowerCase();
        matches = matches && haystack.includes(query);
      }

      if (filters.type && filters.type !== "All Types") {
        matches = matches && property.type === filters.type;
      }

      if (filters.priceMin !== null && filters.priceMin !== undefined && filters.priceMax !== null && filters.priceMax !== undefined) {
        matches = matches && property.price >= filters.priceMin && property.price <= filters.priceMax;
      }

      return matches;
    });
  }, [places, filters]);

  return (
    <div className="pt-20 px-6 max-w-7xl mx-auto pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2">
          {filters ? 'Search Results' : 'Available Properties'}
        </h1>
        <p className="text-gray-600">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
          {filters && filters.location && filters.location !== "All Locations" && ` in ${filters.location.split(',')[0]}`}
        </p>

        {/* Show active filters */}
        {filters && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {filters.location && filters.location !== "All Locations" && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                📍 {filters.location}
              </span>
            )}
            {filters.type && filters.type !== "All Types" && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                🏠 {filters.type}
              </span>
            )}
            {filters.priceMin !== null && filters.priceMin !== undefined && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                💰 ${filters.priceMin.toLocaleString()} - ${filters.priceMax.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-500">
          Loading listings...
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12 text-red-600">
          {error}
        </div>
      )}

      {/* No results message */}
      {!loading && !error && filteredProperties.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 mb-4">No properties found matching your criteria</p>
          <Link to="/" className="text-black underline">
            Clear filters and view all properties
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && !error && filteredProperties.map((property) => (
          <Link key={property.id} to={`/property/${property.id}`} className="group cursor-pointer block">
            <div className="space-y-3">
              <div className="relative h-[300px] rounded-3xl overflow-hidden">
                <img
                  src={property.image || "/placeholder.svg"}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  ${property.price}
                </div>
                <div className="absolute top-4 left-4">
                  <FavoriteButton placeId={property.id} size="sm" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-lg">{property.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-black" />
                    <span className="text-sm font-medium">{property.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{property.location}</p>
                <p className="text-sm text-gray-500 mt-1">{property.reviews} reviews</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
