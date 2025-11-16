export function HeroSection() {
  return (
    <section className="relative h-[90vh] mt-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/modern-luxury-house-with-glass-walls--trees--woode.png"
          alt="Modern luxury stay"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        {/* Hero Text */}
        <div className="max-w-5xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 text-balance">
            Find amazing stays, compare prices, and book your dream vacation easily
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto text-pretty">
            Search trusted stays for unforgettable experiences and hassle-free bookings. Find the best places near you in
            seconds with ease and confidence.
          </p>
        </div>
      </div>
    </section>
  );
}
