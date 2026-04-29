const EVENT_ID = Number(document.body.dataset.eventId || 0);
const NACIONAL_ID = 6106;

const PLAYER_LOOKUP = new Map();
const PLAYER_DETAIL_CACHE = new Map();

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// --------- PLAYER IMAGES: ID FIRST, NEVER LOOSE NAME MATCH ---------
const PLAYER_IMAGES_BY_ID = {
  /*
    Optional manual overrides using YOUR DB/API player_id.

    Example:
    123456: {
      img: "https://images.fotmob.com/image_resources/playerimages/50065.png",
      initials: "DO",
      name: "David Ospina"
    }

    Leave this empty for now if you want. The code will use SofaScore's
    player image endpoint by player_id automatically.
  */
};

const PLAYER_IMAGES_BY_EXACT_NAME = {
  // Exact-name fallback only. No generic surname keys.
  // For match detail, exact-name fallback is only allowed for Nacional players.

  "David Ospina": {
    img: "https://images.fotmob.com/image_resources/playerimages/50065.png",
    initials: "DO"
  },
  "Harlen Castillo": {
    img: "https://images.fotmob.com/image_resources/playerimages/1435218.png",
    initials: "HC"
  },
  "Kevin Cataño": {
    img: "https://images.fotmob.com/image_resources/playerimages/1886618.png",
    initials: "KC"
  },
  "Kevin Catano": {
    img: "https://images.fotmob.com/image_resources/playerimages/1886618.png",
    initials: "KC"
  },
  "Kevin Castaño": {
    img: "https://images.fotmob.com/image_resources/playerimages/1886618.png",
    initials: "KC"
  },
  "Kevin Castano": {
    img: "https://images.fotmob.com/image_resources/playerimages/1886618.png",
    initials: "KC"
  },
  "Andrés Román": {
    img: "https://images.fotmob.com/image_resources/playerimages/925847.png",
    initials: "AR"
  },
  "Andres Roman": {
    img: "https://images.fotmob.com/image_resources/playerimages/925847.png",
    initials: "AR"
  },
  "Milton Casco": {
    img: "https://images.fotmob.com/image_resources/playerimages/174813.png",
    initials: "MC"
  },

  // Ambiguous names. Blank unless confirmed by ID.
  "Simón García": {
    img: "",
    initials: "SG"
  },
  "Simon Garcia": {
    img: "",
    initials: "SG"
  },
  "Robinson García": {
    img: "",
    initials: "RG"
  },
  "Robinson Garcia": {
    img: "",
    initials: "RG"
  },
  "Cristian Uribe": {
    img: "",
    initials: "CU"
  },
  "Matheus Uribe": {
    img: "https://images.fotmob.com/image_resources/playerimages/320618.png",
    initials: "MU"
  },

  "César Haydar": {
    img: "https://images.fotmob.com/image_resources/playerimages/1139171.png",
    initials: "CH"
  },
  "Cesar Haydar": {
    img: "https://images.fotmob.com/image_resources/playerimages/1139171.png",
    initials: "CH"
  },
  "William Tesillo": {
    img: "https://images.fotmob.com/image_resources/playerimages/207383.png",
    initials: "WT"
  },
  "Wiliam Tesillo": {
    img: "https://images.fotmob.com/image_resources/playerimages/207383.png",
    initials: "WT"
  },
  "Samuel Velásquez": {
    img: "https://images.fotmob.com/image_resources/playerimages/1433031.png",
    initials: "SV"
  },
  "Samuel Velasquez": {
    img: "https://images.fotmob.com/image_resources/playerimages/1433031.png",
    initials: "SV"
  },
  "Juan Manuel Rengifo": {
    img: "https://images.fotmob.com/image_resources/playerimages/1798773.png",
    initials: "JM"
  },
  "Jorman Campuzano": {
    img: "https://images.fotmob.com/image_resources/playerimages/922875.png",
    initials: "JC"
  },
  "Edwin Cardona": {
    img: "https://images.fotmob.com/image_resources/playerimages/177507.png",
    initials: "EC"
  },
  "Andrés Sarmiento": {
    img: "https://images.fotmob.com/image_resources/playerimages/942987.png",
    initials: "AS"
  },
  "Andres Sarmiento": {
    img: "https://images.fotmob.com/image_resources/playerimages/942987.png",
    initials: "AS"
  },
  "Nicolás Rodríguez": {
    img: "https://images.fotmob.com/image_resources/playerimages/1460577.png",
    initials: "NR"
  },
  "Nicolas Rodriguez": {
    img: "https://images.fotmob.com/image_resources/playerimages/1460577.png",
    initials: "NR"
  },
  "Juan Zapata": {
    img: "https://images.fotmob.com/image_resources/playerimages/1199834.png",
    initials: "JZ"
  },
  "Marlos Moreno": {
    img: "https://images.fotmob.com/image_resources/playerimages/677249.png",
    initials: "MM"
  },
  "Cristian Arango": {
    img: "https://images.fotmob.com/image_resources/playerimages/452368.png",
    initials: "CA"
  },
  "Eduard Bello": {
    img: "https://images.fotmob.com/image_resources/playerimages/495825.png",
    initials: "EB"
  },
  "Matías Lozano": {
    img: "https://images.fotmob.com/image_resources/playerimages/1895028.png",
    initials: "ML"
  },
  "Matias Lozano": {
    img: "https://images.fotmob.com/image_resources/playerimages/1895028.png",
    initials: "ML"
  },
  "Alfredo Morelos": {
    img: "https://images.fotmob.com/image_resources/playerimages/579660.png",
    initials: "AM"
  },
  "Dairon Asprilla": {
    img: "https://images.fotmob.com/image_resources/playerimages/425783.png",
    initials: "DA"
  }
};

const TEAM_BADGES = {
  "Atlético Nacional": "https://images.fotmob.com/image_resources/logo/teamlogo/6368.png",
  "Atletico Nacional": "https://images.fotmob.com/image_resources/logo/teamlogo/6368.png",
  "Deportivo Pasto": "https://images.fotmob.com/image_resources/logo/teamlogo/4405.png",
  "Junior Barranquilla": "https://images.fotmob.com/image_resources/logo/teamlogo/2254.png",
  "Deportes Tolima": "https://images.fotmob.com/image_resources/logo/teamlogo/1894.png",
  "América de Cali": "https://images.fotmob.com/image_resources/logo/teamlogo/10280.png",
  "America de Cali": "https://images.fotmob.com/image_resources/logo/teamlogo/10280.png",
  "Once Caldas": "https://images.fotmob.com/image_resources/logo/teamlogo/6024.png",
  "Internacional de Bogotá": "https://images.fotmob.com/image_resources/logo/teamlogo/47240.png",
  "Independiente Santa Fe": "https://images.fotmob.com/image_resources/logo/teamlogo/7818.png",
  "Deportivo Cali": "https://images.fotmob.com/image_resources/logo/teamlogo/6387.png",
  "Independiente Medellín": "https://images.fotmob.com/image_resources/logo/teamlogo/2528.png",
  "Independiente Medellin": "https://images.fotmob.com/image_resources/logo/teamlogo/2528.png",
  "Atlético Bucaramanga": "https://images.fotmob.com/image_resources/logo/teamlogo/4401.png",
  "Atletico Bucaramanga": "https://images.fotmob.com/image_resources/logo/teamlogo/4401.png",
  "Millonarios": "https://images.fotmob.com/image_resources/logo/teamlogo/4403.png",
  "Rionegro Águilas Doradas": "https://images.fotmob.com/image_resources/logo/teamlogo/193025.png",
  "Llaneros FC": "https://images.fotmob.com/image_resources/logo/teamlogo/348397.png",
  "Fortaleza FC": "https://images.fotmob.com/image_resources/logo/teamlogo/244167.png",
  "Cúcuta Deportivo": "https://images.fotmob.com/image_resources/logo/teamlogo/6254.png",
  "Alianza Valledupar FC": "https://images.fotmob.com/image_resources/logo/teamlogo/193029.png",
  "Jaguares de Córdoba": "https://images.fotmob.com/image_resources/logo/teamlogo/424270.png",
  "Boyacá Chicó FC": "https://images.fotmob.com/image_resources/logo/teamlogo/6255.png",
  "Deportivo Pereira": "https://images.fotmob.com/image_resources/logo/teamlogo/4404.png"
};

