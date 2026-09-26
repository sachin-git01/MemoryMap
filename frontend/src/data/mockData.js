export const MOCK_JOURNEYS = [
  {
    id: "demo-love-story",
    userId: "demo-user",
    journeyName: "Our Love Story ❤️",
    journeyType: "love",
    theme: "love",
    createdAt: "2023-02-12T00:00:00.000Z",
    startDate: "2023-02-12",
    privacy: "private"
  },
  {
    id: "demo-friendship",
    userId: "demo-user",
    journeyName: "College Crew ⚡",
    journeyType: "friendship",
    theme: "friendship",
    createdAt: "2019-08-15T00:00:00.000Z",
    startDate: "2019-08-15",
    privacy: "private"
  },
  {
    id: "demo-family",
    userId: "demo-user",
    journeyName: "The Family Album 🏡",
    journeyType: "family",
    theme: "family",
    createdAt: "2015-05-10T00:00:00.000Z",
    startDate: "2015-05-10",
    privacy: "private"
  },
  {
    id: "demo-personal",
    userId: "demo-user",
    journeyName: "My Path to Growth 🚀",
    journeyType: "personal",
    theme: "personal",
    createdAt: "2018-09-01T00:00:00.000Z",
    startDate: "2018-09-01",
    privacy: "private"
  }
];

