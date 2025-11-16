import { useLocation } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { ListingsGrid } from "@/components/listings-grid";
import { Footer } from "@/components/footer";

export default function ListingsPage() {
  const location = useLocation();
  const filters = location.state?.filters;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1">
        <ListingsGrid filters={filters} />
      </div>
      <Footer />
    </div>
  );
}
