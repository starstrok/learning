// SVG scene renderer for Boozie Universe comics

const COLORS = {
  boozieFur: "#8B7355",
  boozieStripe: "#6B5335",
  boozieEyes: "#4CAF50",
  donna: "#E8B89A",
  donnaHair: "#4A3728",
  sky: "#87CEEB",
  ground: "#90EE90",
  sidewalk: "#C8C8C8",
  windowFrame: "#8B4513",
  bunnyFur: "#F5F5DC",
  wall: "#F5E6C8",
  night: "#1a1a3e",
  egypt: "#F4A460",
  rain: "#6699CC",
  couch: "#8B6914",
};

// Draw Boozie the Maine Coon
function drawBoozie(x, y, scale=1, expression="normal", flipped=false) {
  const s = scale;
  const flip = flipped ? `scale(-1,1) translate(-${x*2 + 80*s}, 0)` : "";
  return `
    <g transform="translate(${x}, ${y}) scale(${s}) ${flip}">
      <!-- Body -->
      <ellipse cx="40" cy="55" rx="28" ry="22" fill="${COLORS.boozieFur}"/>
      <!-- Tail -->
      <path d="M 68 55 Q 90 40 85 25 Q 80 15 70 20 Q 75 30 72 50 Z" fill="${COLORS.boozieFur}"/>
      <!-- Tail stripe -->
      <path d="M 72 45 Q 82 32 78 22" stroke="${COLORS.boozieStripe}" stroke-width="2" fill="none"/>
      <!-- Head -->
      <circle cx="40" cy="30" r="20" fill="${COLORS.boozieFur}"/>
      <!-- Ears -->
      <polygon points="24,16 18,2 32,12" fill="${COLORS.boozieFur}"/>
      <polygon points="56,16 62,2 48,12" fill="${COLORS.boozieFur}"/>
      <polygon points="25,14 20,5 30,11" fill="#FFB6C1"/>
      <polygon points="55,14 60,5 50,11" fill="#FFB6C1"/>
      <!-- Ear tufts (Maine Coon trait) -->
      <line x1="20" y1="4" x2="18" y2="0" stroke="${COLORS.boozieStripe}" stroke-width="1.5"/>
      <line x1="22" y1="3" x2="21" y2="-1" stroke="${COLORS.boozieStripe}" stroke-width="1.5"/>
      <line x1="60" y1="4" x2="62" y2="0" stroke="${COLORS.boozieStripe}" stroke-width="1.5"/>
      <line x1="58" y1="3" x2="59" y2="-1" stroke="${COLORS.boozieStripe}" stroke-width="1.5"/>
      <!-- Mane (fluffy Maine Coon ruff) -->
      <ellipse cx="40" cy="42" rx="22" ry="10" fill="${COLORS.boozieFur}" opacity="0.8"/>
      <!-- Stripes on body -->
      <path d="M 20 50 Q 25 45 20 40" stroke="${COLORS.boozieStripe}" stroke-width="1.5" fill="none"/>
      <path d="M 60 50 Q 55 45 60 40" stroke="${COLORS.boozieStripe}" stroke-width="1.5" fill="none"/>
      <!-- Eyes -->
      ${expression === "wide" ? `
        <ellipse cx="33" cy="28" rx="5" ry="6" fill="${COLORS.boozieEyes}"/>
        <ellipse cx="47" cy="28" rx="5" ry="6" fill="${COLORS.boozieEyes}"/>
        <ellipse cx="33" cy="28" rx="2" ry="4" fill="#000"/>
        <ellipse cx="47" cy="28" rx="2" ry="4" fill="#000"/>
      ` : expression === "squint" ? `
        <path d="M 28 28 Q 33 26 38 28" stroke="${COLORS.boozieEyes}" stroke-width="2" fill="none"/>
        <path d="M 42 28 Q 47 26 52 28" stroke="${COLORS.boozieEyes}" stroke-width="2" fill="none"/>
      ` : expression === "sleepy" ? `
        <path d="M 28 29 Q 33 27 38 29" stroke="${COLORS.boozieEyes}" stroke-width="2" fill="none"/>
        <path d="M 42 29 Q 47 27 52 29" stroke="${COLORS.boozieEyes}" stroke-width="2" fill="none"/>
      ` : expression === "shocked" ? `
        <circle cx="33" cy="28" r="6" fill="${COLORS.boozieEyes}"/>
        <circle cx="47" cy="28" r="6" fill="${COLORS.boozieEyes}"/>
        <circle cx="33" cy="28" r="3" fill="#000"/>
        <circle cx="47" cy="28" r="3" fill="#000"/>
      ` : `
        <ellipse cx="33" cy="28" rx="4" ry="5" fill="${COLORS.boozieEyes}"/>
        <ellipse cx="47" cy="28" rx="4" ry="5" fill="${COLORS.boozieEyes}"/>
        <ellipse cx="33" cy="28" rx="2" ry="3" fill="#000"/>
        <ellipse cx="47" cy="28" rx="2" ry="3" fill="#000"/>
      `}
      <!-- Nose -->
      <polygon points="40,33 37,36 43,36" fill="#FF9999"/>
      <!-- Whiskers -->
      <line x1="40" y1="35" x2="10" y2="30" stroke="#FFF" stroke-width="0.8"/>
      <line x1="40" y1="36" x2="10" y2="37" stroke="#FFF" stroke-width="0.8"/>
      <line x1="40" y1="35" x2="70" y2="30" stroke="#FFF" stroke-width="0.8"/>
      <line x1="40" y1="36" x2="70" y2="37" stroke="#FFF" stroke-width="0.8"/>
      <!-- Mouth -->
      ${expression === "shocked" || expression === "wide" ? `
        <path d="M 37 37 Q 40 41 43 37" stroke="#8B4513" stroke-width="1.5" fill="none"/>
      ` : `
        <path d="M 37 37 Q 40 39 43 37" stroke="#8B4513" stroke-width="1.5" fill="none"/>
      `}
      <!-- Paws -->
      <ellipse cx="25" cy="74" rx="8" ry="5" fill="${COLORS.boozieFur}"/>
      <ellipse cx="55" cy="74" rx="8" ry="5" fill="${COLORS.boozieFur}"/>
    </g>
  `;
}

