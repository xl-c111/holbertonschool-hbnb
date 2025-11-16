export const properties = [
  {
    id: 1,
    name: "Mirror House Sud",
    type: "Minimalist",
    location: "Bolzano, Italy",
    fullLocation: "Bolzano, Trentino-Alto Adige/South Tyrol, Italy",
    price: 1600,
    rating: 4.82,
    reviews: 55,
    image: "/modern-luxury-house.png",
    images: [
      "/modern-luxury-house-with-glass-walls-exterior.png",
      "/modern-house-interior-evening-lighting.png",
      "/modern-house-exterior-evening-pathway.png",
      "/modern-luxury-house-architecture-twilight.png"
    ],
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    description: "Mirror Houses are two small houses immersed in a beautiful scenery of apple orchards just outside, in the wonderful surroundings of the South Tyrolean Dolomites. The Mirror Houses offer a unique opportunity to spend a wonderful holiday surrounded by contemporary architecture of the highest standards in close contact with one of the most evocative landscapes that nature can offer.",
    amenities: ["Kitchen", "Wi-Fi", "Free parking", "Pool", "TV", "Washer", "Air conditioning", "Hair dryer"]
  },
  {
    id: 2,
    name: "Mountain Villa",
    type: "Mountain Villa",
    location: "Aspen, Colorado",
    fullLocation: "Aspen, Colorado, United States",
    price: 2200,
    rating: 4.95,
    reviews: 128,
    image: "/mountain-villa-with-snow.png",
    images: [
      "/mountain-villa-with-snow.png",
      "/secluded-mountain-villa.png"
    ],
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    description: "Luxurious mountain villa with stunning views of the Aspen peaks. Perfect for winter getaways with easy access to world-class skiing and year-round outdoor activities.",
    amenities: ["Kitchen", "Wi-Fi", "Free parking", "Fireplace", "TV", "Washer", "Heating", "Mountain view"]
  },
  {
    id: 3,
    name: "Beach House",
    type: "Beach House",
    location: "Malibu, California",
    fullLocation: "Malibu, California, United States",
    price: 1850,
    rating: 4.78,
    reviews: 92,
    image: "/modern-beach-house-ocean-view.png",
    images: [
      "/modern-beach-house-ocean-view.png",
      "/secluded-beach-house.png"
    ],
    guests: 5,
    bedrooms: 3,
    bathrooms: 2,
    description: "Beautiful beachfront property with direct ocean access. Wake up to the sound of waves and enjoy stunning sunsets from your private deck.",
    amenities: ["Kitchen", "Wi-Fi", "Beach access", "Ocean view", "TV", "Washer", "Air conditioning", "Outdoor shower"]
  },
  {
    id: 4,
    name: "Forest Cabin",
    type: "Cabin",
    location: "Portland, Oregon",
    fullLocation: "Portland, Oregon, United States",
    price: 950,
    rating: 4.88,
    reviews: 67,
    image: "/modern-cabin-in-forest.png",
    images: [
      "/modern-cabin-in-forest.png",
      "/cozy-forest-cabin.png"
    ],
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    description: "Cozy cabin nestled in the forest, offering a peaceful retreat from city life. Perfect for nature lovers and hiking enthusiasts.",
    amenities: ["Kitchen", "Wi-Fi", "Free parking", "Fireplace", "TV", "Heating", "Forest view", "Hiking trails"]
  },
  {
    id: 5,
    name: "Desert Retreat",
    type: "Luxury",
    location: "Palm Springs, California",
    fullLocation: "Palm Springs, California, United States",
    price: 1450,
    rating: 4.91,
    reviews: 143,
    image: "/modern-desert-house-architecture.png",
    images: [
      "/modern-desert-house-architecture.png",
      "/desert-house.png"
    ],
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    description: "Modern desert retreat with stunning architecture and panoramic mountain views. Features a private pool and spa for ultimate relaxation.",
    amenities: ["Kitchen", "Wi-Fi", "Free parking", "Pool", "Spa", "TV", "Air conditioning", "Desert view"]
  },
  {
    id: 6,
    name: "Lake House",
    type: "Modern",
    location: "Lake Tahoe, Nevada",
    fullLocation: "Lake Tahoe, Nevada, United States",
    price: 1750,
    rating: 4.86,
    reviews: 89,
    image: "/modern-lake-house-with-dock.png",
    images: [
      "/modern-lake-house-with-dock.png"
    ],
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    description: "Lakefront property with private dock and breathtaking water views. Perfect for summer water activities and winter snow sports.",
    amenities: ["Kitchen", "Wi-Fi", "Free parking", "Lake access", "Dock", "TV", "Washer", "Heating"]
  }
];

export const getPropertyById = (id) => {
  return properties.find(property => property.id === parseInt(id));
};
