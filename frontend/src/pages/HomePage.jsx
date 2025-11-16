import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { SearchSection } from "@/components/search-section";
import { ListingsGrid } from "@/components/listings-grid";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1">
        <HeroSection />
        <SearchSection />
        <ListingsGrid />
      </div>
      <Footer />
    </div>
  );
}
