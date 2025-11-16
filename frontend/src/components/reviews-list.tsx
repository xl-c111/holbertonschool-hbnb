import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Kaveh",
    date: "April 2023",
    rating: 5,
    text: "Absolutely stunning property! The architecture is breathtaking and the views are incredible. The house is even more beautiful in person than in the photos. Highly recommend for anyone looking for a unique and luxurious stay.",
    avatar: "/person-avatar-1.png",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    date: "March 2023",
    rating: 5,
    text: "We had an amazing time at the Mirror House. The design is spectacular and the location is perfect for exploring the area. The host was very responsive and helpful. Would definitely stay here again!",
    avatar: "/diverse-person-avatar-2.png",
  },
  {
    id: 3,
    name: "Michael Chen",
    date: "February 2023",
    rating: 4,
    text: "Beautiful property with stunning views. The house is very modern and clean. Only minor issue was the WiFi connectivity, but overall a fantastic experience. Great for a peaceful retreat.",
    avatar: "/person-avatar-3.png",
  },
  {
    id: 4,
    name: "Emma Williams",
    date: "January 2023",
    rating: 5,
    text: "This place exceeded all expectations! The attention to detail in the design is remarkable. Perfect for couples or small families. The surrounding nature is beautiful and the house feels like a private oasis.",
    avatar: "/person-avatar-4.png",
  },
  {
    id: 5,
    name: "David Martinez",
    date: "December 2022",
    rating: 5,
    text: "One of the best stays we've ever had. The Mirror House is truly unique and the experience was unforgettable. Everything was perfect from check-in to check-out. Can't wait to return!",
    avatar: "/diverse-person-avatars.png",
  },
];

export function ReviewsList() {
  return (
    <div className="pt-20 px-6 max-w-4xl mx-auto pb-16">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-8 h-8 fill-black" />
          <span className="text-4xl font-light">4.82</span>
        </div>
        <p className="text-gray-600">55 reviews</p>
      </div>

      {/* Rating Breakdown */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
        <h3 className="font-medium text-lg mb-6">Rating Breakdown</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-4">
              <span className="text-sm w-6">{rating}★</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full"
                  style={{ width: rating === 5 ? "85%" : rating === 4 ? "12%" : "3%" }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {rating === 5 ? "47" : rating === 4 ? "6" : "2"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{review.name}</p>
                    <p className="text-sm text-gray-600">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-black" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
