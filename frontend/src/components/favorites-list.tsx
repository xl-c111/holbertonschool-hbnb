import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchPlaces } from "@/api/places";

const STORAGE_KEY = "hbnb_favorites";

const loadFavoriteIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const toggleFavoriteId = (id) => {
  const current = new Set(loadFavoriteIds());
  if (current.has(id)) {
    current.delete(id);
  } else {
    current.add(id);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
  return Array.from(current);
};

export function FavoriteButton({ placeId, size = "md" }) {
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(loadFavoriteIds()));
  const isFavorite = favoriteIds.has(placeId);
  const dimension = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  const handleToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const next = new Set(toggleFavoriteId(placeId));
    setFavoriteIds(next);
  };

  return (
    <button
      onClick={handleToggle}
      className={`rounded-full border ${isFavorite ? "bg-black text-white border-black" : "border-gray-300 text-gray-600"} ${dimension} flex items-center justify-center transition-colors`}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? "fill-white" : ""}`} />
    </button>
  );
}

export function FavoritesGrid() {
  const [favoriteIds, setFavoriteIds] = useState(() => loadFavoriteIds());
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncFavorites = () => setFavoriteIds(loadFavoriteIds());
    window.addEventListener("storage", syncFavorites);
    return () => window.removeEventListener("storage", syncFavorites);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPlaces()
      .then((data) => setPlaces(data.filter((place) => favoriteIds.includes(place.id))))
      .catch((error) => setError(error.message || "Unable to load favorites"))
      .finally(() => setLoading(false));
  }, [favoriteIds]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading favorites...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 text-red-600 rounded-2xl p-4 text-sm">
        {error}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-6 text-center space-y-3">
        <p className="text-lg font-medium">No favorites yet</p>
        <p className="text-sm text-gray-600">
          Tap the heart icon on any listing to save it here.
        </p>
        <Link to="/" className="text-black underline">
          Explore listings
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {places.map((place) => (
        <Link
          to={`/property/${place.id}`}
          key={place.id}
          className="group bg-white border border-gray-100 rounded-3xl p-4 space-y-4 hover:shadow-lg transition"
        >
          <div className="relative h-48 rounded-2xl overflow-hidden">
            <img src={place.image || place.images?.[0] || "/placeholder.svg"} alt={place.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
            <div className="absolute top-3 right-3">
              <FavoriteButton placeId={place.id} size="sm" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{place.title || place.name}</p>
              <p className="text-sm text-gray-500">{place.location || place.fullLocation}</p>
            </div>
            <p className="text-sm font-medium">${place.price?.toLocaleString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