// Draw Donna
function drawDonna(x, y, scale=1, expression="normal") {
  const s = scale;
  return `
    <g transform="translate(${x}, ${y}) scale(${s})">
      <!-- Body -->
      <rect x="18" y="45" width="34" height="40" rx="5" fill="#7B9FD4"/>
      <!-- Head -->
      <circle cx="35" cy="35" r="20" fill="${COLORS.donna}"/>
      <!-- Hair -->
      <ellipse cx="35" cy="20" rx="22" ry="12" fill="${COLORS.donnaHair}"/>
      <rect x="13" y="18" width="8" height="25" rx="4" fill="${COLORS.donnaHair}"/>
      <rect x="49" y="18" width="8" height="25" rx="4" fill="${COLORS.donnaHair}"/>
      <!-- Eyes -->
      ${expression === "sleepy" ? `
        <path d="M 27 35 Q 32 33 37 35" stroke="#5D4037" stroke-width="2" fill="none"/>
        <path d="M 38 35 Q 43 33 48 35" stroke="#5D4037" stroke-width="2" fill="none"/>
      ` : `
        <circle cx="30" cy="35" r="4" fill="#5D4037"/>
        <circle cx="40" cy="35" r="4" fill="#5D4037"/>
        <circle cx="31" cy="34" r="1.5" fill="#fff"/>
        <circle cx="41" cy="34" r="1.5" fill="#fff"/>
      `}
      <!-- Nose -->
      <ellipse cx="35" cy="40" rx="2" ry="1.5" fill="#D4967A"/>
      <!-- Mouth -->
      ${expression === "surprised" ? `
        <ellipse cx="35" cy="45" rx="4" ry="5" fill="#8B4513"/>
      ` : `
        <path d="M 30 44 Q 35 48 40 44" stroke="#8B4513" stroke-width="1.5" fill="none"/>
      `}
      <!-- Arms -->
      <rect x="0" y="48" width="18" height="10" rx="5" fill="${COLORS.donna}"/>
      <rect x="52" y="48" width="18" height="10" rx="5" fill="${COLORS.donna}"/>
      <!-- Legs -->
      <rect x="20" y="82" width="12" height="20" rx="4" fill="#5D4037"/>
      <rect x="38" y="82" width="12" height="20" rx="4" fill="#5D4037"/>
    </g>
  `;
}

