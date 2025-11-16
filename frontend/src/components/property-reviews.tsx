import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Review {
  id: string;
  rating: number;
  text: string;
  user_id: string;
  user_name?: string;
}

interface PropertyReviewsProps {
  placeId: string;
  rating: number;
  reviewCount: number;
}

export function PropertyReviews({ placeId, rating, reviewCount }: PropertyReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/places/${placeId}/reviews`);
        if (!response.ok) {
          throw new Error("Failed to load reviews");
        }
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [placeId]);

  return (
    <div className="pt-12">
      <div className="flex items-center gap-3 mb-8">
        <Star className="w-7 h-7 fill-black stroke-black" />
        <span className="text-[40px] font-normal leading-none">{rating}</span>
        <span className="text-[20px] text-gray-900 leading-none">
          · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-[15px]">{review.user_name || "Guest"}</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating ? "fill-black stroke-black" : "fill-gray-200 stroke-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[14px] text-gray-700 leading-relaxed">{review.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
