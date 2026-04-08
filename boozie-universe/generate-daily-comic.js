#!/usr/bin/env node
// Daily comic generator for Boozie Universe
// Run this script daily (e.g. via cron: 0 6 * * * node generate-daily-comic.js)
// It appends a new comic to comics-data.js based on rotating scenarios

const fs = require('fs');
const path = require('path');

const SCENARIOS = [
  {
    title: "The Bird Situation",
    panels: [
      { caption: "A bird lands on the window ledge.", scene: "window_sitting", dialogue: [], narration: null },
      { caption: "Boozie's instincts activate.", scene: "boozie_intense", dialogue: [{ speaker: "boozie", text: "chk chk chk chk" }], narration: null },
      { caption: "The bird notices Boozie noticing the bird.", scene: "eye_contact", dialogue: [{ speaker: "boozie", text: "chk chk chk chk chk chk" }], narration: null },
      { caption: "The bird leaves. Dignity lost.", scene: "boozie_normal", dialogue: [{ speaker: "boozie", text: "I was practicing. I knew it would leave." }], narration: "The bird did not know." }
    ]
  },
  {
    title: "Donna Has a Phone Call",
    panels: [
      { caption: "Donna is on an important call.", scene: "donna_awake", dialogue: [{ speaker: "donna", text: "Yes, this is a really critical meeting—" }], narration: null },
      { caption: "Boozie enters the room.", scene: "boozie_staring", dialogue: [{ speaker: "boozie", text: "." }], narration: null },
      { caption: "Boozie sits directly in front of Donna.", scene: "boozie_intense", dialogue: [{ speaker: "boozie", text: ".." }], narration: null },
      { caption: "Boozie meows once, extremely loudly.", scene: "boozie_startled", dialogue: [{ speaker: "donna", text: "Sorry, that was my cat—" }, { speaker: "boozie", text: "FEED ME." }], narration: "The meeting was not that important." }
    ]
  },
  {
    title: "The Sacred Sunbeam",
    panels: [
      { caption: "A perfect sunbeam appears on the floor.", scene: "cozy_room", dialogue: [], narration: "The Boozie Universe shifts." },
      { caption: "Boozie investigates.", scene: "boozie_sniffing", dialogue: [{ speaker: "boozie", text: "Yes. This is mine." }], narration: null },
      { caption: "He flops into it with great intention.", scene: "boozie_napping", dialogue: [], narration: "Maximum loaf achieved." },
      { caption: "The sun moves. The sunbeam is gone.", scene: "boozie_staring", dialogue: [{ speaker: "boozie", text: "Donna. The sun has been cancelled." }], narration: "She did not fix it." }
    ]
  },
  {
    title: "Boozie Hears a Sound from Upstairs",
    panels: [
      { caption: "A perfectly ordinary afternoon.", scene: "boozie_loafing", dialogue: [{ speaker: "boozie", text: "All is well." }], narration: null },
      { caption: "A loud thud from the upstairs neighbor.", scene: "loud_noise", dialogue: [], narration: "Something fell somewhere." },
      { caption: "Boozie is no longer a loaf.", scene: "boozie_startled", dialogue: [{ speaker: "boozie", text: "WHO IS UP THERE. WHAT ARE THEY DOING." }], narration: null },
      { caption: "Donna assures him it's nothing.", scene: "boozie_under_couch", dialogue: [{ speaker: "donna", text: "Boozie, it's just the neighbors—" }, { speaker: "boozie", text: "I am not coming out until there is a full investigation." }], narration: "He came out 20 minutes later. Suspicious." }
    ]
  },
  {
    title: "The Cardboard Box",
    panels: [
      { caption: "A delivery arrives.", scene: "bag_on_floor", dialogue: [{ speaker: "donna", text: "Oh good, my order!" }], narration: null },
      { caption: "Boozie sees the box.", scene: "boozie_staring", dialogue: [{ speaker: "boozie", text: "That is mine." }], narration: null },
      { caption: "Donna unpacks it. The box remains.", scene: "boozie_circling", dialogue: [{ speaker: "boozie", text: "The universe has provided." }], narration: null },
      { caption: "He is in the box.", scene: "boozie_sitting_bag", dialogue: [{ speaker: "boozie", text: "I live here now." }], narration: "He lived there for two days." }
    ]
  },
  {
    title: "The 3am Zoomies",
    panels: [
      { caption: "3:17am. All is quiet.", scene: "sleeping_donna", dialogue: [], narration: null },
      { caption: "Something stirs in the Boozie Universe.", scene: "boozie_intense", dialogue: [{ speaker: "boozie", text: "IT IS TIME." }], narration: null },
      { caption: "Boozie runs the length of the apartment. Twice.", scene: "boozie_startled", dialogue: [], narration: "THUD THUD THUD THUD THUD" },
      { caption: "He sits perfectly still at the foot of the bed.", scene: "boozie_staring", dialogue: [{ speaker: "donna", text: "...Boozie?" }, { speaker: "boozie", text: "What. I'm just sitting here. Go back to sleep." }], narration: "She did not go back to sleep." }
    ]
  },
  {
    title: "Boozie Sees His Own Reflection",
    panels: [
      { caption: "Boozie discovers the bathroom mirror.", scene: "boozie_staring", dialogue: [], narration: null },
      { caption: "There is another cat in the mirror.", scene: "eye_contact", dialogue: [{ speaker: "boozie", text: "Who are you." }], narration: null },
      { caption: "The other cat mirrors his every move.", scene: "boozie_intense", dialogue: [{ speaker: "boozie", text: "Stop copying me. This is MY territory." }], narration: null },
      { caption: "Donna explains mirrors.", scene: "boozie_normal", dialogue: [{ speaker: "donna", text: "That's you, Boozie." }, { speaker: "boozie", text: "He looks like me but he is too handsome. I don't trust him." }], narration: "He still checks the mirror every morning." }
    ]
  },
  {
    title: "Seattle Autumn Report",
    panels: [
      { caption: "The leaves are changing.", scene: "seattle_rain", dialogue: [{ speaker: "boozie", text: "The colors are acceptable." }], narration: null },
      { caption: "A squirrel appears on the street.", scene: "bunny_spotted", dialogue: [{ speaker: "boozie", text: "That is not a bunny. And yet." }], narration: null },
      { caption: "Boozie watches it for 40 minutes.", scene: "boozie_watching_bunnies", dialogue: [], narration: "The squirrel is erratic. Unpredictable. Fascinating." },
      { caption: "The squirrel is gone. Boozie files a report.", scene: "boozie_on_laptop", dialogue: [{ speaker: "boozie", text: "Donna. Write this down. A small chaotic creature. Very suspicious." }], narration: "She did not write it down." }
    ]
  },
];

