import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { SearchSection } from "@/components/search-section";
import { ListingsGrid } from "@/components/listings-grid";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <SearchSection />
      <ListingsGrid />
    </div>
  );
}