// Draw a bunny
function drawBunny(x, y, scale=1) {
  return `
    <g transform="translate(${x}, ${y}) scale(${s})">
      <ellipse cx="20" cy="35" rx="14" ry="12" fill="${COLORS.bunnyFur}"/>
      <circle cx="20" cy="20" r="10" fill="${COLORS.bunnyFur}"/>
      <ellipse cx="15" cy="10" rx="3" ry="8" fill="${COLORS.bunnyFur}"/>
      <ellipse cx="25" cy="10" rx="3" ry="8" fill="${COLORS.bunnyFur}"/>
      <ellipse cx="15" cy="10" rx="1.5" ry="6" fill="#FFB6C1"/>
      <ellipse cx="25" cy="10" rx="1.5" ry="6" fill="#FFB6C1"/>
      <circle cx="17" cy="21" r="2" fill="#333"/>
      <circle cx="23" cy="21" r="2" fill="#333"/>
      <ellipse cx="20" cy="25" rx="2" ry="1.5" fill="#FFB6C1"/>
      <ellipse cx="8" cy="42" rx="5" ry="3" fill="${COLORS.bunnyFur}"/>
      <ellipse cx="32" cy="42" rx="5" ry="3" fill="${COLORS.bunnyFur}"/>
      <circle cx="30" cy="37" r="4" fill="${COLORS.bunnyFur}"/>
    </g>
  `.replace(/\$\{s\}/g, scale);
}

