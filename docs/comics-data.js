// Boozie Universe Daily Comics
// Each comic has panels with SVG scenes, dialogue, and captions

const COMICS = [
  {
    id: 1,
    title: "Window Watch: The Bunny Incident",
    date: "2026-04-08",
    panels: [
      {
        caption: "7:43 AM. Boozie has claimed the window.",
        scene: "window_sitting",
        dialogue: [],
        narration: "The Booziest hour of the morning."
      },
      {
        caption: "A bunny appears on the street below.",
        scene: "bunny_spotted",
        dialogue: [{ speaker: "boozie", text: "..." }],
        narration: null
      },
      {
        caption: "Internal crisis.",
        scene: "boozie_intense",
        dialogue: [{ speaker: "boozie", text: "IT IS A BUNNY." }],
        narration: null
      },
      {
        caption: "The bunny hops away, unbothered.",
        scene: "bunny_leaving",
        dialogue: [{ speaker: "boozie", text: "COME BACK. I ONLY WANT TO DISCUSS THINGS." }],
        narration: "The Boozie Universe remains in chaos."
      }
    ]
  },
  {
    id: 2,
    title: "Hunger Games: The Boozie Edition",
    date: "2026-04-09",
    panels: [
      {
        caption: "5:57 AM. Three minutes before alarm.",
        scene: "sleeping_donna",
        dialogue: [],
        narration: null
      },
      {
        caption: "Boozie has calculated precisely when to strike.",
        scene: "boozie_staring",
        dialogue: [{ speaker: "boozie", text: "I am going to sit one inch from her face." }],
        narration: null
      },
      {
        caption: "Donna is awake.",
        scene: "donna_awake",
        dialogue: [
          { speaker: "donna", text: "Boozie it's not even 6am—" },
          { speaker: "boozie", text: "BREAKFAST." }
        ],
        narration: null
      },
      {
        caption: "Two minutes later.",
        scene: "boozie_eating",
        dialogue: [{ speaker: "boozie", text: "acceptable." }],
        narration: "The Boozie Universe is fed."
      }
    ]
  },
  {
    id: 3,
    title: "The Loud Noise",
    date: "2026-04-10",
    panels: [
      {
        caption: "A perfectly normal Tuesday.",
        scene: "boozie_loafing",
        dialogue: [{ speaker: "boozie", text: "I am a loaf. I am at peace." }],
        narration: null
      },
      {
        caption: "BANG.",
        scene: "loud_noise",
        dialogue: [],
        narration: "Something fell in the kitchen."
      },
      {
        caption: "Boozie has left his body.",
        scene: "boozie_startled",
        dialogue: [{ speaker: "boozie", text: "THE UNIVERSE IS ENDING—" }],
        narration: null
      },
      {
        caption: "It was a spatula.",
        scene: "boozie_under_couch",
        dialogue: [{ speaker: "donna", text: "Boozie it's just a spatula" }, { speaker: "boozie", text: "I will be under the couch." }],
        narration: "He stayed there for 45 minutes."
      }
    ]
  },
  {
    id: 4,
    title: "Memories of Cairo",
    date: "2026-04-11",
    panels: [
      {
        caption: "Boozie stares into the middle distance.",
        scene: "boozie_staring_dreamy",
        dialogue: [],
        narration: "Sometimes, he remembers Egypt."
      },
      {
        caption: "The warm courtyards. The ancient light.",
        scene: "egypt_memory",
        dialogue: [{ speaker: "boozie", text: "I was born on the streets. I was magnificent." }],
        narration: null
      },
      {
        caption: "Then Donna showed up.",
        scene: "donna_cairo",
        dialogue: [
          { speaker: "donna", text: "hello little baby" },
          { speaker: "boozie", text: "...I suppose she will do." }
        ],
        narration: null
      },
      {
        caption: "He doesn't admit this, but it was the best day.",
        scene: "boozie_content",
        dialogue: [{ speaker: "boozie", text: "(it was the best day)" }],
        narration: "The Boozie origin story."
      }
    ]
  },
  {
    id: 5,
    title: "The Other Cat Situation",
    date: "2026-04-12",
    panels: [
      {
        caption: "A stranger cat walks below the window.",
        scene: "street_cat",
        dialogue: [],
        narration: null
      },
      {
        caption: "They make eye contact.",
        scene: "eye_contact",
        dialogue: [{ speaker: "street_cat", text: "hey" }],
        narration: null
      },
      {
        caption: "Boozie puffs up to maximum Maine Coon size.",
        scene: "boozie_puffed",
        dialogue: [{ speaker: "boozie", text: "THIS IS MY WINDOW. MY STREET. MY BUNNIES." }],
        narration: null
      },
      {
        caption: "The street cat moves on.",
        scene: "boozie_normal",
        dialogue: [{ speaker: "boozie", text: "Good. They know." }],
        narration: "Sovereignty maintained."
      }
    ]
  },
  {
    id: 6,
    title: "The Great Migration (Illustrated)",
    date: "2026-04-13",
    panels: [
      {
        caption: "Age 1. A carrier appeared.",
        scene: "carrier_appears",
        dialogue: [{ speaker: "boozie", text: "What is this box." }],
        narration: null
      },
      {
        caption: "Many hours later. Somewhere above the Atlantic.",
        scene: "airplane",
        dialogue: [{ speaker: "boozie", text: "I am in a tube in the sky and I am NOT happy." }],
        narration: null
      },
      {
        caption: "Washington DC. First impressions.",
        scene: "dc_window",
        dialogue: [{ speaker: "boozie", text: "No pyramids. Suspicious." }],
        narration: null
      },
      {
        caption: "But there were bunnies.",
        scene: "dc_bunnies",
        dialogue: [{ speaker: "boozie", text: "...I will allow it." }],
        narration: "And so the Boozie took root in America."
      }
    ]
  },
  {
    id: 7,
    title: "Seattle Rain Report",
    date: "2026-04-14",
    panels: [
      {
        caption: "Day 1 in Seattle.",
        scene: "seattle_rain",
        dialogue: [{ speaker: "boozie", text: "It is wet." }],
        narration: null
      },
      {
        caption: "Day 30 in Seattle.",
        scene: "seattle_rain",
        dialogue: [{ speaker: "boozie", text: "It is still wet." }],
        narration: null
      },
      {
        caption: "Day 200 in Seattle.",
        scene: "boozie_window_rain",
        dialogue: [{ speaker: "boozie", text: "The bunnies don't mind the rain." }],
        narration: null
      },
      {
        caption: "Boozie has adapted.",
        scene: "boozie_cozy",
        dialogue: [{ speaker: "boozie", text: "The window is warm. The street is wet. Balance." }],
        narration: "The Booziest Boozie endures."
      }
    ]
  },
  {
    id: 8,
    title: "The Suspicious Bag",
    date: "2026-04-15",
    panels: [
      {
        caption: "Donna left a grocery bag on the floor.",
        scene: "bag_on_floor",
        dialogue: [{ speaker: "boozie", text: "What is this." }],
        narration: null
      },
      {
        caption: "He circles it three times.",
        scene: "boozie_circling",
        dialogue: [{ speaker: "boozie", text: "It could be anything. A trap. A portal." }],
        narration: null
      },
      {
        caption: "He sniffs it.",
        scene: "boozie_sniffing",
        dialogue: [{ speaker: "boozie", text: "Chicken. CHICKEN." }],
        narration: null
      },
      {
        caption: "He sits on it.",
        scene: "boozie_sitting_bag",
        dialogue: [{ speaker: "boozie", text: "Mine." }],
        narration: "This is the way of the Boozie."
      }
    ]
  },
  {
    id: 9,
    title: "Nap Science",
    date: "2026-04-16",
    panels: [
      {
        caption: "9:00 AM. Nap one.",
        scene: "boozie_napping",
        dialogue: [],
        narration: null
      },
      {
        caption: "11:30 AM. Nap two (the recovery nap).",
        scene: "boozie_napping",
        dialogue: [],
        narration: null
      },
      {
        caption: "2:15 PM. Nap three (exploratory).",
        scene: "boozie_napping",
        dialogue: [],
        narration: null
      },
      {
        caption: "4:00 PM. Time to wake Donna up from her work nap.",
        scene: "boozie_on_laptop",
        dialogue: [{ speaker: "boozie", text: "You've worked enough. Pay attention to me." }],
        narration: "A full and productive day in the Boozie Universe."
      }
    ]
  },
  {
    id: 10,
    title: "The Bunny Council",
    date: "2026-04-17",
    panels: [
      {
        caption: "Three bunnies appear simultaneously.",
        scene: "three_bunnies",
        dialogue: [],
        narration: "Boozie has never seen this before."
      },
      {
        caption: "They appear to be... deliberating.",
        scene: "boozie_watching_bunnies",
        dialogue: [{ speaker: "boozie", text: "They are having a meeting." }],
        narration: null
      },
      {
        caption: "Boozie presses his face against the glass.",
        scene: "boozie_face_glass",
        dialogue: [{ speaker: "boozie", text: "WHAT ARE YOU DECIDING." }],
        narration: null
      },
      {
        caption: "The bunnies hop away.",
        scene: "empty_street",
        dialogue: [{ speaker: "boozie", text: "I will never know. This haunts me." }],
        narration: "The Boozie Universe has mysteries."
      }
    ]
  }
];

// Get today's comic based on date cycling
function getTodaysComic() {
  const today = new Date();
  const startDate = new Date("2026-04-08");
  const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const index = Math.max(0, daysSinceStart) % COMICS.length;
  return COMICS[index];
}

function getAllComics() {
  return COMICS;
}
