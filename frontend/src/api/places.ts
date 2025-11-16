import { properties as propertyMetadata } from "@/data/properties";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type ApiPlace = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  latitude?: number;
  longitude?: number;
  owner_id?: string;
  amenities?: Array<{ id: string; name: string } | string>;
  [key: string]: any;
};

type Place = ReturnType<typeof enrichPlaceWithMetadata>;

let cachedPlaces: Place[] | null = null;
let inflightPromise: Promise<Place[]> | null = null;

const metadataByName = propertyMetadata.reduce<Record<string, any>>((acc, item) => {
  const key = item.name?.toLowerCase();
  if (key) acc[key] = item;
  return acc;
}, {});

const formatLocation = (place: ApiPlace, meta?: any) => {
  if (meta?.fullLocation) return meta.fullLocation;
  if (meta?.location) return meta.location;
  if (place.latitude !== undefined && place.longitude !== undefined) {
    return `${place.latitude.toFixed(3)}, ${place.longitude.toFixed(3)}`;
  }
  return "Unknown location";
};

function enrichPlaceWithMetadata(apiPlace: ApiPlace) {
  const lookupKey = (apiPlace.title ?? apiPlace.name ?? "").toLowerCase();
  const meta = metadataByName[lookupKey];
  const metaImages = meta?.images ?? (meta?.image ? [meta.image] : null);
  const amenitiesFromApi =
    apiPlace.amenities?.map((amenity) => (typeof amenity === "string" ? amenity : amenity.name)).filter(Boolean) ?? [];

  return {
    ...meta,
    ...apiPlace,
    id: apiPlace.id,
    name: apiPlace.title || meta?.name || "Property",
    title: apiPlace.title || meta?.name,
    type: meta?.type,
    location: meta?.location || meta?.fullLocation || formatLocation(apiPlace, meta),
    fullLocation: formatLocation(apiPlace, meta),
    price: apiPlace.price ?? meta?.price ?? 0,
    rating: meta?.rating ?? 4.9,
    reviews: meta?.reviews ?? 0,
    description: apiPlace.description || meta?.description || "",
    amenities: amenitiesFromApi.length ? amenitiesFromApi : meta?.amenities ?? [],
    images: metaImages?.length ? metaImages : ["/placeholder.svg"],
    image: metaImages?.[0] || "/placeholder.svg",
    guests: meta?.guests ?? 4,
    bedrooms: meta?.bedrooms ?? 2,
    bathrooms: meta?.bathrooms ?? 1,
  };
}

async function requestJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Request failed");
    throw new Error(errorText || "Request failed");
  }
  return response.json();
}

export async function fetchPlaces(options: { force?: boolean } = {}) {
  if (!options.force && cachedPlaces) {
    return cachedPlaces;
  }

  if (!options.force && inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = requestJson(`${API_URL}/api/v1/places/`)
    .then((data: ApiPlace[]) => data.map((place) => enrichPlaceWithMetadata(place)))
    .then((places) => {
      cachedPlaces = places;
      inflightPromise = null;
      return places;
    })
    .catch((error) => {
      inflightPromise = null;
      throw error;
    });

  return inflightPromise;
}

export async function fetchPlaceById(id: string, options: { force?: boolean } = {}) {
  if (!id) return null;
  if (!options.force && cachedPlaces) {
    const cached = cachedPlaces.find((place) => String(place.id) === String(id));
    if (cached) return cached;
  }

  const response = await fetch(`${API_URL}/api/v1/places/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unable to load place");
    throw new Error(errorText || "Unable to load place");
  }
  const result: ApiPlace = await response.json();
  const enriched = enrichPlaceWithMetadata(result);
  cachedPlaces = cachedPlaces ? [...cachedPlaces.filter((place) => place.id !== enriched.id), enriched] : [enriched];
  return enriched;
}

export function clearPlacesCache() {
  cachedPlaces = null;
  inflightPromise = null;
}
