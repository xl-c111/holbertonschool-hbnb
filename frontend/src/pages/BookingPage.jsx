import { useLocation } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { BookingForm } from "@/components/booking-form";

export default function BookingPage() {
  const location = useLocation();
  const property = location.state?.property;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <BookingForm property={property} />
    </div>
  );
}
