import { useLocation } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { ListingsGrid } from "@/components/listings-grid";

export default function ListingsPage() {
  const location = useLocation();
  const filters = location.state?.filters;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <ListingsGrid filters={filters} />
    </div>
  );
}