export const MOCK_CHECKPOINTS = [
  // Love Story Checkpoints
  {
    id: "lc-1",
    journeyId: "demo-love-story",
    userId: "demo-user",
    title: "First Chat ⚡",
    date: "2023-02-12",
    description: "The day when everything started. A simple hello that changed our lives forever.",
    icon: "chat",
    photos: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "I was so nervous when replying. Looking back, it's the best text I've ever sent.",
    createdAt: "2023-02-12T10:00:00.000Z"
  },
  {
    id: "lc-2",
    journeyId: "demo-love-story",
    userId: "demo-user",
    title: "First Meet 🦋",
    date: "2023-02-18",
    description: "Finally met in person. So many butterflies! We spent hours walking and talking.",
    icon: "date",
    photos: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "I still remember the pink coat you wore. I couldn't stop smiling the whole time.",
    createdAt: "2023-02-18T18:00:00.000Z"
  },
  {
    id: "lc-3",
    journeyId: "demo-love-story",
    userId: "demo-user",
    title: "First Date ❤️",
    date: "2023-02-25",
    description: "Our first official date. I was so nervous but that day was so special.",
    icon: "hearts",
    photos: [
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "We had pasta and you spilled a bit of sauce. It was cute. Perfect in every way!",
    createdAt: "2023-02-25T20:30:00.000Z"
  },
  {
    id: "lc-4",
    journeyId: "demo-love-story",
    userId: "demo-user",
    title: "First Trip 📸",
    date: "2023-04-10",
    description: "Our first weekend trip together. Catching sunsets and exploring the hills.",
    icon: "trip",
    photos: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "Lost our way but found the most amazing viewpoint. 10/10 would get lost again.",
    createdAt: "2023-04-10T12:00:00.000Z"
  },
  {
    id: "lc-5",
    journeyId: "demo-love-story",
    userId: "demo-user",
    title: "Proposal 💍",
    date: "2025-08-15",
    description: "Under the stars, on the beach. She said yes! Our journey continues...",
    icon: "rings",
    photos: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "Hands were shaking, ring barely fit, but it was the happiest moment of my life.",
    createdAt: "2025-08-15T21:00:00.000Z"
  },

  // Friendship Checkpoints
  {
    id: "fc-1",
    journeyId: "demo-friendship",
    userId: "demo-user",
    title: "First Meet 🏫",
    date: "2019-08-15",
    description: "First day of college. We sat on the same bench in the orientation hall by accident.",
    icon: "smiley",
    photos: [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "We both didn't have a pen. Classic start to a great friendship.",
    createdAt: "2019-08-15T09:00:00.000Z"
  },
  {
    id: "fc-2",
    journeyId: "demo-friendship",
    userId: "demo-user",
    title: "School/College Fun 🍟",
    date: "2019-10-12",
    description: "Endless bunks, canteen memories, and completing assignments at 3 AM.",
    icon: "group",
    photos: [
      "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "Remember when we got caught sleeping in the back row? Good times.",
    createdAt: "2019-10-12T14:00:00.000Z"
  },
  {
    id: "fc-3",
    journeyId: "demo-friendship",
    userId: "demo-user",
    title: "Crazy Moments 🎂",
    date: "2020-01-20",
    description: "Surprise birthday party at midnight. Way too much cake and silly photos.",
    icon: "party",
    photos: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "The cake smash was legendary. We were washing frosting out of our hair for days.",
    createdAt: "2020-01-20T23:59:00.000Z"
  },
  {
    id: "fc-4",
    journeyId: "demo-friendship",
    userId: "demo-user",
    title: "First Trip 🏖️",
    date: "2021-04-14",
    description: "Beach bonfire night. Singing songs around the campfire under a clear starry sky.",
    icon: "music",
    photos: [
      "https://images.unsplash.com/photo-1526726576990-1ecfe0b61cd0?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "That night, we talked about everything and nothing. The waves, the songs, perfect vibes.",
    createdAt: "2021-04-14T21:00:00.000Z"
  },

  // Family Checkpoints
  {
    id: "fam-1",
    journeyId: "demo-family",
    userId: "demo-user",
    title: "Home Memories 🏡",
    date: "2015-05-10",
    description: "Moving into our new home. Everyone helping paint the living room walls.",
    icon: "home",
    photos: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "Mom got paint on her nose and we laughed for an hour. It felt like home instantly.",
    createdAt: "2015-05-10T12:00:00.000Z"
  },
  {
    id: "fam-2",
    journeyId: "demo-family",
    userId: "demo-user",
    title: "Festivals 🎉",
    date: "2018-11-07",
    description: "Annual family gathering. Cooking traditional recipes together and lighting up the garden.",
    icon: "festival",
    photos: [
      "https://images.unsplash.com/photo-1543258103-a62bdc069871?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "Grandma's special dessert was a massive hit as always.",
    createdAt: "2018-11-07T19:00:00.000Z"
  },

  // Personal Checkpoints
  {
    id: "pc-1",
    journeyId: "demo-personal",
    userId: "demo-user",
    title: "College Start 🎓",
    date: "2018-09-01",
    description: "Packing bags and moving to a new city to start my Computer Science degree.",
    icon: "school",
    photos: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "Nervous, excited, and ready to face the world. Everything felt so big.",
    createdAt: "2018-09-01T08:00:00.000Z"
  },
  {
    id: "pc-2",
    journeyId: "demo-personal",
    userId: "demo-user",
    title: "First Job Offer 💼",
    date: "2022-04-15",
    description: "Received my first software engineer job offer after months of interviews.",
    icon: "career",
    photos: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
    ],
    notes: "I jumped around the room. Hard work finally paid off!",
    createdAt: "2022-04-15T16:00:00.000Z"
  }
];

export const MOCK_NOTES = [
  // Love notes
  {
    id: "n-1",
    journeyId: "demo-love-story",
    userId: "demo-user",
    title: "Our Forever Promise",
    content: "Sometimes I just look at you and think how lucky I am to have you in my life. You mean the world to me, and I promise to stand by you through every step of this journey.",
    date: "2023-05-20",
    category: "Promise"
  },
  {
    id: "n-2",
    journeyId: "demo-love-story",
    userId: "demo-user",
    title: "Warm Thoughts",
    content: "Thank you for being my always and forever. I can't wait to see what our future holds as we write more checkpoints in our story.",
    date: "2024-01-01",
    category: "Letter"
  },
  {
    id: "n-3",
    journeyId: "demo-love-story",
    userId: "demo-user",
    title: "A Little Reminder",
    content: "Every moment with you feels calm, steady, and full of love. You are my peace in every season, and my favorite part of the story.",
    date: "2025-03-10",
    category: "Quote"
  },

  // Friendship notes
  {
    id: "n-4",
    journeyId: "demo-friendship",
    userId: "demo-user",
    title: "To the crazy times!",
    content: "Some of the best memories come from the craziest ideas. Thanks for always saying 'yes' to stupid road trips and late night milkshakes!",
    date: "2021-08-15",
    category: "Joke"
  },
  {
    id: "n-5",
    journeyId: "demo-friendship",
    userId: "demo-user",
    title: "The Crew Rules",
    content: "1. No studying during canteen hours.\n2. One bill split 5 ways, always.\n3. Birthday smashes are mandatory.",
    date: "2019-09-01",
    category: "Rule"
  },

  // Family notes
  {
    id: "n-6",
    journeyId: "demo-family",
    userId: "demo-user",
    title: "Home Truths",
    content: "Family is where life begins and love never ends. Reliving the paint session today—still the warmest memory.",
    date: "2016-01-01",
    category: "Family Note"
  },

  // Personal notes
  {
    id: "n-7",
    journeyId: "demo-personal",
    userId: "demo-user",
    title: "A letter to my future self",
    content: "Never stop learning, never stop building. You started with nothing in a small dorm room. Remember that hunger when you feel comfortable.",
    date: "2018-09-10",
    category: "Reflection"
  }
];

export const THEME_CONFIGS = {
  love: {
    name: "Love Story",
    theme: "love",
    mood: "Heartfelt & Soft",
    bgClass: "from-rose-50 to-red-100",
    textClass: "text-rose-950",
    mutedClass: "text-rose-800",
    borderClass: "border-rose-200",
    cardBg: "bg-white/80",
    suggestedCheckpoints: [
      "First Chat",
      "First Meet",
      "First Date",
      "First Trip",
      "Proposal",
      "Engagement",
      "Marriage",
      "Forever",
      "Our Life Together"
    ],
    icons: ["chat", "date", "hearts", "trip", "rings", "camera", "gift", "home"],
    emoji: "❤️"
  },
  friendship: {
    name: "Friendship",
    theme: "friendship",
    mood: "Playful & Vibrant",
    bgClass: "from-violet-50 to-violet-100",
    textClass: "text-violet-950",
    mutedClass: "text-violet-600",
    borderClass: "border-violet-200",
    cardBg: "bg-white/80",
    suggestedCheckpoints: [
      "First Meet",
      "School/College Fun",
      "Birthday Bash",
      "First Trip",
      "Crazy Moments",
      "Inside Jokes",
      "Graduation",
      "Still Together"
    ],
    icons: ["smiley", "group", "party", "music", "trip", "camera", "chat", "school"],
    emoji: "⚡"
  },
  family: {
    name: "Family",
    theme: "family",
    mood: "Warm & Cozy",
    bgClass: "from-amber-50/60 to-amber-100/40",
    textClass: "text-amber-950",
    mutedClass: "text-amber-800",
    borderClass: "border-amber-200",
    cardBg: "bg-white/80",
    suggestedCheckpoints: [
      "Home Memories",
      "Festivals",
      "Family Trip",
      "Birthday",
      "Old Photos",
      "Generations",
      "Special Day"
    ],
    icons: ["home", "festival", "gift", "group", "camera", "food", "album", "heart"],
    emoji: "🏡"
  },
  personal: {
    name: "Personal Life",
    theme: "personal",
    mood: "Clean & Inspiring",
    bgClass: "from-sky-50 to-sky-100",
    textClass: "text-slate-900",
    mutedClass: "text-slate-600",
    borderClass: "border-sky-200",
    cardBg: "bg-white/80",
    suggestedCheckpoints: [
      "Childhood",
      "School",
      "College",
      "Career",
      "Achievement",
      "Dream",
      "Today"
    ],
    icons: ["school", "career", "trophy", "flag", "gift", "camera", "trip", "home"],
    emoji: "🚀"
  },
  custom: {
    name: "Custom Journey",
    theme: "custom",
    mood: "Flexible & Creative",
    bgClass: "from-slate-50 to-slate-100",
    textClass: "text-slate-900",
    mutedClass: "text-slate-600",
    borderClass: "border-slate-200",
    cardBg: "bg-white/80",
    suggestedCheckpoints: [
      "Starting Out",
      "Milestone 1",
      "Milestone 2",
      "Big Day",
      "Where We Are Today"
    ],
    icons: ["flag", "heart", "camera", "trip", "home", "chat", "gift", "smiley"],
    emoji: "✨"
  }
};

export const CUSTOM_THEME_PRESETS = [
  {
    id: "starlit",
    name: "Starlit Dreams",
    mood: "soft star mood",
    colors: {
      primary: "#6366f1",
      secondary: "#a78bfa",
      accent: "#4338ca",
      accentHover: "#312e81",
      bgGradientFrom: "#eef2ff",
      bgGradientTo: "#f5f3ff"
    }
  },
  {
    id: "sunrise",
    name: "Sunrise Hope",
    mood: "warm new beginning",
    colors: {
      primary: "#f97316",
      secondary: "#fb7185",
      accent: "#c2410c",
      accentHover: "#9a3412",
      bgGradientFrom: "#fff7ed",
      bgGradientTo: "#ffe4e6"
    }
  },
  {
    id: "forest",
    name: "Forest Letters",
    mood: "calm and grounded",
    colors: {
      primary: "#16a34a",
      secondary: "#84cc16",
      accent: "#166534",
      accentHover: "#14532d",
      bgGradientFrom: "#f0fdf4",
      bgGradientTo: "#ecfccb"
    }
  },
  {
    id: "ocean",
    name: "Ocean Calm",
    mood: "clear and reflective",
    colors: {
      primary: "#0891b2",
      secondary: "#38bdf8",
      accent: "#0e7490",
      accentHover: "#155e75",
      bgGradientFrom: "#ecfeff",
      bgGradientTo: "#e0f2fe"
    }
  },
  {
    id: "rosewood",
    name: "Rosewood Archive",
    mood: "deep emotional keepsake",
    colors: {
      primary: "#be123c",
      secondary: "#f472b6",
      accent: "#9f1239",
      accentHover: "#881337",
      bgGradientFrom: "#fff1f2",
      bgGradientTo: "#fce7f3"
    }
  },
  {
    id: "golden",
    name: "Golden Hour",
    mood: "nostalgic and bright",
    colors: {
      primary: "#ca8a04",
      secondary: "#facc15",
      accent: "#a16207",
      accentHover: "#854d0e",
      bgGradientFrom: "#fefce8",
      bgGradientTo: "#fef3c7"
    }
  },
  {
    id: "monochrome",
    name: "Ink Minimal",
    mood: "clean personal journal",
    colors: {
      primary: "#334155",
      secondary: "#64748b",
      accent: "#0f172a",
      accentHover: "#020617",
      bgGradientFrom: "#f8fafc",
      bgGradientTo: "#e2e8f0"
    }
  }
];

export const CUSTOM_FONT_OPTIONS = [
  { id: "outfit", name: "Outfit", family: "\"Outfit\", \"Inter\", system-ui, sans-serif" },
  { id: "playfair", name: "Playfair", family: "\"Playfair Display\", Georgia, serif" },
  { id: "fredoka", name: "Fredoka", family: "\"Fredoka\", cursive, sans-serif" },
  { id: "lora", name: "Lora", family: "\"Lora\", Georgia, serif" },
  { id: "montserrat", name: "Montserrat", family: "\"Montserrat\", \"Inter\", sans-serif" }
];
