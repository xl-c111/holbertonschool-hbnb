import { Navigation } from "@/components/navigation";
import { SearchFilters } from "@/components/search-filters";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <SearchFilters />
    </div>
  );
}
