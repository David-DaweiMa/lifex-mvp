// src/lib/mockData.ts
import { Globe, Utensils, Dumbbell, Sparkles, Wrench, PawPrint, Home, TrendingUp, BarChart3, Coffee } from 'lucide-react';
import { darkTheme } from './theme';
import { Business, Booking, TrendingData, DiscoverContent, TrendingPost, Category } from './types';

export const mockBusinesses: Business[] = [
  {
    id: 1,
    name: "Café Supreme",
    type: "Coffee Shop",
    category: 'food',
    rating: 4.8,
    reviews: 234,
    distance: "0.3km",
    address: "118 Ponsonby Road, Auckland",
    phone: "09-555-0123",
    price: "$$",
    image: "from-amber-400 to-orange-500",
    tags: ["Fast WiFi", "Quiet", "Great Coffee"],
    highlights: ["Fast WiFi", "Quiet", "Great Coffee"],
    isOpen: true,
    aiReason: "Perfect for remote work with excellent coffee and reliable WiFi.",
    waitTime: "5-10 min",
    confidence: 95,
    latitude: -36.8485,
    longitude: 174.7633
  },
  {
    id: 2,
    name: "FitNZ Personal Training",
    type: "Gym & Fitness",
    category: 'fitness',
    rating: 4.9,
    reviews: 187,
    distance: "0.5km",
    address: "42 Newton Road, Auckland",
    phone: "09-555-0124",
    price: "$$$",
    image: "from-green-400 to-emerald-500",
    tags: ["Personal Training", "Beginner Friendly", "Flexible Hours"],
    highlights: ["Personal Training", "Beginner Friendly", "Flexible Hours"],
    isOpen: true,
    aiReason: "Top-rated trainers specializing in beginner-friendly programs.",
    waitTime: "Immediate",
    confidence: 92,
    latitude: -36.8585,
    longitude: 174.7533
  },
  {
    id: 3,
    name: "Beauty Bliss Salon",
    type: "Beauty & Spa",
    category: 'beauty',
    rating: 4.7,
    reviews: 156,
    distance: "0.8km",
    address: "25 High Street, Auckland",
    phone: "09-555-0125",
    price: "$$$",
    image: "from-pink-400 to-rose-500",
    tags: ["Eco-Friendly", "Expert Staff", "Relaxing"],
    highlights: ["Eco-Friendly", "Expert Staff", "Relaxing"],
    isOpen: true,
    aiReason: "Sustainable beauty treatments with highly experienced professionals.",
    waitTime: "By appointment",
    confidence: 88,
    latitude: -36.8385,
    longitude: 174.7733
  }
];

export const mockBookings: Booking[] = [
  {
    id: 1,
    service: "House Cleaning",
    provider: "Sparkle Clean Co",
    date: "2025-01-15",
    time: "10:00 AM",
    status: "confirmed",
    category: "cleaning",
    price: "$120",
    reminder: true
  },
  {
    id: 2,
    service: "Hair Appointment",
    provider: "Style Studio",
    date: "2025-01-18",
    time: "2:30 PM", 
    status: "pending",
    category: "beauty",
    price: "$85",
    reminder: true
  },
  {
    id: 3,
    service: "Personal Training",
    provider: "FitNZ Gym",
    date: "2025-01-20",
    time: "6:00 PM", 
    status: "confirmed",
    category: "fitness",
    price: "$65",
    reminder: false
  }
];

export const trendingData: TrendingData[] = [
  {
    id: 1,
    title: "AI-Powered Home Automation",
    category: "Smart Home",
    growth: "+340%",
    description: "Voice assistants and smart devices revolutionizing NZ homes",
    icon: Home,
    color: darkTheme.neon.blue,
    trend: "rising"
  },
  {
    id: 2,
    title: "Plant-Based Dining Revolution",
    category: "Food & Beverage",
    growth: "+220%",
    description: "Auckland's plant-based restaurant scene exploding with innovation",
    icon: Coffee,
    color: darkTheme.neon.green,
    trend: "hot"
  },
  {
    id: 3,
    title: "Digital Wellness Services",
    category: "Health & Fitness",
    growth: "+180%",
    description: "Mental health apps and online therapy gaining massive adoption",
    icon: Sparkles,
    color: darkTheme.neon.pink,
    trend: "growing"
  },
  {
    id: 4,
    title: "Eco-Friendly Beauty Products",
    category: "Beauty & Personal Care",
    growth: "+150%",
    description: "Sustainable beauty brands capturing Kiwi consumers",
    icon: Sparkles,
    color: darkTheme.neon.purple,
    trend: "steady"
  }
];

