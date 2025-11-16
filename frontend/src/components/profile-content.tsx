import { Heart, Calendar, Settings, User, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const trips = [
  {
    id: 1,
    name: "Mirror House Sud",
    location: "Bolzano, Italy",
    date: "Apr 15 - 20, 2024",
    image: "/modern-luxury-house.png",
  },
  {
    id: 2,
    name: "Mountain Villa",
    location: "Aspen, Colorado",
    date: "Jun 1 - 7, 2024",
    image: "/secluded-mountain-villa.png",
  },
];

const favorites = [
  {
    id: 1,
    name: "Beach House",
    location: "Malibu, California",
    price: 1850,
    image: "/secluded-beach-house.png",
  },
  {
    id: 2,
    name: "Forest Cabin",
    location: "Portland, Oregon",
    price: 950,
    image: "/cozy-forest-cabin.png",
  },
  {
    id: 3,
    name: "Desert Retreat",
    location: "Palm Springs, California",
    price: 1450,
    image: "/desert-house.png",
  },
];

export function ProfileContent() {
  return (
    <div className="pt-20 px-6 max-w-7xl mx-auto pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
              <h2 className="text-2xl font-light">John Doe</h2>
              <p className="text-gray-600 text-sm">Member since 2023</p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm">john.doe@example.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-sm">San Francisco, CA</span>
              </div>
            </div>

            <Button className="w-full bg-black text-white rounded-2xl py-3 hover:bg-gray-800">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Right Column - Trips & Favorites */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Trips */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6" />
              <h2 className="text-2xl font-light">Upcoming Trips</h2>
            </div>
            <div className="space-y-4">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-3xl shadow-lg p-4 flex gap-4">
                  <div className="relative w-32 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={trip.image || "/placeholder.svg"} alt={trip.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{trip.name}</h3>
                    <p className="text-gray-600 text-sm">{trip.location}</p>
                    <p className="text-sm text-gray-500 mt-1">{trip.date}</p>
                  </div>
                  <Button variant="outline" className="rounded-2xl">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Favorites */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6" />
              <h2 className="text-2xl font-light">Favorites</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer">
                  <div className="relative h-[200px]">
                    <img
                      src={favorite.image || "/placeholder.svg"}
                      alt={favorite.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      ${favorite.price}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{favorite.name}</h3>
                    <p className="text-gray-600 text-sm">{favorite.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