// Scene backgrounds
function sceneBackground(type, width=500, height=300) {
  switch(type) {
    case "window":
      return `
        <!-- Room interior -->
        <rect width="${width}" height="${height}" fill="#FFF8F0"/>
        <!-- Window -->
        <rect x="150" y="20" width="200" height="180" fill="${COLORS.sky}" rx="4"/>
        <rect x="150" y="20" width="200" height="180" fill="none" stroke="${COLORS.windowFrame}" stroke-width="10" rx="4"/>
        <line x1="250" y1="20" x2="250" y2="200" stroke="${COLORS.windowFrame}" stroke-width="6"/>
        <line x1="150" y1="110" x2="350" y2="110" stroke="${COLORS.windowFrame}" stroke-width="6"/>
        <!-- Street view through window -->
        <rect x="160" y="160" width="180" height="50" fill="${COLORS.sidewalk}"/>
        <!-- Windowsill -->
        <rect x="130" y="195" width="240" height="15" fill="#A0522D" rx="3"/>
        <!-- Floor -->
        <rect x="0" y="250" width="${width}" height="50" fill="#DEB887"/>
      `;
    case "outdoor":
      return `
        <rect width="${width}" height="${height}" fill="${COLORS.sky}"/>
        <rect x="0" y="200" width="${width}" height="100" fill="${COLORS.ground}"/>
        <rect x="0" y="220" width="${width}" height="30" fill="${COLORS.sidewalk}"/>
      `;
    case "bedroom":
      return `
        <rect width="${width}" height="${height}" fill="#F0E6D3"/>
        <!-- Bed -->
        <rect x="50" y="150" width="300" height="120" rx="10" fill="#A0C4FF"/>
        <rect x="50" y="150" width="300" height="40" rx="10" fill="#FFF"/>
        <rect x="50" y="150" width="80" height="80" rx="5" fill="#FFD6A5"/>
        <!-- Floor -->
        <rect x="0" y="250" width="${width}" height="50" fill="#DEB887"/>
      `;
    case "egypt":
      return `
        <rect width="${width}" height="${height}" fill="#87CEEB"/>
        <rect x="0" y="200" width="${width}" height="100" fill="${COLORS.egypt}"/>
        <!-- Pyramid silhouette -->
        <polygon points="50,200 200,50 350,200" fill="#D4A044"/>
        <!-- Sun -->
        <circle cx="420" cy="60" r="35" fill="#FFD700"/>
        <!-- Palm suggestion -->
        <rect x="420" y="160" width="8" height="50" fill="#8B6914"/>
        <ellipse cx="424" cy="158" rx="20" ry="10" fill="#228B22"/>
      `;
    case "airplane":
      return `
        <rect width="${width}" height="${height}" fill="#1a3a6e"/>
        <!-- Stars -->
        <circle cx="50" cy="30" r="2" fill="white"/>
        <circle cx="120" cy="80" r="1.5" fill="white"/>
        <circle cx="300" cy="20" r="2" fill="white"/>
        <circle cx="450" cy="60" r="1.5" fill="white"/>
        <circle cx="200" cy="100" r="1" fill="white"/>
        <!-- Clouds below -->
        <ellipse cx="100" cy="250" rx="80" ry="30" fill="white" opacity="0.6"/>
        <ellipse cx="350" cy="270" rx="100" ry="25" fill="white" opacity="0.5"/>
        <!-- Airplane window frame -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#8B8680" stroke-width="20" rx="40"/>
        <rect x="180" y="50" width="140" height="100" rx="40" fill="#4A7EC4" stroke="#8B8680" stroke-width="8"/>
      `;
    case "dc":
      return `
        <rect width="${width}" height="${height}" fill="${COLORS.sky}"/>
        <rect x="0" y="210" width="${width}" height="90" fill="#6B8E23"/>
        <!-- Washington Monument silhouette -->
        <rect x="220" y="80" width="20" height="140" fill="#E8E8E8"/>
        <polygon points="220,80 240,80 230,50" fill="#E8E8E8"/>
      `;
    case "seattle":
      return `
        <rect width="${width}" height="${height}" fill="#556B8F"/>
        <!-- Rain -->
        ${Array.from({length:30}, (_,i) => `<line x1="${i*18+5}" y1="${(i*37)%100}" x2="${i*18}" y2="${(i*37)%100+20}" stroke="${COLORS.rain}" stroke-width="1.5" opacity="0.7"/>`).join('')}
        <rect x="0" y="220" width="${width}" height="80" fill="#4A5568"/>
        <!-- Space needle suggestion -->
        <rect x="420" y="100" width="6" height="130" fill="#718096"/>
        <ellipse cx="423" cy="100" rx="20" ry="8" fill="#718096"/>
      `;
    case "cozy_room":
    default:
      return `
        <rect width="${width}" height="${height}" fill="#FFF8F0"/>
        <!-- Couch -->
        <rect x="100" y="160" width="300" height="100" rx="15" fill="${COLORS.couch}"/>
        <rect x="100" y="150" width="300" height="30" rx="10" fill="#A0522D"/>
        <rect x="90" y="155" width="40" height="80" rx="10" fill="#A0522D"/>
        <rect x="370" y="155" width="40" height="80" rx="10" fill="#A0522D"/>
        <!-- Floor -->
        <rect x="0" y="250" width="${width}" height="50" fill="#DEB887"/>
      `;
  }
}

// Determine background from scene type
function getSceneBackground(sceneName) {
  const sceneMap = {
    window_sitting: "window",
    bunny_spotted: "window",
    boozie_intense: "window",
    bunny_leaving: "window",
    sleeping_donna: "bedroom",
    boozie_staring: "bedroom",
    donna_awake: "bedroom",
    boozie_eating: "cozy_room",
    boozie_loafing: "cozy_room",
    loud_noise: "cozy_room",
    boozie_startled: "cozy_room",
    boozie_under_couch: "cozy_room",
    boozie_staring_dreamy: "cozy_room",
    egypt_memory: "egypt",
    donna_cairo: "egypt",
    boozie_content: "cozy_room",
    street_cat: "outdoor",
    eye_contact: "window",
    boozie_puffed: "window",
    boozie_normal: "window",
    carrier_appears: "cozy_room",
    airplane: "airplane",
    dc_window: "dc",
    dc_bunnies: "dc",
    seattle_rain: "seattle",
    boozie_window_rain: "window",
    boozie_cozy: "cozy_room",
    bag_on_floor: "cozy_room",
    boozie_circling: "cozy_room",
    boozie_sniffing: "cozy_room",
    boozie_sitting_bag: "cozy_room",
    boozie_napping: "cozy_room",
    boozie_on_laptop: "cozy_room",
    three_bunnies: "window",
    boozie_watching_bunnies: "window",
    boozie_face_glass: "window",
    empty_street: "window",
  };
  return sceneMap[sceneName] || "cozy_room";
}