export const discoverContent: DiscoverContent[] = [
  {
    id: 1,
    title: "Hidden Coffee Gems in Ponsonby",
    description: "Local baristas reveal their secret spots for the perfect flat white",
    category: 'food',
    author: "CoffeeConnoisseur",
    likes: "2.4k",
    image: "from-amber-400 to-orange-500",
    tags: ["Coffee", "Local Spots", "Ponsonby"],
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Best Personal Trainers in Auckland",
    description: "Transform your fitness journey with these top-rated trainers",
    category: 'fitness',
    author: "FitKiwi",
    likes: "1.8k",
    image: "from-green-400 to-emerald-500",
    tags: ["Fitness", "Personal Training", "Auckland"],
    readTime: "7 min read"
  },
  {
    id: 3,
    title: "Eco-Friendly Beauty Salons Guide",
    description: "Sustainable beauty treatments that care for you and the environment",
    category: 'beauty',
    author: "GreenBeauty",
    likes: "1.5k",
    image: "from-pink-400 to-rose-500",
    tags: ["Beauty", "Eco-Friendly", "Sustainable"],
    readTime: "6 min read"
  },
  {
    id: 4,
    title: "Emergency Home Repair Services",
    description: "24/7 reliable services for when things go wrong at home",
    category: 'home',
    author: "HandyHelper",
    likes: "982",
    image: "from-blue-400 to-indigo-500",
    tags: ["Home Repair", "Emergency", "24/7"],
    readTime: "4 min read"
  }
];

export const trendingPosts: TrendingPost[] = [
  {
    id: 1,
    title: "Best Coffee Spots in Auckland ☕️",
    content: "Found this amazing coffee shop in Ponsonby! The owner is Italian and makes incredible hand-drip coffee 🔥 Perfect window seat for people watching, and fast WiFi makes it ideal for work ✨",
    author: {
      name: "KiwiCoffee",
      avatar: "☕",
      verified: true
    },
    images: ["from-amber-400 to-orange-500", "from-yellow-400 to-amber-500"],
    likes: 1234,
    comments: 89,
    shares: 45,
    location: "Ponsonby, Auckland",
    tags: ["Coffee", "Workspace", "Ponsonby", "Italian Coffee"],
    timeAgo: "2 hours ago",
    category: "food"
  },
  {
    id: 2,
    title: "New Zealand Gym Guide 💪",
    content: "After trying 10 gyms, I found the perfect one! FitNZ is amazing - super patient trainers, new equipment, and they're especially beginner-friendly 💯 No judgment for first-timers!",
    author: {
      name: "FitnessNewbie",
      avatar: "💪",
      verified: false
    },
    images: ["from-green-400 to-emerald-500"],
    likes: 892,
    comments: 156,
    shares: 78,
    location: "Newton, Auckland",
    tags: ["Fitness", "Beginner Friendly", "Weight Loss", "Personal Training"],
    timeAgo: "5 hours ago",
    category: "fitness"
  },
  {
    id: 3,
    title: "Sustainable Beauty Revolution 🌿",
    content: "This eco-friendly salon is changing the game! All organic products, zero waste policy, and the most relaxing atmosphere. Finally found beauty treatments that align with my values 🌱",
    author: {
      name: "EcoBeauty",
      avatar: "🌿",
      verified: true
    },
    images: ["from-green-400 to-emerald-600"],
    likes: 1456,
    comments: 203,
    shares: 89,
    location: "Newmarket, Auckland",
    tags: ["Eco-Friendly", "Sustainable", "Beauty", "Organic"],
    timeAgo: "1 day ago",
    category: "beauty"
  }
];

export const discoverCategories: Category[] = [
  { id: 'all', name: 'All', icon: Globe, color: darkTheme.neon.purple },
  { id: 'food', name: 'Food & Drink', icon: Utensils, color: darkTheme.neon.red },
  { id: 'fitness', name: 'Fitness & Health', icon: Dumbbell, color: darkTheme.neon.green },
  { id: 'beauty', name: 'Beauty & Style', icon: Sparkles, color: darkTheme.neon.pink },
  { id: 'home', name: 'Home Services', icon: Wrench, color: darkTheme.neon.blue },
  { id: 'pets', name: 'Pet Services', icon: PawPrint, color: darkTheme.neon.yellow },
];

export const quickPrompts = [
  ["Where's the best flat white in Ponsonby?", "Kid-friendly restaurants with play areas", "Cheap eats under $15 near Queen Street"],
  ["24/7 plumber for blocked drains", "House cleaner for weekly visits", "Dog grooming with pickup service"],
  ["Indoor activities for rainy Auckland days", "Beginner-friendly hiking trails 1 hour from city", "Weekend markets with organic produce"]
];

export const recentDiscoveries = [
  { icon: "☕", text: "Best brunch spots in Mt Eden with outdoor seating" },
  { icon: "💪", text: "Affordable personal trainer near Albany for beginners" },
  { icon: "🐕", text: "Emergency vet open late nights in West Auckland" }
];