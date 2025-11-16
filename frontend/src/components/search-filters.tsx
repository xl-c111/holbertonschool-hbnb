"use client";

import { useState } from "react";
import { Calendar, Users, MapPin, Home, DollarSign, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchFilters() {
  const [guests, setGuests] = useState(2);

  return (
    <div className="pt-20 px-6 max-w-5xl mx-auto pb-16">
      <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-light mb-8">Search Hotels</h1>

        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <div className="flex items-center gap-3 px-4 py-4 border border-gray-200 rounded-2xl">
            <MapPin className="w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Where are you going?" className="flex-1 outline-none text-sm" />
          </div>
        </div>

        {/* Date Picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Check In</label>
            <div className="flex items-center gap-3 px-4 py-4 border border-gray-200 rounded-2xl">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input type="date" className="flex-1 outline-none text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Check Out</label>
            <div className="flex items-center gap-3 px-4 py-4 border border-gray-200 rounded-2xl">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input type="date" className="flex-1 outline-none text-sm" />
            </div>
          </div>
        </div>

        {/* Guest Selector */}
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

        {/* Property Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Property Type</label>
          <div className="flex items-center gap-3 px-4 py-4 border border-gray-200 rounded-2xl">
            <Home className="w-5 h-5 text-gray-400" />
            <select className="flex-1 outline-none text-sm bg-transparent">
              <option>All Types</option>
              <option>Minimalist</option>
              <option>Modern</option>
              <option>Rustic</option>
              <option>Luxury</option>
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Price Range</label>
          <div className="flex items-center gap-3 px-4 py-4 border border-gray-200 rounded-2xl">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <select className="flex-1 outline-none text-sm bg-transparent">
              <option>Any Price</option>
              <option>$0 - $500</option>
              <option>$500 - $1,000</option>
              <option>$1,000 - $2,000</option>
              <option>$2,000+</option>
            </select>
          </div>
        </div>

        {/* More Filters */}
        <Button variant="outline" className="w-full rounded-2xl py-6 border-2">
          <SlidersHorizontal className="w-5 h-5 mr-2" />
          More Filters
        </Button>

        {/* Search Button */}
        <Button className="w-full bg-black text-white rounded-2xl py-6 hover:bg-gray-800">Search Hotels</Button>
      </div>
    </div>
  );
}
