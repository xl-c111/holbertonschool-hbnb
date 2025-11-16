import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Heart } from "lucide-react";
import { FavoritesGrid, FavoriteButton } from "@/components/favorites-list";
import { fetchPlaces } from "@/api/places";

export default function FavoritesPage() {
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);

  useEffect(() => {
    fetchPlaces()
      .then((data) => setSuggestedPlaces(data.slice(0, 2)))
      .catch(() => setSuggestedPlaces([]));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-28 pb-16 px-6 max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm uppercase tracking-[0.3em]">
            <Heart className="w-4 h-4" />
            Favorites
          </div>
          <h1 className="text-4xl font-light">Saved stays</h1>
          <p className="text-gray-600">Keep track of stays you love and plan to book in the future.</p>
        </header>

        <FavoritesGrid />

        {suggestedPlaces.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-medium">Explore curated stays</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {suggestedPlaces.map((place) => (
                <div key={place.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{place.title || place.name}</p>
                    <p className="text-sm text-gray-500">{place.location || place.fullLocation}</p>
                  </div>
                  <FavoriteButton placeId={place.id} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
