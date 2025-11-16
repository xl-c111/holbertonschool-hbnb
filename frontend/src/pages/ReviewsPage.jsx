import { Navigation } from "@/components/navigation";
import { ReviewsList } from "@/components/reviews-list";

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <ReviewsList />
    </div>
  );
}
