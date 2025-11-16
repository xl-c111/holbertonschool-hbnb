import { Apple, Download } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative h-[90vh] mt-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/modern-luxury-house-with-glass-walls--trees--woode.png"
          alt="Modern luxury hotel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        {/* Get the app badge */}
        <div className="absolute top-8 right-8 bg-white rounded-full px-6 py-3 flex items-center gap-3 shadow-lg">
          <span className="text-sm font-medium">Get the app</span>
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5" />
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            <div className="bg-black rounded-full p-1.5">
              <Download className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="max-w-5xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 text-balance">
            Find amazing hotels, compare prices, and book your dream vacation easily
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto text-pretty">
            Search trusted hotels for unforgettable stays and hassle-free bookings. Find the best hotels near you in
            seconds with ease and confidence.
          </p>
        </div>
      </div>
    </section>
  );
}