function getNextComicId(content) {
  const matches = content.match(/id:\s*(\d+)/g);
  if (!matches || matches.length === 0) return 1;
  const ids = matches.map(m => parseInt(m.replace(/id:\s*/, '')));
  return Math.max(...ids) + 1;
}

function getScenario(id) {
  return SCENARIOS[(id - 1) % SCENARIOS.length];
}

function comicToJS(comic) {
  return JSON.stringify(comic, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, '"');
}

function main() {
  const dataFile = path.join(__dirname, 'comics-data.js');
  let content = fs.readFileSync(dataFile, 'utf8');

  const nextId = getNextComicId(content);
  const today = new Date().toISOString().split('T')[0];
  const scenario = getScenario(nextId);

  const newComic = {
    id: nextId,
    title: scenario.title,
    date: today,
    panels: scenario.panels
  };

  // Insert before the closing bracket of COMICS array
  const insertPoint = content.lastIndexOf('];\n\n// Get today');
  if (insertPoint === -1) {
    console.error('Could not find insertion point in comics-data.js');
    process.exit(1);
  }

  const comicJSON = `  ${JSON.stringify(newComic, null, 2).split('\n').join('\n  ')}`;
  const updatedContent = content.slice(0, insertPoint) + ',\n' + comicJSON + '\n' + content.slice(insertPoint);

  fs.writeFileSync(dataFile, updatedContent, 'utf8');
  console.log(`Added comic #${nextId}: "${scenario.title}" for ${today}`);
}

main();