const LEAGUE_BADGES = {
  "liga betplay": "https://images.fotmob.com/image_resources/logo/leaguelogo/274.png",
  "primera a": "https://images.fotmob.com/image_resources/logo/leaguelogo/274.png",
  "copa colombia": "https://images.fotmob.com/image_resources/logo/leaguelogo/144.png",
  "libertadores": "https://images.fotmob.com/image_resources/logo/leaguelogo/242.png",
  "sudamericana": "https://images.fotmob.com/image_resources/logo/leaguelogo/9472.png"
};

function translateStatLabel(label){
  const map = {
    "Posición": "Posición",
    "Minutes played": "Minutos jugados",
    "Goals": "Goles",
    "Expected goals (xG)": "Goles esperados (xG)",
    "Assists": "Asistencias",
    "Expected assists (xA)": "Asistencias esperadas (xA)",
    "Key passes": "Pases clave",
    "Crosses": "Centros",
    "Accurate crosses": "Centros precisos",
    "Accurate passes": "Pases precisos",
    "Total passes": "Pases totales",
    "Long balls": "Balones largos",
    "Accurate long balls": "Balones largos precisos",
    "Total shots": "Remates totales",
    "Shots on target": "Remates al arco",
    "Touches": "Toques",
    "Possession lost": "Posesión perdida",
    "Recoveries": "Recuperaciones",
    "Tackles": "Entradas",
    "Interceptions": "Intercepciones",
    "Clearances": "Despejes",
    "Fouls": "Faltas",
    "Dribbled past": "Regateado"
  };

  return map[label] || label;
}

