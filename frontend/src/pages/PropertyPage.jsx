import { useParams, Navigate } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { PropertyDetail } from "@/components/property-detail";
import { getPropertyById } from "@/data/properties";

export default function PropertyPage() {
  const { id } = useParams();
  const property = getPropertyById(id);

  // If property not found, redirect to home
  if (!property) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <PropertyDetail property={property} />
    </div>
  );
}
