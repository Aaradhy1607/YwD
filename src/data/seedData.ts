export interface SeedCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: string;
  description: string;
  subcategories: { id: string; name: string; slug: string }[];
}

export interface SeedProduct {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  conditionGrade: string;
  rentalPriceHourly?: number;
  rentalPriceDaily: number;
  rentalPriceWeekly: number;
  rentalPriceMonthly?: number;
  rentalPriceSemester?: number;
  buyPrice?: number;
  mrpReference: number;
  deposit: number;
  isRentable: boolean;
  isPurchasable: boolean;
  isAvailable: boolean;
  campusHub: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  images: string[];
  conditionPhotos: string[];
  specs: Record<string, string>;
  owner: {
    alias: string;
    avatarColor: string;
    trustScore: number;
    completedRentals: number;
    campusHub: string;
  };
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    id: "cat_electronics",
    name: "Electronics & Tech",
    slug: "electronics",
    icon: "Laptop",
    count: "0 Listings",
    description: "High-performance laptops, 4K mirrorless cameras, graphic tablets, and console gaming setups.",
    subcategories: [
      { id: "sub_laptops", name: "Laptops & MacBooks", slug: "laptops" },
      { id: "sub_cameras", name: "Cameras & Lenses", slug: "cameras" },
      { id: "sub_tablets", name: "Tablets & iPads", slug: "tablets" },
      { id: "sub_gaming", name: "Gaming Gear & Consoles", slug: "gaming" },
      { id: "sub_audio", name: "Headphones & Audio", slug: "audio" },
    ],
  },
  {
    id: "cat_education",
    name: "Academic & Education",
    slug: "education",
    icon: "BookOpen",
    count: "0 Listings",
    description: "Semester textbooks, CAS scientific calculators, lab kits, drawing drafters, and reference manuals.",
    subcategories: [
      { id: "sub_textbooks", name: "Academic Textbooks", slug: "textbooks" },
      { id: "sub_calculators", name: "Graphing Calculators", slug: "calculators" },
      { id: "sub_lab", name: "Lab & Engineering Kits", slug: "lab-equipment" },
      { id: "sub_reference", name: "Exam Guides & Notes", slug: "reference" },
    ],
  },
  {
    id: "cat_college",
    name: "College Essentials",
    slug: "college-essentials",
    icon: "Home",
    count: "0 Listings",
    description: "Hostel appliances, compact study desks, ergonomic chairs, desk fans, and dorm organizers.",
    subcategories: [
      { id: "sub_hostel", name: "Hostel Appliances", slug: "hostel-appliances" },
      { id: "sub_furniture", name: "Study Furniture", slug: "furniture" },
      { id: "sub_stationery", name: "Stationery & Organizers", slug: "stationery" },
    ],
  },
  {
    id: "cat_lifestyle",
    name: "Lifestyle & Travel",
    slug: "lifestyle",
    icon: "Shirt",
    count: "0 Listings",
    description: "Travel rucksacks, formal interview blazers, outdoor luggage, and wearable accessories.",
    subcategories: [
      { id: "sub_travel", name: "Rucksacks & Luggage", slug: "luggage" },
      { id: "sub_formal", name: "Formal & Convocation Wear", slug: "formal-wear" },
      { id: "sub_accessories", name: "Lifestyle Accessories", slug: "lifestyle-accessories" },
    ],
  },
  {
    id: "cat_sports",
    name: "Sports & Fitness",
    slug: "sports-fitness",
    icon: "Dumbbell",
    count: "0 Listings",
    description: "Badminton sets, campus bicycles, adjustable dumbbells, cricket kits, and yoga mats.",
    subcategories: [
      { id: "sub_bicycles", name: "Campus Bicycles", slug: "bicycles" },
      { id: "sub_fitness", name: "Gym & Weights", slug: "fitness-gear" },
      { id: "sub_rackets", name: "Racquet Sports", slug: "racquets" },
    ],
  },
  {
    id: "cat_events",
    name: "Events & Entertainment",
    slug: "events-entertainment",
    icon: "Sparkles",
    count: "0 Listings",
    description: "JBL party speakers, full HD smart projectors, acoustic guitars, stage spotlights, and mics.",
    subcategories: [
      { id: "sub_projectors", name: "Smart Projectors", slug: "projectors" },
      { id: "sub_speakers", name: "PA & Party Speakers", slug: "speakers" },
      { id: "sub_instruments", name: "Musical Instruments", slug: "instruments" },
    ],
  },
];

export const SEED_PRODUCTS: SeedProduct[] = [];