// Get Boozie expression for scene
function getBoozieExpression(sceneName) {
  const expressionMap = {
    boozie_intense: "wide",
    bunny_spotted: "wide",
    boozie_startled: "shocked",
    loud_noise: "shocked",
    boozie_loafing: "sleepy",
    boozie_napping: "sleepy",
    sleeping_donna: "sleepy",
    boozie_staring: "squint",
    boozie_staring_dreamy: "squint",
    eye_contact: "squint",
    boozie_puffed: "wide",
    boozie_face_glass: "wide",
  };
  return expressionMap[sceneName] || "normal";
}

// Main scene SVG generator
function renderScene(sceneName, width=500, height=300) {
  const bgType = getSceneBackground(sceneName);
  const bg = sceneBackground(bgType, width, height);
  const expression = getBoozieExpression(sceneName);

  let foreground = "";
  switch(sceneName) {
    case "window_sitting":
    case "boozie_intense":
    case "bunny_spotted":
      foreground = drawBoozie(195, 115, 0.9, expression);
      if (sceneName === "bunny_spotted" || sceneName === "bunny_leaving") {
        foreground += drawBunny(185, 163, 0.4);
      }
      break;
    case "bunny_leaving":
      foreground = drawBoozie(195, 115, 0.9, "wide");
      foreground += drawBunny(300, 163, 0.4);
      break;
    case "three_bunnies":
    case "boozie_watching_bunnies":
    case "boozie_face_glass":
      foreground = drawBoozie(195, 115, 0.9, "wide");
      foreground += drawBunny(165, 163, 0.35);
      foreground += drawBunny(195, 163, 0.35);
      foreground += drawBunny(225, 163, 0.35);
      break;
    case "empty_street":
      foreground = drawBoozie(195, 115, 0.9, "squint");
      break;
    case "sleeping_donna":
      foreground = drawDonna(180, 120, 1.1, "sleepy");
      foreground += drawBoozie(300, 125, 0.7, "squint");
      break;
    case "donna_awake":
      foreground = drawDonna(150, 120, 1.0, "surprised");
      foreground += drawBoozie(310, 140, 0.8, "wide");
      break;
    case "boozie_staring":
      foreground = drawBoozie(210, 155, 0.85, "squint");
      break;
    case "boozie_eating":
    case "boozie_content":
    case "boozie_normal":
      foreground = drawBoozie(210, 155, 0.9, "normal");
      break;
    case "boozie_loafing":
    case "boozie_napping":
      foreground = drawBoozie(180, 155, 1.0, "sleepy");
      break;
    case "boozie_cozy":
      foreground = drawBoozie(200, 130, 0.9, "sleepy");
      break;
    case "loud_noise":
    case "boozie_startled":
      foreground = drawBoozie(200, 145, 1.0, "shocked");
      foreground += `<text x="310" y="130" font-size="40" font-family="Arial" font-weight="bold" fill="#CC0000">BANG!</text>`;
      break;
    case "boozie_under_couch":
      foreground = `<ellipse cx="250" cy="245" rx="35" ry="10" fill="${COLORS.boozieFur}"/>`;
      foreground += `<circle cx="250" cy="238" r="12" fill="${COLORS.boozieFur}"/>`;
      foreground += `<circle cx="244" cy="236" r="3" fill="${COLORS.boozieEyes}"/>`;
      foreground += `<circle cx="256" cy="236" r="3" fill="${COLORS.boozieEyes}"/>`;
      foreground += drawDonna(360, 150, 0.9, "normal");
      break;
    case "egypt_memory":
      foreground = drawBoozie(320, 165, 0.85, "wide");
      break;
    case "donna_cairo":
      foreground = drawBoozie(180, 165, 0.85, "normal");
      foreground += drawDonna(320, 150, 0.9, "normal");
      break;
    case "street_cat":
      foreground = drawBoozie(50, 165, 0.7, "normal", false);
      foreground += drawBoozie(190, 163, 0.45, "normal");
      break;
    case "eye_contact":
      foreground = drawBoozie(185, 110, 0.9, "squint");
      foreground += drawBoozie(180, 170, 0.4, "wide");
      break;
    case "boozie_puffed":
      foreground = drawBoozie(185, 100, 1.1, "wide");
      break;
    case "carrier_appears":
      // Draw carrier
      foreground = `
        <rect x="280" y="170" width="120" height="80" rx="8" fill="#6B8E23" stroke="#556B22" stroke-width="3"/>
        <rect x="285" y="175" width="110" height="70" rx="5" fill="none" stroke="#8B8B00" stroke-width="2"/>
        ${Array.from({length:6}, (_,i) => `<line x1="${290+i*18}" y1="175" x2="${290+i*18}" y2="245" stroke="#8B8B00" stroke-width="1.5"/>`).join('')}
      `;
      foreground += drawBoozie(130, 155, 0.9, "squint");
      break;
    case "airplane":
      foreground = drawBoozie(160, 80, 0.9, "shocked");
      break;
    case "dc_window":
    case "dc_bunnies":
      foreground = drawBoozie(130, 160, 0.9, expression);
      if (sceneName === "dc_bunnies") {
        foreground += drawBunny(340, 188, 0.5);
      }
      break;
    case "seattle_rain":
    case "boozie_window_rain":
      foreground = drawBoozie(200, 155, 0.9, "squint");
      break;
    case "bag_on_floor":
      foreground = `
        <rect x="230" y="200" width="80" height="50" rx="4" fill="white" stroke="#CCC" stroke-width="2"/>
        <path d="M 250 200 Q 270 180 290 200" stroke="#CCC" stroke-width="3" fill="none"/>
      `;
      foreground += drawBoozie(100, 160, 0.85, "squint");
      break;
    case "boozie_circling":
      foreground = `
        <rect x="230" y="200" width="80" height="50" rx="4" fill="white" stroke="#CCC" stroke-width="2"/>
        <path d="M 250 200 Q 270 180 290 200" stroke="#CCC" stroke-width="3" fill="none"/>
      `;
      foreground += drawBoozie(140, 155, 0.85, "wide");
      break;
    case "boozie_sniffing":
      foreground = `
        <rect x="230" y="200" width="80" height="50" rx="4" fill="white" stroke="#CCC" stroke-width="2"/>
        <path d="M 250 200 Q 270 180 290 200" stroke="#CCC" stroke-width="3" fill="none"/>
      `;
      foreground += drawBoozie(165, 155, 0.85, "normal");
      break;
    case "boozie_sitting_bag":
      foreground = `<rect x="210" y="228" width="80" height="22" rx="4" fill="white" stroke="#CCC" stroke-width="2" opacity="0.5"/>`;
      foreground += drawBoozie(185, 152, 0.9, "squint");
      break;
    case "boozie_on_laptop":
      foreground = `
        <rect x="150" y="215" width="180" height="10" rx="2" fill="#AAA"/>
        <rect x="160" y="175" width="160" height="40" rx="3" fill="#333"/>
        <rect x="163" y="178" width="154" height="34" rx="2" fill="#7EB8F7"/>
      `;
      foreground += drawBoozie(200, 125, 0.9, "squint");
      foreground += drawDonna(360, 135, 0.85, "sleepy");
      break;
    case "staring_dreamy":
    default:
      foreground = drawBoozie(200, 155, 0.9, "normal");
  }

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${bg}${foreground}</svg>`;
}
