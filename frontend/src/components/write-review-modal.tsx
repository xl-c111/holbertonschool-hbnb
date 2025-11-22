import { useState } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeId: string;
  placeName: string;
  onReviewSubmitted: () => void;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  placeId,
  placeName,
  onReviewSubmitted
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (reviewText.trim().length < 10) {
      setError("Please write at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/v1/places/${placeId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          text: reviewText,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit review");
      }

      onReviewSubmitted();
      onClose();
      setRating(0);
      setReviewText("");
    } catch (err: any) {
      setError(err.message || "Unable to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[28px] font-normal leading-tight">Write a review</h2>
            <p className="text-[15px] text-gray-600 mt-1">{placeName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <p className="text-[15px] font-medium">How was your stay?</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-all ${
                    star <= (hoveredRating || rating)
                      ? "fill-black stroke-black"
                      : "fill-gray-100 stroke-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <label htmlFor="review-text" className="text-[15px] font-medium">
            Share your experience
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="What did you love about this place? What could be improved?"
            className="w-full h-32 px-4 py-3 text-[15px] border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            maxLength={500}
          />
          <p className="text-[13px] text-gray-500 text-right">
            {reviewText.length}/500 characters
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-[14px] text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-2xl py-3"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 rounded-2xl py-3 bg-black text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