function escapeHTML(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeName(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function safeText(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value ?? "";
}

function initials(name){
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);

  if(!parts.length) return "AN";
  if(parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function lastName(name){
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "Jugador";
}

function teamInitials(name){
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase();
}

function getPlayerId(player){
  return player?.player_id || player?.id || null;
}

function isNacionalPlayer(player){
  const teamId = Number(player?.team_id || player?.teamId || 0);
  const teamName = normalizeName(player?.team_name || player?.teamName || "");

  return teamId === NACIONAL_ID || teamName.includes("atletico nacional");
}

function findExactNameImage(playerName){
  const normalizedName = normalizeName(playerName);

  for(const [name, data] of Object.entries(PLAYER_IMAGES_BY_EXACT_NAME)){
    if(normalizeName(name) === normalizedName){
      return data;
    }
  }

  return null;
}

function playerImageData(player, options = {}){
  const allowNameFallback = options.allowNameFallback ?? true;
  const playerId = getPlayerId(player);
  const playerName = player?.player_name || player?.name || "";

  // 1. Best: manual override by DB/API player_id.
  if(playerId && PLAYER_IMAGES_BY_ID[playerId]){
    return PLAYER_IMAGES_BY_ID[playerId];
  }

  // 2. For Nacional players/pages, use exact full-name fallback BEFORE SofaScore.
  // This restores your known FotMob headshots and avoids blank SofaScore circles.
  if(allowNameFallback){
    const exact = findExactNameImage(playerName);

    if(exact && exact.img){
      return exact;
    }

    if(exact){
      return {
        img: "",
        initials: exact.initials || initials(playerName),
        name: playerName
      };
    }
  }

  // 3. Safe backup: SofaScore image by exact player_id.
  // Good for rival players because it does NOT use names.
  if(playerId){
    return {
      img: `https://api.sofascore.app/api/v1/player/${playerId}/image`,
      initials: initials(playerName),
      name: playerName
    };
  }

  // 4. Final fallback.
  return {
    img: "",
    initials: initials(playerName),
    name: playerName
  };
}

function getPlayerHeadshot(player, options = {}){
  const imageData = playerImageData(player, options);
  return player?.image_url || imageData?.img || "";
}

function getPlayerInitials(player, options = {}){
  const name = player?.name || player?.player_name || "";
  const imageData = playerImageData(player, options);
  return imageData?.initials || initials(name);
}

function getTeamBadge(teamName){
  if(TEAM_BADGES[teamName]){
    return TEAM_BADGES[teamName];
  }

  const normalized = normalizeName(teamName);

  for(const [name, url] of Object.entries(TEAM_BADGES)){
    if(normalizeName(name) === normalized){
      return url;
    }
  }

  return "";
}

function getLeagueBadge(tournamentName){
  const normalized = normalizeName(tournamentName);

  for(const [key, url] of Object.entries(LEAGUE_BADGES)){
    if(normalized.includes(key)){
      return url;
    }
  }

  return LEAGUE_BADGES["liga betplay"];
}

function renderTeamBadge(id, teamName){
  const el = document.getElementById(id);
  if(!el) return;

  const url = getTeamBadge(teamName);

  if(url){
    el.innerHTML = `
      <img
        src="${url}"
        alt="${escapeHTML(teamName)}"
        onerror="this.remove(); this.parentNode.textContent='${teamInitials(teamName)}'"
      >
    `;
  } else {
    el.textContent = teamInitials(teamName);
  }
}

function renderLeagueBadge(id, tournamentName){
  const el = document.getElementById(id);
  if(!el) return;

  const url = getLeagueBadge(tournamentName);

  if(url){
    el.innerHTML = `<img src="${url}" alt="${escapeHTML(tournamentName || "Liga")}">`;
  } else {
    el.textContent = "LB";
  }
}

function readNumber(...values){
  for(const value of values){
    if(value === undefined || value === null || value === "") continue;

    const num = Number(value);

    if(Number.isFinite(num)){
      return num;
    }
  }

  return 0;
}

function firstNonEmpty(...values){
  for(const value of values){
    if(value !== undefined && value !== null && value !== ""){
      return value;
    }
  }

  return "";
}

function normalizeBoolean(value){
  if(value === true) return true;
  if(value === false) return false;
  if(value === 1 || value === "1") return true;

  const text = String(value || "").toLowerCase().trim();
  return ["true", "yes", "y"].includes(text);
}

function formatRating(value){
  if(value === undefined || value === null || value === "") return "";

  const num = Number(value);

  if(!Number.isFinite(num)) return "";

  return num.toFixed(1);
}

function ratingClass(value){
  const num = Number(value);

  if(!Number.isFinite(num)) return "rating-none";
  if(num >= 8) return "rating-elite";
  if(num >= 7) return "rating-good";
  if(num >= 6) return "rating-ok";
  if(num >= 5) return "rating-low";

  return "rating-bad";
}

function formatStatValue(value){
  if(value === undefined || value === null || value === "" || value === "-"){
    return null;
  }

  const raw = String(value).trim();

  if(raw.includes("/") || raw.includes("%")){
    return raw;
  }

  const num = Number(raw.replace(",", "."));

  if(Number.isFinite(num)){
    return num.toFixed(2).replace(/\.00$/, "");
  }

  return raw;
}

function modalStatRow(label, value){
  const formatted = formatStatValue(value);

  if(formatted === null){
    return "";
  }

  return `
    <div class="modal-stat-row">
      <div class="modal-stat-name">${escapeHTML(translateStatLabel(label))}</div>
      <div class="modal-stat-value">${escapeHTML(formatted)}</div>
    </div>
  `;
}

function statsArrayToObject(statsArray){
  const obj = {};

  if(!Array.isArray(statsArray)){
    return obj;
  }

  statsArray.forEach(stat => {
    if(stat && stat.stat_name){
      obj[stat.stat_name] = stat.stat_value;
    }
  });

  return obj;
}

function splitMinuteValue(value){
  if(value === undefined || value === null || value === "") return [];

  if(Array.isArray(value)){
    return value.map(v => String(v).trim()).filter(Boolean);
  }

  return String(value)
    .split(/[,;|]/)
    .map(v => v.trim())
    .filter(Boolean);
}

function formatMinute(value){
  if(value === undefined || value === null || value === "") return "—";

  const raw = String(value).trim();

  if(!raw) return "—";

  return raw.endsWith("'") ? raw : `${raw}'`;
}

function minuteSortValue(value){
  if(value === undefined || value === null || value === "") return 9999;

  const raw = String(value).replace("'", "").trim();

  if(raw.includes("+")){
    const [base, extra] = raw.split("+").map(part => Number(part));
    return (Number.isFinite(base) ? base : 0) + (Number.isFinite(extra) ? extra : 0);
  }

  const num = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : 9999;
}

function getMinutes(player, type){
  const minuteSources = {
    goal: [
      player.goal_minute,
      player.goal_minutes,
      player.goals_minute,
      player.goals_minutes,
      player.goalMinute,
      player.goalMinutes
    ],
    assist: [
      player.assist_minute,
      player.assist_minutes,
      player.assists_minute,
      player.assists_minutes,
      player.assistMinute,
      player.assistMinutes
    ],
    yellow: [
      player.yellow_card_minute,
      player.yellow_card_minutes,
      player.yellow_cards_minute,
      player.yellow_cards_minutes,
      player.yellowCardMinute,
      player.yellowCardMinutes
    ],
    red: [
      player.red_card_minute,
      player.red_card_minutes,
      player.red_cards_minute,
      player.red_cards_minutes,
      player.redCardMinute,
      player.redCardMinutes
    ],
    subIn: [
      player.subbed_in_minute,
      player.subbed_in_minutes,
      player.sub_in_minute,
      player.subInMinute,
      player.in_minute
    ],
    subOut: [
      player.subbed_out_minute,
      player.subbed_out_minutes,
      player.sub_out_minute,
      player.subOutMinute,
      player.out_minute
    ]
  };

  const sources = minuteSources[type] || [];

  for(const source of sources){
    const list = splitMinuteValue(source);

    if(list.length){
      return list;
    }
  }

  return [];
}

function getPlayerEventCounts(player){
  const stats = player.statistics || {};

  return {
    goals: readNumber(player.goals, stats.goals, stats.goal),
    assists: readNumber(player.assists, stats.goalAssist, stats.assists),
    yellow: readNumber(player.yellow_cards, player.yellowCards, stats.yellowCard, stats.yellowCards, stats.yellow_cards),
    red: readNumber(player.red_cards, player.redCards, stats.redCard, stats.redCards, stats.red_cards),
    subIn: normalizeBoolean(player.subbed_in || player.subbedIn),
    subOut: normalizeBoolean(player.subbed_out || player.subbedOut)
  };
}

function buildPlayerEvents(player){
  const events = [];
  const name = player.name || player.player_name || "Jugador";
  const teamName = player.team_name || "";
  const teamSide = player.team_side || "";
  const counts = getPlayerEventCounts(player);

  const goalMinutes = getMinutes(player, "goal");
  const assistMinutes = getMinutes(player, "assist");
  const yellowMinutes = getMinutes(player, "yellow");
  const redMinutes = getMinutes(player, "red");
  const subInMinutes = getMinutes(player, "subIn");
  const subOutMinutes = getMinutes(player, "subOut");

  for(let i = 0; i < counts.goals; i++){
    events.push({
      type: "goal",
      player_name: name,
      team_name: teamName,
      team_side: teamSide,
      minute: goalMinutes[i] || goalMinutes[0] || "",
      meta: "Gol"
    });
  }

  for(let i = 0; i < counts.assists; i++){
    events.push({
      type: "assist",
      player_name: name,
      team_name: teamName,
      team_side: teamSide,
      minute: assistMinutes[i] || assistMinutes[0] || "",
      meta: "Asistencia"
    });
  }

  for(let i = 0; i < counts.yellow; i++){
    events.push({
      type: "yellow",
      player_name: name,
      team_name: teamName,
      team_side: teamSide,
      minute: yellowMinutes[i] || yellowMinutes[0] || "",
      meta: "Tarjeta amarilla"
    });
  }

  for(let i = 0; i < counts.red; i++){
    events.push({
      type: "red",
      player_name: name,
      team_name: teamName,
      team_side: teamSide,
      minute: redMinutes[i] || redMinutes[0] || "",
      meta: "Tarjeta roja"
    });
  }

  if(counts.subIn){
    events.push({
      type: "sub-in",
      player_name: name,
      team_name: teamName,
      team_side: teamSide,
      minute: subInMinutes[0] || "",
      meta: "Entró"
    });
  }

  if(counts.subOut){
    events.push({
      type: "sub-out",
      player_name: name,
      team_name: teamName,
      team_side: teamSide,
      minute: subOutMinutes[0] || "",
      meta: "Salió"
    });
  }

  return events;
}

function normalizeRawEvent(raw){
  const typeRaw = firstNonEmpty(
    raw.type,
    raw.event_type,
    raw.eventType,
    raw.incidentType,
    raw.kind,
    raw.incident_type
  );

  const typeText = normalizeName(typeRaw);
  let type = "other";

  if(typeText.includes("goal") || typeText.includes("gol")) type = "goal";
  else if(typeText.includes("assist")) type = "assist";
  else if(typeText.includes("yellow") || typeText.includes("amarilla")) type = "yellow";
  else if(typeText.includes("red") || typeText.includes("roja")) type = "red";
  else if(typeText.includes("sub")){
    const subType = normalizeName(firstNonEmpty(raw.subType, raw.sub_type, raw.direction));
    type = subType.includes("out") || subType.includes("sale") ? "sub-out" : "sub-in";
  }

  return {
    type,
    player_name: firstNonEmpty(
      raw.player_name,
      raw.playerName,
      raw.player?.name,
      raw.name,
      raw.playerIn?.name,
      raw.playerOut?.name
    ),
    assist_name: firstNonEmpty(
      raw.assist_name,
      raw.assistName,
      raw.assist?.name
    ),
    team_name: firstNonEmpty(
      raw.team_name,
      raw.teamName,
      raw.team?.name
    ),
    team_side: firstNonEmpty(
      raw.team_side,
      raw.teamSide
    ),
    minute: firstNonEmpty(
      raw.minute,
      raw.time,
      raw.minute_display,
      raw.minuteDisplay
    ),
    meta: firstNonEmpty(
      raw.meta,
      raw.text,
      raw.description,
      raw.label
    )
  };
}

function getAllLineupPlayers(lineups){
  return [
    ...(lineups.home_xi || lineups.home || []),
    ...(lineups.away_xi || lineups.away || []),
    ...(lineups.home_subs || lineups.home_substitutes || lineups.home_bench || []),
    ...(lineups.away_subs || lineups.away_substitutes || lineups.away_bench || [])
  ];
}

function extractMatchEvents(match, lineups){
  const rawLists = [
    match.match_events,
    match.events,
    match.incidents,
    match.timeline
  ];

  const raw = rawLists.find(value => Array.isArray(value) && value.length);

  if(raw){
    return raw.map(normalizeRawEvent).filter(event => event.type !== "other");
  }

  const players = getAllLineupPlayers(lineups);
  return players.flatMap(player => buildPlayerEvents(player));
}

function eventIcon(type){
  if(type === "goal") return { cls: "goal", text: "⚽" };
  if(type === "assist") return { cls: "assist", text: "A" };
  if(type === "yellow") return { cls: "yellow", text: "" };
  if(type === "red") return { cls: "red", text: "" };
  if(type === "sub-in") return { cls: "sub-in", text: "→" };
  if(type === "sub-out") return { cls: "sub-out", text: "←" };

  return { cls: "assist", text: "•" };
}

function eventLabel(type){
  if(type === "goal") return "Gol";
  if(type === "assist") return "Asistencia";
  if(type === "yellow") return "Tarjeta amarilla";
  if(type === "red") return "Tarjeta roja";
  if(type === "sub-in") return "Entró";
  if(type === "sub-out") return "Salió";

  return "Evento";
}

function sortEvents(events){
  return [...events].sort((a, b) => {
    const diff = minuteSortValue(a.minute) - minuteSortValue(b.minute);

    if(diff !== 0) return diff;

    const order = {
      goal: 1,
      red: 2,
      yellow: 3,
      assist: 4,
      "sub-out": 5,
      "sub-in": 6
    };

    return (order[a.type] || 99) - (order[b.type] || 99);
  });
}

function buildPlayerMarkerHTML(player){
  const counts = getPlayerEventCounts(player);
  const subInMinute = getMinutes(player, "subIn")[0] || "";
  const subOutMinute = getMinutes(player, "subOut")[0] || "";

  let html = "";

  if(counts.goals || counts.assists || counts.yellow || counts.red || counts.subIn || counts.subOut){
    html += `<div class="player-events-stack">`;

    for(let i = 0; i < counts.goals; i++){
      html += `<div class="evt-badge goal" title="Gol">⚽</div>`;
    }

    for(let i = 0; i < counts.assists; i++){
      html += `<div class="evt-badge assist" title="Asistencia">A</div>`;
    }

    for(let i = 0; i < counts.yellow; i++){
      html += `<div class="evt-badge yellow" title="Tarjeta amarilla"></div>`;
    }

    for(let i = 0; i < counts.red; i++){
      html += `<div class="evt-badge red" title="Tarjeta roja"></div>`;
    }

    if(counts.subOut){
      html += `
        <div class="evt-sub out" title="Salió">
          <span class="evt-minute">${escapeHTML(subOutMinute || "—")}</span>
          <span class="evt-arrow">←</span>
        </div>
      `;
    }

    if(counts.subIn){
      html += `
        <div class="evt-sub in" title="Entró">
          <span class="evt-minute">${escapeHTML(subInMinute || "—")}</span>
          <span class="evt-arrow">→</span>
        </div>
      `;
    }

    html += `</div>`;
  }

  return html;
}

function createPlayerNode(player){
  const node = document.createElement("button");
  node.type = "button";
  node.className = "player-node";

  const name = player.name || player.player_name || "Jugador";
  const allowNameFallback = isNacionalPlayer(player);
  const photo = getPlayerHeadshot(player, { allowNameFallback });
  const fallbackInitials = getPlayerInitials(player, { allowNameFallback });
  const rating = formatRating(player.rating);
  const shirtNumber = player.shirt_number || player.jerseyNumber;
  const playerId = player.player_id || player.id;

  node.innerHTML = `
    <div class="player-avatar">
      ${buildPlayerMarkerHTML(player)}
      ${rating ? `<div class="rating-pill ${ratingClass(rating)}">${rating}</div>` : ""}
      ${
        photo
          ? `<img src="${photo}" alt="${escapeHTML(name)}" onerror="this.remove(); this.parentNode.insertAdjacentHTML('beforeend','<div class=&quot;player-initials&quot;>${fallbackInitials}</div>')">`
          : `<div class="player-initials">${fallbackInitials}</div>`
      }
    </div>

    <div class="player-label">
      ${shirtNumber ? `<span class="player-shirt">#${escapeHTML(shirtNumber)}</span>` : ""}
      <span class="player-lastname">${escapeHTML(lastName(name))}</span>
    </div>

    <div class="player-position">${escapeHTML(player.position || "")}</div>
  `;

  if(playerId){
    node.addEventListener("click", () => openPlayerModalFromApi(playerId));
  } else {
    node.addEventListener("click", () => openPlayerModal(player, player.team_name || "Atlético Nacional"));
  }

  return node;
}

function groupFormation(players){
  const grouped = {
    POR: [],
    DEF: [],
    MED: [],
    DEL: []
  };

  (players || []).forEach(player => {
    const pos = String(player.position || "").toUpperCase();

    if(["POR", "GK", "G"].includes(pos)){
      grouped.POR.push(player);
    } else if(["DEF", "DF", "D"].includes(pos)){
      grouped.DEF.push(player);
    } else if(["DEL", "FW", "ST", "F"].includes(pos)){
      grouped.DEL.push(player);
    } else {
      grouped.MED.push(player);
    }
  });

  return grouped;
}

function formationString(players){
  const groups = groupFormation(players);
  const parts = [
    groups.DEF.length,
    groups.MED.length,
    groups.DEL.length
  ].filter(Boolean);

  return parts.length ? parts.join("-") : "N/A";
}

function renderNacionalPitch(players){
  const pitch = document.getElementById("nacional-pitch");
  if(!pitch) return;

  pitch.querySelectorAll(".formation-row").forEach(el => el.remove());

  const starters = (players || []).filter(player => !normalizeBoolean(player.is_substitute)).slice(0, 11);

  if(!starters.length){
    const row = document.createElement("div");
    row.className = "formation-row row-mid";
    row.innerHTML = `<div class="empty">Sin alineación disponible.</div>`;
    pitch.appendChild(row);
    return;
  }

  const groups = groupFormation(starters);

  const rows = [
    { key: "POR", className: "row-gk" },
    { key: "DEF", className: "row-def" },
    { key: "MED", className: "row-mid" },
    { key: "DEL", className: "row-att" }
  ];

  rows.forEach(rowInfo => {
    const row = document.createElement("div");
    row.className = `formation-row ${rowInfo.className}`;

    (groups[rowInfo.key] || []).forEach(player => {
      row.appendChild(createPlayerNode(player));
    });

    pitch.appendChild(row);
  });

  safeText("lineup-formation-pill", formationString(starters));
}

function getLineupSide(info, lineups){
  const homeName = normalizeName(info.home_team);
  const awayName = normalizeName(info.away_team);

  if(homeName.includes("atletico nacional")) return "home";
  if(awayName.includes("atletico nacional")) return "away";

  const homePlayers = [
    ...(lineups.home_xi || lineups.home || []),
    ...(lineups.home_subs || lineups.home_substitutes || lineups.home_bench || [])
  ];

  const awayPlayers = [
    ...(lineups.away_xi || lineups.away || []),
    ...(lineups.away_subs || lineups.away_substitutes || lineups.away_bench || [])
  ];

  if(homePlayers.some(player => Number(player.team_id) === NACIONAL_ID)) return "home";
  if(awayPlayers.some(player => Number(player.team_id) === NACIONAL_ID)) return "away";

  return null;
}

function getNacionalPlayers(info, lineups){
  const side = getLineupSide(info, lineups);

  const source = side === "home"
    ? (lineups.home_xi || lineups.home || [])
    : side === "away"
      ? (lineups.away_xi || lineups.away || [])
      : [];

  return Array.isArray(source)
    ? source.filter(player => !player.team_id || Number(player.team_id) === NACIONAL_ID)
    : [];
}

function getNacionalSubs(info, lineups){
  const side = getLineupSide(info, lineups);

  const source = side === "home"
    ? (lineups.home_subs || lineups.home_substitutes || lineups.home_bench || lineups.homeBench || [])
    : side === "away"
      ? (lineups.away_subs || lineups.away_substitutes || lineups.away_bench || lineups.awayBench || [])
      : [];

  return Array.isArray(source)
    ? source.filter(player => !player.team_id || Number(player.team_id) === NACIONAL_ID)
    : [];
}

function rememberPlayers(players){
  (players || []).forEach(player => {
    const playerId = player.player_id || player.id;

    if(playerId !== undefined && playerId !== null){
      PLAYER_LOOKUP.set(String(playerId), player);
    }
  });
}

function renderSubs(players){
  const container = document.getElementById("subs-list");
  const countEl = document.getElementById("subs-count");

  if(!container) return;

  const subs = Array.isArray(players) ? players : [];

  if(countEl){
    countEl.textContent = String(subs.length);
  }

  if(!subs.length){
    container.innerHTML = `<div class="side-empty">Sin suplentes disponibles.</div>`;
    return;
  }

  container.innerHTML = subs.map(player => {
    const name = player.name || player.player_name || "Jugador";
    const allowNameFallback = isNacionalPlayer(player);
    const photo = getPlayerHeadshot(player, { allowNameFallback });
    const fallbackInitials = getPlayerInitials(player, { allowNameFallback });
    const rating = formatRating(player.rating);
    const shirtNumber = player.shirt_number || player.jerseyNumber || "";
    const position = player.position || "SUB";
    const playerId = player.player_id || player.id;

    const counts = getPlayerEventCounts(player);
    const subInMinute = getMinutes(player, "subIn")[0] || "";
    const subOutMinute = getMinutes(player, "subOut")[0] || "";

    const eventIcons = [];

    if(counts.subIn){
      eventIcons.push(`
        <span class="evt-sub in" title="Entró">
          <span class="evt-minute">${escapeHTML(subInMinute || "—")}</span>
          <span class="evt-arrow">→</span>
        </span>
      `);
    }

    if(counts.subOut){
      eventIcons.push(`
        <span class="evt-sub out" title="Salió">
          <span class="evt-minute">${escapeHTML(subOutMinute || "—")}</span>
          <span class="evt-arrow">←</span>
        </span>
      `);
    }

    if(counts.goals > 0){
      eventIcons.push(`<span class="evt-badge goal" title="Gol">⚽</span>`);
    }

    if(counts.assists > 0){
      eventIcons.push(`<span class="evt-badge assist" title="Asistencia">A</span>`);
    }

    if(counts.yellow > 0){
      eventIcons.push(`<span class="evt-badge yellow" title="Tarjeta amarilla"></span>`);
    }

    if(counts.red > 0){
      eventIcons.push(`<span class="evt-badge red" title="Tarjeta roja"></span>`);
    }

    return `
      <button type="button" class="sub-row" data-player-id="${escapeHTML(playerId || "")}">
        <div class="sub-avatar">
          ${
            photo
              ? `<img src="${photo}" alt="${escapeHTML(name)}" onerror="this.remove(); this.parentNode.textContent='${fallbackInitials}'">`
              : fallbackInitials
          }
        </div>

        <div class="sub-info">
          <div class="sub-name-line">
            ${shirtNumber ? `<span class="sub-number">${escapeHTML(String(shirtNumber))}</span>` : ""}
            <span class="sub-name">${escapeHTML(lastName(name))}</span>
          </div>

          <div class="sub-meta">
            <span>${escapeHTML(position)}</span>
            ${eventIcons.join("")}
          </div>
        </div>

        ${rating ? `<div class="sub-rating ${ratingClass(rating)}">${rating}</div>` : ""}
      </button>
    `;
  }).join("");

  container.querySelectorAll(".sub-row").forEach(button => {
    const playerId = button.dataset.playerId;

    if(playerId){
      button.addEventListener("click", () => openPlayerModalFromApi(playerId));
    }
  });
}

function renderMatchEvents(events){
  const container = document.getElementById("match-events-list");
  if(!container) return;

  const sorted = sortEvents(events || []);

  if(!sorted.length){
    container.innerHTML = `<div class="side-empty">Sin eventos disponibles.</div>`;
    return;
  }

  container.innerHTML = sorted.map(event => {
    const icon = eventIcon(event.type);
    const subtitleParts = [
      event.meta || eventLabel(event.type),
      event.team_name
    ].filter(Boolean);

    return `
      <div class="event-row">
        <div class="event-minute-pill">${escapeHTML(formatMinute(event.minute))}</div>
        <div class="event-type-icon ${icon.cls}">${icon.text}</div>

        <div class="event-copy">
          <div class="event-title">${escapeHTML(event.player_name || "Evento")}</div>
          <div class="event-subtitle">${escapeHTML(subtitleParts.join(" · "))}</div>
        </div>
      </div>
    `;
  }).join("");
}

function renderHeroSummary(info, events){
  const homeContainer = document.getElementById("hero-home-summary");
  const awayContainer = document.getElementById("hero-away-summary");

  if(!homeContainer || !awayContainer) return;

  const usefulEvents = (events || []).filter(event => ["goal", "red"].includes(event.type));

  const homeEvents = usefulEvents.filter(event => {
    if(event.team_side) return event.team_side === "home";
    return normalizeName(event.team_name) === normalizeName(info.home_team);
  });

  const awayEvents = usefulEvents.filter(event => {
    if(event.team_side) return event.team_side === "away";
    return normalizeName(event.team_name) === normalizeName(info.away_team);
  });

  function build(items){
    if(!items.length){
      return `<div class="hero-event-chip empty">Sin goles/rojas</div>`;
    }

    return items.map(event => {
      const isRed = event.type === "red";
      const icon = isRed ? "" : "⚽";
      const iconClass = isRed ? "red" : "goal";

      return `
        <div class="hero-event-chip">
          <span class="hero-event-icon ${iconClass}">${icon}</span>
          <span>${escapeHTML(lastName(event.player_name || ""))}</span>
          <span class="hero-event-minute">${escapeHTML(formatMinute(event.minute))}</span>
        </div>
      `;
    }).join("");
  }

  homeContainer.innerHTML = build(homeEvents);
  awayContainer.innerHTML = build(awayEvents);
}

function normalizeStatName(name){
  const map = {
    "Posesión de balón": "Ball possession",
    "Goles esperados (xG)": "Expected goals (xG)",
    "Remates totales": "Total shots",
    "Atajadas del portero": "Goalkeeper saves",
    "Tiros de esquina": "Corners",
    "Faltas": "Fouls committed",
    "Pases": "Passes",
    "Tiros libres": "Free kicks",
    "Tarjetas amarillas": "Yellow cards",
    "Tarjetas rojas": "Red cards",
    "Remates a puerta": "Shots on target",
    "Remates bloqueados": "Blocked shots",
    "Fueras de juego": "Offsides",
    "Saques de banda": "Throw-ins",
    "Paradas": "Saves"
  };

  return map[name] || name || "-";
}

function getPossessionNumber(value){
  const cleaned = String(value ?? "")
    .replace("%", "")
    .replace(",", ".")
    .trim();

  const number = Number(cleaned);

  if(!Number.isFinite(number)){
    return 0;
  }

  return Math.max(0, Math.min(100, number));
}

function renderPossessionCard(home, away){
  const homeNum = getPossessionNumber(home);
  const awayNum = getPossessionNumber(away);

  return `
    <div class="possession-card">
      <div class="possession-title">Ball possession</div>

      <div class="possession-bar-wrap">
        <div class="possession-left-fill" style="width:${homeNum}%;"></div>
        <div class="possession-right-fill" style="width:${awayNum}%;"></div>

        <div class="possession-values">
          <span>${escapeHTML(home ?? "-")}</span>
          <span>${escapeHTML(away ?? "-")}</span>
        </div>
      </div>
    </div>
  `;
}

function renderModernStatRow(stat){
  return `
    <div class="stat-modern-row">
      <div class="stat-modern-side">
        <div class="stat-pill home">${escapeHTML(stat.home ?? "-")}</div>
      </div>

      <div class="stat-modern-name">${escapeHTML(normalizeStatName(stat.name))}</div>

      <div class="stat-modern-side right">
        <div class="stat-pill away">${escapeHTML(stat.away ?? "-")}</div>
      </div>
    </div>
  `;
}

function renderStats(stats){
  const container = document.getElementById("md-stats");
  if(!container) return;

  if(!stats || !stats.length){
    container.innerHTML = `<div class="empty">Sin estadísticas disponibles.</div>`;
    return;
  }

  const possessionStat = stats.find(stat => {
    const name = normalizeName(stat.name);
    return name.includes("posesion") || name.includes("possession");
  });

  let html = "";

  if(possessionStat){
    html += renderPossessionCard(possessionStat.home, possessionStat.away);
  }

  stats
    .filter(stat => stat !== possessionStat)
    .forEach(stat => {
      html += renderModernStatRow(stat);
    });

  container.innerHTML = html;
}

function renderTable(rows){
  const container = document.getElementById("md-table");
  if(!container) return;

  if(!rows || !rows.length){
    container.innerHTML = `<div class="empty">Sin tabla disponible.</div>`;
    return;
  }

  container.innerHTML = rows.map(row => {
    const teamName = row.team_name || row.team || "-";
    const isNacional = normalizeName(teamName).includes("atletico nacional");
    const badge = getTeamBadge(teamName);

    return `
      <div class="table-row ${isNacional ? "highlight" : ""}">
        <div class="table-cell-strong">${escapeHTML(row.position ?? "-")}</div>

        <div class="table-team-cell">
          <div class="table-team-badge">
            ${
              badge
                ? `<img src="${badge}" alt="${escapeHTML(teamName)}" onerror="this.remove(); this.parentNode.textContent='${teamInitials(teamName)}'">`
                : teamInitials(teamName)
            }
          </div>
          <div class="table-team-name">${escapeHTML(teamName)}</div>
        </div>

        <div class="table-num">${escapeHTML(row.played ?? "-")}</div>
        <div class="table-num">${escapeHTML(row.wins ?? "-")}</div>
        <div class="table-num">${escapeHTML(row.draws ?? "-")}</div>
        <div class="table-num">${escapeHTML(row.losses ?? "-")}</div>
        <div class="table-num">${escapeHTML(row.goal_diff ?? row.goal_difference ?? "-")}</div>
        <div class="table-pts">${escapeHTML(row.points ?? "-")}</div>
      </div>
    `;
  }).join("");
}

function initSectionTabs(){
  const sectionButtons = document.querySelectorAll(".section-switch-btn");
  const sectionPanels = document.querySelectorAll(".section-panel");

  if(sectionButtons.length){
    sectionButtons.forEach(button => {
      button.addEventListener("click", () => {
        const section = button.dataset.section;
        const panel = document.getElementById(`section-${section}`);

        sectionButtons.forEach(item => item.classList.remove("active"));
        sectionPanels.forEach(item => item.classList.remove("active"));

        button.classList.add("active");
        panel?.classList.add("active");
      });
    });

    return;
  }

  const oldButtons = document.querySelectorAll(".match-tab");
  const oldPanels = document.querySelectorAll(".detail-panel");

  oldButtons.forEach(button => {
    button.addEventListener("click", () => {
      const panelId = button.dataset.panel;

      oldButtons.forEach(item => item.classList.remove("active"));
      oldPanels.forEach(item => item.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(panelId)?.classList.add("active");
    });
  });
}

function normalizePlayerDetail(basePlayer, data){
  const stats = statsArrayToObject(data.stats || basePlayer.stats || []);

  return {
    ...basePlayer,
    player_id: firstNonEmpty(data.player_id, basePlayer.player_id, basePlayer.id),
    id: firstNonEmpty(data.player_id, basePlayer.id),
    name: firstNonEmpty(data.name, basePlayer.name, basePlayer.player_name),
    player_name: firstNonEmpty(data.name, basePlayer.player_name, basePlayer.name),
    position: firstNonEmpty(data.position, basePlayer.position),
    rating: firstNonEmpty(data.rating, basePlayer.rating),
    team_id: firstNonEmpty(data.team_id, basePlayer.team_id),
    team_name: firstNonEmpty(data.team_name, basePlayer.team_name),
    team_side: firstNonEmpty(data.team_side, basePlayer.team_side),
    shirt_number: firstNonEmpty(data.shirt_number, basePlayer.shirt_number, basePlayer.jerseyNumber),

    goals: firstNonEmpty(data.goals, basePlayer.goals, 0),
    assists: firstNonEmpty(data.assists, basePlayer.assists, 0),
    yellow_cards: firstNonEmpty(data.yellow_cards, data.yellowCards, basePlayer.yellow_cards, basePlayer.yellowCards, 0),
    red_cards: firstNonEmpty(data.red_cards, data.redCards, basePlayer.red_cards, basePlayer.redCards, 0),

    subbed_in: normalizeBoolean(firstNonEmpty(data.subbed_in, basePlayer.subbed_in)),
    subbed_out: normalizeBoolean(firstNonEmpty(data.subbed_out, basePlayer.subbed_out)),
    is_substitute: firstNonEmpty(data.is_substitute, basePlayer.is_substitute),

    goal_minute: firstNonEmpty(data.goal_minute, basePlayer.goal_minute),
    goal_minutes: firstNonEmpty(data.goal_minutes, basePlayer.goal_minutes),
    assist_minute: firstNonEmpty(data.assist_minute, basePlayer.assist_minute),
    assist_minutes: firstNonEmpty(data.assist_minutes, basePlayer.assist_minutes),
    yellow_card_minute: firstNonEmpty(data.yellow_card_minute, basePlayer.yellow_card_minute),
    yellow_card_minutes: firstNonEmpty(data.yellow_card_minutes, basePlayer.yellow_card_minutes),
    red_card_minute: firstNonEmpty(data.red_card_minute, basePlayer.red_card_minute),
    red_card_minutes: firstNonEmpty(data.red_card_minutes, basePlayer.red_card_minutes),
    subbed_in_minute: firstNonEmpty(data.subbed_in_minute, data.sub_in_minute, data.in_minute, basePlayer.subbed_in_minute),
    subbed_out_minute: firstNonEmpty(data.subbed_out_minute, data.sub_out_minute, data.out_minute, basePlayer.subbed_out_minute),

    stats: data.stats || basePlayer.stats || [],
    statistics: {
      ...(basePlayer.statistics || {}),
      ...stats
    }
  };
}

async function openPlayerModalFromApi(playerId){
  const key = String(playerId);
  const basePlayer = PLAYER_LOOKUP.get(key) || { player_id: playerId };

  if(PLAYER_DETAIL_CACHE.has(key)){
    openPlayerModal(PLAYER_DETAIL_CACHE.get(key), basePlayer.team_name || "Atlético Nacional");
    return;
  }

  try{
    const data = await fetchJSON(`/api/match/${EVENT_ID}/player/${playerId}`);
    const player = normalizePlayerDetail(basePlayer, data);

    PLAYER_DETAIL_CACHE.set(key, player);
    openPlayerModal(player, player.team_name || "Atlético Nacional");
  } catch(error){
    console.error("Error opening player modal:", error);
    openPlayerModal(basePlayer, basePlayer.team_name || "Atlético Nacional");
  }
}

function renderModalEventBadges(player, stats){
  const withStats = {
    ...player,
    statistics: {
      ...(player.statistics || {}),
      ...(stats || {})
    }
  };

  const counts = getPlayerEventCounts(withStats);
  const badges = [];

  const goalMinutes = getMinutes(withStats, "goal");
  const assistMinutes = getMinutes(withStats, "assist");
  const yellowMinutes = getMinutes(withStats, "yellow");
  const redMinutes = getMinutes(withStats, "red");
  const subInMinute = getMinutes(withStats, "subIn")[0] || "";
  const subOutMinute = getMinutes(withStats, "subOut")[0] || "";

  if(counts.goals > 0){
    badges.push(`
      <div class="player-modal-event goal">
        <span class="event-symbol">⚽</span>
        <span>${counts.goals} gol${counts.goals > 1 ? "es" : ""}${goalMinutes.length ? ` · ${goalMinutes.map(formatMinute).join(", ")}` : ""}</span>
      </div>
    `);
  }

  if(counts.assists > 0){
    badges.push(`
      <div class="player-modal-event assist">
        <span class="event-symbol">A</span>
        <span>${counts.assists} asistencia${counts.assists > 1 ? "s" : ""}${assistMinutes.length ? ` · ${assistMinutes.map(formatMinute).join(", ")}` : ""}</span>
      </div>
    `);
  }

  if(counts.yellow > 0){
    badges.push(`
      <div class="player-modal-event yellow">
        <span class="card-symbol yellow"></span>
        <span>${counts.yellow} amarilla${counts.yellow > 1 ? "s" : ""}${yellowMinutes.length ? ` · ${yellowMinutes.map(formatMinute).join(", ")}` : ""}</span>
      </div>
    `);
  }

  if(counts.red > 0){
    badges.push(`
      <div class="player-modal-event red">
        <span class="card-symbol red"></span>
        <span>${counts.red} roja${counts.red > 1 ? "s" : ""}${redMinutes.length ? ` · ${redMinutes.map(formatMinute).join(", ")}` : ""}</span>
      </div>
    `);
  }

  if(counts.subIn){
    badges.push(`
      <div class="player-modal-event sub-in">
        <span>↗</span>
        <span>Entró${subInMinute ? ` · ${formatMinute(subInMinute)}` : ""}</span>
      </div>
    `);
  }

  if(counts.subOut){
    badges.push(`
      <div class="player-modal-event sub-out">
        <span>↘</span>
        <span>Salió${subOutMinute ? ` · ${formatMinute(subOutMinute)}` : ""}</span>
      </div>
    `);
  }

  return badges.length
    ? badges.join("")
    : `<div class="player-modal-event muted">Sin eventos destacados</div>`;
}

function openPlayerModal(player, teamName){
  const modal = document.getElementById("player-modal");
  if(!modal) return;

  const name = player.name || player.player_name || "Jugador";
  const position = player.position || "-";
  const rating = formatRating(player.rating) || "-";
  const allowNameFallback = isNacionalPlayer(player);
  const imageUrl = getPlayerHeadshot(player, { allowNameFallback });
  const fallbackInitials = getPlayerInitials(player, { allowNameFallback });

  const avatar = document.getElementById("pm-avatar");
  const ratingBadge = document.getElementById("pm-rating-badge");

  if(ratingBadge){
    ratingBadge.textContent = rating;
    ratingBadge.className = `player-modal-rating ${ratingClass(rating)}`;
  }

  safeText("pm-name", name);
  safeText("pm-position", position);
  safeText("pm-rating-meta", rating);
  
  const modalTeamName = teamName || player.team_name || "Atlético Nacional";
  const teamBadge = getTeamBadge(modalTeamName);
  const teamEl = document.getElementById("pm-team");
  
  if(teamEl){
    if(teamBadge){
    teamEl.innerHTML = `
      <img
        class="pm-team-badge"
        src="${teamBadge}"
        alt="${escapeHTML(modalTeamName)}"
      >
    `;
  } else {
    teamEl.textContent = modalTeamName;
  }
}

  if(avatar){
    if(imageUrl){
      avatar.innerHTML = `
        <img
          src="${imageUrl}"
          alt="${escapeHTML(name)}"
          onerror="this.remove(); this.parentNode.textContent='${fallbackInitials}'"
        >
      `;
    } else {
      avatar.textContent = fallbackInitials;
    }
  }

  const stats = player.statistics || statsArrayToObject(player.stats || []);

  const eventBadges = document.getElementById("pm-event-badges");

  if(eventBadges){
    eventBadges.innerHTML = renderModalEventBadges(player, stats);
  }

  const statsList = document.getElementById("pm-stats-list");

  if(statsList){
    statsList.innerHTML = `
      ${modalStatRow("Posición", position)}
      ${modalStatRow("Minutes played", firstNonEmpty(stats.minutesPlayed, stats.minutes_played, player.minutes_played))}
      ${modalStatRow("Goals", firstNonEmpty(stats.goals, stats.goal, player.goals))}
      ${modalStatRow("Expected goals (xG)", firstNonEmpty(stats.expectedGoals, stats.expected_goals, stats.xg, player.xg))}
      ${modalStatRow("Assists", firstNonEmpty(stats.goalAssist, stats.assists, player.assists))}
      ${modalStatRow("Expected assists (xA)", firstNonEmpty(stats.expectedAssists, stats.expected_assists, stats.xa, player.xa))}
      ${modalStatRow("Key passes", firstNonEmpty(stats.keyPass, stats.keyPasses, stats.key_passes))}
      ${modalStatRow("Crosses", firstNonEmpty(stats.totalCross, stats.crosses))}
      ${modalStatRow("Accurate crosses", firstNonEmpty(stats.accurateCross, stats.accurate_crosses))}
      ${modalStatRow("Accurate passes", firstNonEmpty(stats.accuratePass, stats.accurate_passes))}
      ${modalStatRow("Total passes", firstNonEmpty(stats.totalPass, stats.total_passes))}
      ${modalStatRow("Long balls", firstNonEmpty(stats.totalLongBalls, stats.long_balls))}
      ${modalStatRow("Accurate long balls", firstNonEmpty(stats.accurateLongBalls, stats.accurate_long_balls))}
      ${modalStatRow("Total shots", firstNonEmpty(stats.totalShots, stats.shots_total))}
      ${modalStatRow("Shots on target", firstNonEmpty(stats.onTargetScoringAttempt, stats.shots_on_target))}
      ${modalStatRow("Touches", stats.touches)}
      ${modalStatRow("Possession lost", firstNonEmpty(stats.possessionLostCtrl, stats.possession_lost))}
      ${modalStatRow("Recoveries", firstNonEmpty(stats.ballRecovery, stats.recoveries))}
      ${modalStatRow("Tackles", firstNonEmpty(stats.totalTackle, stats.tackles))}
      ${modalStatRow("Interceptions", firstNonEmpty(stats.interceptionWon, stats.interceptions))}
      ${modalStatRow("Clearances", firstNonEmpty(stats.totalClearance, stats.clearances))}
      ${modalStatRow("Fouls", stats.fouls)}
      ${modalStatRow("Dribbled past", firstNonEmpty(stats.challengeLost, stats.dribbled_past))}
    `;
  }

  modal.classList.remove("hidden");
}

function closePlayerModal(){
  document.getElementById("player-modal")?.classList.add("hidden");
}

function setupStatsTabs(statsByPeriod){
  const totalBtn = document.getElementById("stats-total-btn");
  const firstBtn = document.getElementById("stats-1t-btn");
  const secondBtn = document.getElementById("stats-2t-btn");

  const totalStats = statsByPeriod.TOTAL || [];
  const firstStats = statsByPeriod["1T"] || [];
  const secondStats = statsByPeriod["2T"] || [];

  function setActiveStats(period){
    totalBtn?.classList.remove("active");
    firstBtn?.classList.remove("active");
    secondBtn?.classList.remove("active");

    if(period === "TOTAL"){
      totalBtn?.classList.add("active");
      renderStats(totalStats);
    } else if(period === "1T"){
      firstBtn?.classList.add("active");
      renderStats(firstStats);
    } else {
      secondBtn?.classList.add("active");
      renderStats(secondStats);
    }
  }

  totalBtn?.addEventListener("click", () => setActiveStats("TOTAL"));
  firstBtn?.addEventListener("click", () => setActiveStats("1T"));
  secondBtn?.addEventListener("click", () => setActiveStats("2T"));

  setActiveStats("TOTAL");
}

async function initMatchDetail(){
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const content = document.getElementById("content");

  try{
    const match = await fetchJSON(`/api/match/${EVENT_ID}`);

    const info = match.match_info || {};
    const lineups = match.lineups || {};
    const statsByPeriod = match.stats_by_period || {};
    const flatTable = match.flat_table || [];

    const nacionalPlayers = getNacionalPlayers(info, lineups);
    const nacionalSubs = getNacionalSubs(info, lineups);

    rememberPlayers(getAllLineupPlayers(lineups));
    rememberPlayers(nacionalPlayers);
    rememberPlayers(nacionalSubs);

    safeText("md-tournament", info.tournament_name || "Torneo");
    safeText("md-title", `${info.home_team || "-"} vs ${info.away_team || "-"}`);
    safeText("md-meta", `${match.date || info.date || "-"} · ${match.time || info.time || "-"}`);
    safeText("md-status", info.status || "-");

    safeText("md-home", info.home_team || "-");
    safeText("md-away", info.away_team || "-");
    safeText("md-home-score", info.home_score ?? "-");
    safeText("md-away-score", info.away_score ?? "-");

    safeText("stats-home-name", info.home_team || "-");
    safeText("stats-away-name", info.away_team || "-");
    safeText("stats-scoreline", `${info.home_score ?? "-"} - ${info.away_score ?? "-"}`);

    const starterCount = nacionalPlayers
      .filter(player => !normalizeBoolean(player.is_substitute))
      .slice(0, 11)
      .length;

    safeText(
      "lineup-subtitle",
      starterCount
        ? `${starterCount} jugadores · click en el jugador para ver detalle`
        : "Sin alineación disponible."
    );

    renderLeagueBadge("md-league-badge", info.tournament_name || "Liga BetPlay");
    renderLeagueBadge("table-league-badge", info.tournament_name || "Liga BetPlay");

    renderTeamBadge("md-home-badge", info.home_team || "Home");
    renderTeamBadge("md-away-badge", info.away_team || "Away");
    renderTeamBadge("stats-home-badge", info.home_team || "Home");
    renderTeamBadge("stats-away-badge", info.away_team || "Away");

    renderNacionalPitch(nacionalPlayers);
    renderSubs(nacionalSubs);
    renderTable(flatTable);

    const events = extractMatchEvents(match, lineups);
    renderMatchEvents(events);
    renderHeroSummary(info, events);

    setupStatsTabs(statsByPeriod);

    if(loading) loading.style.display = "none";
    if(error) error.style.display = "none";
    if(content) content.style.display = "flex";
  } catch(err){
    console.error(err);

    if(loading) loading.style.display = "none";

    if(error){
      error.style.display = "block";
      error.textContent = "No se pudo cargar este partido.";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("player-modal-close")?.addEventListener("click", closePlayerModal);
  document.getElementById("player-modal-overlay")?.addEventListener("click", closePlayerModal);

  initSectionTabs();
  initMatchDetail();
});