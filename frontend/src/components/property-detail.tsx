import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Users, Bed, Bath, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PropertyDetail({ property }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div className="pt-20 px-6 max-w-7xl mx-auto pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN - Property Details */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-[56px] leading-tight font-normal mb-2">{property.name}</h1>
            <p className="text-[15px] text-gray-900">{property.fullLocation}</p>
          </div>

          {/* Price */}
          <div className="pt-2">
            <span className="text-[40px] font-semibold">${property.price.toLocaleString()}</span>
            <span className="text-[18px] text-gray-900 font-normal"> / night</span>
          </div>

          {/* Check Availability Button */}
          <div className="pt-4">
            <Link to="/booking" state={{ property }}>
              <button className="w-full max-w-md border border-gray-300 rounded-full pl-8 pr-3 py-3.5 flex items-center justify-between hover:border-gray-400 transition-colors">
                <span className="text-[20px] font-normal">Check Availability</span>
                <div className="bg-black rounded-full p-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </button>
            </Link>
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
          <div className="pt-12">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-7 h-7 fill-black stroke-black" />
              <span className="text-[40px] font-normal leading-none">{property.rating}</span>
              <span className="text-[20px] text-gray-900 leading-none">· {property.reviews} reviews</span>
            </div>

            {/* Sample Review */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0" />
              <div>
                <p className="font-normal text-[15px]">Guest Review</p>
                <p className="text-[13px] text-gray-600">Recent Stay</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Images */}
        <div className="space-y-4">
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
