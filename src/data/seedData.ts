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
    count: "48+ Listings",
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
    count: "65+ Listings",
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
    count: "32+ Listings",
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
    count: "29+ Listings",
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
    count: "24+ Listings",
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
    count: "19+ Listings",
    description: "JBL party speakers, full HD smart projectors, acoustic guitars, stage spotlights, and mics.",
    subcategories: [
      { id: "sub_projectors", name: "Smart Projectors", slug: "projectors" },
      { id: "sub_speakers", name: "PA & Party Speakers", slug: "speakers" },
      { id: "sub_instruments", name: "Musical Instruments", slug: "instruments" },
    ],
  },
];

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: "prod_macbook_m3",
    title: "Apple MacBook Pro 14\" (M3 Pro, 18GB, 512GB SSD) - Space Black",
    description: "Flawless M3 Pro workstation ideal for app development, Machine Learning thesis runs, 4K rendering, or hackathons. Includes 70W MagSafe fast charger and protective hardshell sleeve.",
    categorySlug: "electronics",
    subcategorySlug: "laptops",
    conditionGrade: "Mint (Like New)",
    rentalPriceHourly: 150,
    rentalPriceDaily: 699,
    rentalPriceWeekly: 3499,
    rentalPriceMonthly: 11999,
    rentalPriceSemester: 29999,
    buyPrice: 148000,
    mrpReference: 199900,
    deposit: 8000,
    isRentable: true,
    isPurchasable: true,
    isAvailable: true,
    campusHub: "Tech Tower Hub • Ground Floor Room 12",
    pickupAvailable: true,
    deliveryAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80",
    ],
    conditionPhotos: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    ],
    specs: {
      Processor: "Apple M3 Pro (11-core CPU, 14-core GPU)",
      RAM: "18GB Unified Memory",
      Storage: "512GB Ultra-Fast SSD",
      BatteryHealth: "98% (62 cycles)",
      OS: "macOS Sequoia",
    },
    owner: {
      alias: "EcoScholar-8421",
      avatarColor: "#18352D",
      trustScore: 99.4,
      completedRentals: 31,
      campusHub: "Tech Tower Hub",
    },
  },
  {
    id: "prod_sony_a7iv",
    title: "Sony Alpha 7 IV Full-Frame Camera + FE 24-70mm f/2.8 GM Lens",
    description: "Industry-standard hybrid mirrorless camera for campus film festivals, club shoots, model portfolios, and convocation portraits. Supplied with 2 batteries, 128GB V90 SD card, and camera rig bag.",
    categorySlug: "electronics",
    subcategorySlug: "cameras",
    conditionGrade: "Excellent",
    rentalPriceHourly: 190,
    rentalPriceDaily: 899,
    rentalPriceWeekly: 4200,
    rentalPriceMonthly: 14500,
    rentalPriceSemester: 38000,
    buyPrice: 195000,
    mrpReference: 262000,
    deposit: 9500,
    isRentable: true,
    isPurchasable: true,
    isAvailable: true,
    campusHub: "Media & Arts Studio Hub • Room 204",
    pickupAvailable: true,
    deliveryAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80",
    ],
    conditionPhotos: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
    ],
    specs: {
      Sensor: "33MP Full-Frame Exmor R CMOS",
      Video: "4K 60p 10-Bit 4:2:2 All-Intra",
      Autofocus: "759 Phase-Detect Points Real-Time Eye AF",
      LensIncluded: "Sony FE 24-70mm f/2.8 GM G-Master",
    },
    owner: {
      alias: "LensCraft-3302",
      avatarColor: "#C46A42",
      trustScore: 98.8,
      completedRentals: 47,
      campusHub: "Media & Arts Studio Hub",
    },
  },
  {
    id: "prod_ti_nspire_cx2",
    title: "Texas Instruments TI-Nspire CX II CAS Color Graphing Calculator",
    description: "Approved for AP Calculus, SAT, Engineering Dynamics, and Advanced Mathematics exams. Features high-res color backlit display and full rechargeable battery.",
    categorySlug: "education",
    subcategorySlug: "calculators",
    conditionGrade: "Mint (Like New)",
    rentalPriceHourly: 35,
    rentalPriceDaily: 120,
    rentalPriceWeekly: 450,
    rentalPriceMonthly: 1200,
    rentalPriceSemester: 2400,
    buyPrice: 11500,
    mrpReference: 17500,
    deposit: 1500,
    isRentable: true,
    isPurchasable: true,
    isAvailable: true,
    campusHub: "Central Library Hub • Counter 4",
    pickupAvailable: true,
    deliveryAvailable: false,
    images: [
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=1000&q=80",
    ],
    conditionPhotos: [
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
    ],
    specs: {
      Display: "3.2\" 320x240 Color Backlit",
      Engine: "CAS (Computer Algebra System)",
      Storage: "100MB Flash ROM",
      ExamReady: "Permitted on AP/SAT/Engineering finals",
    },
    owner: {
      alias: "MathPeer-1904",
      avatarColor: "#789681",
      trustScore: 100,
      completedRentals: 18,
      campusHub: "Central Library Hub",
    },
  },
  {
    id: "prod_ps5_bundle",
    title: "Sony PlayStation 5 Disc Edition + 2 DualSense Controllers + 3 Games",
    description: "Weekend hostel tournament ready! Includes FC 24, Spider-Man 2, and Mortal Kombat 1. All necessary ultra-high speed HDMI cables and controller charging stand included.",
    categorySlug: "electronics",
    subcategorySlug: "gaming",
    conditionGrade: "Excellent",
    rentalPriceHourly: 95,
    rentalPriceDaily: 499,
    rentalPriceWeekly: 2199,
    rentalPriceMonthly: 5999,
    rentalPriceSemester: 14999,
    buyPrice: 38000,
    mrpReference: 54990,
    deposit: 5000,
    isRentable: true,
    isPurchasable: true,
    isAvailable: true,
    campusHub: "Metro Tech Hub • Locker Bay B",
    pickupAvailable: true,
    deliveryAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80",
    ],
    conditionPhotos: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
    ],
    specs: {
      Model: "PS5 Disc Edition (CFI-1208A)",
      Controllers: "2x Original DualSense Wireless",
      IncludedGames: "FC 24, Spider-Man 2, Mortal Kombat 1",
      Storage: "825GB Custom NVMe SSD",
    },
    owner: {
      alias: "NexusGamer-7721",
      avatarColor: "#7052DF",
      trustScore: 97.9,
      completedRentals: 64,
      campusHub: "Metro Tech Hub",
    },
  },
  {
    id: "prod_smart_projector",
    title: "Anker Nebula Capsule 3 Laser 1080p Smart Projector with Google TV",
    description: "Compact soda-can sized portable cinema projector with built-in battery (2.5 hrs playback), 300 ANSI lumens, auto-keystone correction, and 8W Dolby sound.",
    categorySlug: "events-entertainment",
    subcategorySlug: "projectors",
    conditionGrade: "Mint (Like New)",
    rentalPriceHourly: 70,
    rentalPriceDaily: 380,
    rentalPriceWeekly: 1650,
    rentalPriceMonthly: 4500,
    rentalPriceSemester: 9800,
    buyPrice: 39000,
    mrpReference: 59990,
    deposit: 3500,
    isRentable: true,
    isPurchasable: true,
    isAvailable: true,
    campusHub: "City Center Hub • Handover Desk",
    pickupAvailable: true,
    deliveryAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1000&q=80",
    ],
    conditionPhotos: [
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80",
    ],
    specs: {
      Resolution: "1080p Full HD Laser",
      Brightness: "300 ANSI Lumens",
      Audio: "8W Dolby Digital Speaker",
      OS: "Official Google TV with Netflix / Prime",
    },
    owner: {
      alias: "CinemaPeer-9042",
      avatarColor: "#2DD4BF",
      trustScore: 99.1,
      completedRentals: 28,
      campusHub: "City Center Hub",
    },
  },
  {
    id: "prod_campus_bicycle",
    title: "Firefox Target 21-Speed Alloy Mountain Bicycle (Medium Frame)",
    description: "Lightweight aluminum MTB with front suspension fork and Shimano 21-speed gears. Perfect for commuting and fitness. Comes with combination cable lock and LED headlamp.",
    categorySlug: "sports-fitness",
    subcategorySlug: "bicycles",
    conditionGrade: "Good (Minor Wear)",
    rentalPriceHourly: 25,
    rentalPriceDaily: 90,
    rentalPriceWeekly: 380,
    rentalPriceMonthly: 950,
    rentalPriceSemester: 2100,
    buyPrice: 9500,
    mrpReference: 18500,
    deposit: 1000,
    isRentable: true,
    isPurchasable: true,
    isAvailable: true,
    campusHub: "Main Gate Cycle Stand Hub",
    pickupAvailable: true,
    deliveryAvailable: false,
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80",
    ],
    conditionPhotos: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    ],
    specs: {
      Frame: "Alloy 6061 Hardtail 18-inch",
      Gears: "Shimano Tourney 21-Speed",
      Brakes: "Front & Rear Mechanical Disc",
      Accessories: "Number Lock, Bottle Cage, Front LED",
    },
    owner: {
      alias: "Velocitas-1109",
      avatarColor: "#10B981",
      trustScore: 98.2,
      completedRentals: 39,
      campusHub: "Main Gate Cycle Stand Hub",
    },
  },
  {
    id: "prod_cormen_algorithms",
    title: "Introduction to Algorithms (CLRS 4th Edition) Hardcover",
    description: "The definitive algorithms textbook for Data Structures & Algorithms coursework and coding interview prep. Clean copy with no markings or torn pages.",
    categorySlug: "education",
    subcategorySlug: "textbooks",
    conditionGrade: "Mint (Like New)",
    rentalPriceHourly: 15,
    rentalPriceDaily: 40,
    rentalPriceWeekly: 140,
    rentalPriceMonthly: 380,
    rentalPriceSemester: 750,
    buyPrice: 2400,
    mrpReference: 5200,
    deposit: 600,
    isRentable: true,
    isPurchasable: true,
    isAvailable: true,
    campusHub: "CS Dept Study Lounge Hub",
    pickupAvailable: true,
    deliveryAvailable: false,
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
    ],
    conditionPhotos: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    ],
    specs: {
      Edition: "4th Edition (MIT Press / PHI)",
      Pages: "1312 pages",
      Condition: "Hardcover, zero highlights, crisp binding",
      Subject: "Algorithms, Graph Theory, NP-Completeness",
    },
    owner: {
      alias: "CodeScholar-5021",
      avatarColor: "#8B5CF6",
      trustScore: 99.7,
      completedRentals: 22,
      campusHub: "CS Dept Study Lounge Hub",
    },
  },
  {
    id: "prod_hostel_fridge",
    title: "Haier 53-Litre Single Door Mini Refrigerator (Direct Cool)",
    description: "Compact dorm room mini fridge with quick freeze compartment and anti-fungal gasket. Low power consumption (4-star rated), silent compressor.",
    categorySlug: "college-essentials",
    subcategorySlug: "hostel-appliances",
    conditionGrade: "Good (Minor Wear)",
    rentalPriceHourly: 30,
    rentalPriceDaily: 110,
    rentalPriceWeekly: 450,
    rentalPriceMonthly: 1250,
    rentalPriceSemester: 2900,
    buyPrice: 6500,
    mrpReference: 11990,
    deposit: 1500,
    isRentable: true,
    isPurchasable: true,
    isAvailable: true,
    campusHub: "Hostel Zone 3 Hub",
    pickupAvailable: true,
    deliveryAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80",
    ],
    conditionPhotos: [
      "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
    ],
    specs: {
      Capacity: "53 Litres",
      Cooling: "Direct Cool with Ice Zone",
      Defrosting: "Manual Defrost",
      EnergyRating: "4 Star Energy Efficient",
    },
    owner: {
      alias: "HostelNest-6320",
      avatarColor: "#0D9488",
      trustScore: 98.4,
      completedRentals: 15,
      campusHub: "Hostel Zone 3 Hub",
    },
  },
];
