const NACIONAL_ID = 6106;

const PLAYER_IMAGES_BY_ID = {};

const PLAYER_IMAGES_BY_EXACT_NAME = {
  "David Ospina": { img: "https://images.fotmob.com/image_resources/playerimages/50065.png", initials: "DO" },
  "Harlen Castillo": { img: "https://images.fotmob.com/image_resources/playerimages/1435218.png", initials: "HC" },
  "Kevin Cataño": { img: "https://images.fotmob.com/image_resources/playerimages/1886618.png", initials: "KC" },
  "Kevin Catano": { img: "https://images.fotmob.com/image_resources/playerimages/1886618.png", initials: "KC" },
  "Kevin Castaño": { img: "https://images.fotmob.com/image_resources/playerimages/1886618.png", initials: "KC" },
  "Kevin Castano": { img: "https://images.fotmob.com/image_resources/playerimages/1886618.png", initials: "KC" },
  "Andrés Román": { img: "https://images.fotmob.com/image_resources/playerimages/925847.png", initials: "AR" },
  "Andres Roman": { img: "https://images.fotmob.com/image_resources/playerimages/925847.png", initials: "AR" },
  "Milton Casco": { img: "https://images.fotmob.com/image_resources/playerimages/174813.png", initials: "MC" },
  "Simón García": { img: "", initials: "SG" },
  "Simon Garcia": { img: "", initials: "SG" },
  "Robinson García": { img: "", initials: "RG" },
  "Robinson Garcia": { img: "", initials: "RG" },
  "Cristian Uribe": { img: "", initials: "CU" },
  "Matheus Uribe": { img: "https://images.fotmob.com/image_resources/playerimages/320618.png", initials: "MU" },
  "César Haydar": { img: "https://images.fotmob.com/image_resources/playerimages/1139171.png", initials: "CH" },
  "Cesar Haydar": { img: "https://images.fotmob.com/image_resources/playerimages/1139171.png", initials: "CH" },
  "William Tesillo": { img: "https://images.fotmob.com/image_resources/playerimages/207383.png", initials: "WT" },
  "Wiliam Tesillo": { img: "https://images.fotmob.com/image_resources/playerimages/207383.png", initials: "WT" },
  "Samuel Velásquez": { img: "https://images.fotmob.com/image_resources/playerimages/1433031.png", initials: "SV" },
  "Samuel Velasquez": { img: "https://images.fotmob.com/image_resources/playerimages/1433031.png", initials: "SV" },
  "Juan Manuel Rengifo": { img: "https://images.fotmob.com/image_resources/playerimages/1798773.png", initials: "JM" },
  "Jorman Campuzano": { img: "https://images.fotmob.com/image_resources/playerimages/922875.png", initials: "JC" },
  "Edwin Cardona": { img: "https://images.fotmob.com/image_resources/playerimages/177507.png", initials: "EC" },
  "Andrés Sarmiento": { img: "https://images.fotmob.com/image_resources/playerimages/942987.png", initials: "AS" },
  "Andres Sarmiento": { img: "https://images.fotmob.com/image_resources/playerimages/942987.png", initials: "AS" },
  "Nicolás Rodríguez": { img: "https://images.fotmob.com/image_resources/playerimages/1460577.png", initials: "NR" },
  "Nicolas Rodriguez": { img: "https://images.fotmob.com/image_resources/playerimages/1460577.png", initials: "NR" },
  "Juan Zapata": { img: "https://images.fotmob.com/image_resources/playerimages/1199834.png", initials: "JZ" },
  "Marlos Moreno": { img: "https://images.fotmob.com/image_resources/playerimages/677249.png", initials: "MM" },
  "Cristian Arango": { img: "https://images.fotmob.com/image_resources/playerimages/452368.png", initials: "CA" },
  "Eduard Bello": { img: "https://images.fotmob.com/image_resources/playerimages/495825.png", initials: "EB" },
  "Matías Lozano": { img: "https://images.fotmob.com/image_resources/playerimages/1895028.png", initials: "ML" },
  "Matias Lozano": { img: "https://images.fotmob.com/image_resources/playerimages/1895028.png", initials: "ML" },
  "Alfredo Morelos": { img: "https://images.fotmob.com/image_resources/playerimages/579660.png", initials: "AM" },
  "Dairon Asprilla": { img: "https://images.fotmob.com/image_resources/playerimages/425783.png", initials: "DA" }
};

const POSITION_ORDER = ["TODOS", "POR", "DEF", "MED", "DEL", "OTROS"];

const POSITION_LABELS = {
  TODOS: "Todos",
  POR: "Porteros",
  DEF: "Defensas",
  MED: "Mediocampistas",
  DEL: "Delanteros",
  OTROS: "Otros"
};

let ALL_PLAYERS = [];
let ACTIVE_POSITION = "TODOS";

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

const PLAYER_GROUP_OVERRIDES = {
  // Goalkeepers
  "David Ospina": "POR",
  "Harlen Castillo": "POR",
  "Kevin Cataño": "POR",
  "Kevin Catano": "POR",
  "Kevin Castaño": "POR",
  "Kevin Castano": "POR",
  "Édimer Zea": "POR",
  "Edimer Zea": "POR",

  // Defenders
  "Andrés Román": "DEF",
  "Andres Roman": "DEF",
  "Milton Casco": "DEF",
  "César Haydar": "DEF",
  "Cesar Haydar": "DEF",
  "William Tesillo": "DEF",
  "Wiliam Tesillo": "DEF",
  "Samuel Velásquez": "DEF",
  "Samuel Velasquez": "DEF",
  "Simón García": "DEF",
  "Simon Garcia": "DEF",
  "Robinson García": "DEF",
  "Robinson Garcia": "DEF",
  "Cristian Uribe": "DEF",

  // Midfielders
  "Jorman Campuzano": "MED",
  "Edwin Cardona": "MED",
  "Juan Manuel Rengifo": "MED",
  "Juan Zapata": "MED",
  "Nicolás Rodríguez": "MED",
  "Nicolas Rodriguez": "MED",
  "Matheus Uribe": "MED",

  // Forwards / attackers
  "Andrés Sarmiento": "DEL",
  "Andres Sarmiento": "DEL",
  "Marlos Moreno": "DEL",
  "Eduard Bello": "DEL",
  "Alfredo Morelos": "DEL",
  "Dairon Asprilla": "DEL",
  "Cristian Arango": "DEL",
  "Matías Lozano": "DEL",
  "Matias Lozano": "DEL"
};

function normalizeText(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function initials(name){
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if(!parts.length) return "--";
  if(parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getPlayerId(player){
  return player?.player_id || player?.id || null;
}

function findExactNameImage(playerName){
  const normalizedName = normalizeText(playerName);

  for(const [name, data] of Object.entries(PLAYER_IMAGES_BY_EXACT_NAME)){
    if(normalizeText(name) === normalizedName){
      return data;
    }
  }

  return null;
}

function playerImageData(player){
  const playerId = getPlayerId(player);
  const playerName = player?.player_name || player?.name || "";

  if(playerId && PLAYER_IMAGES_BY_ID[playerId]){
    return PLAYER_IMAGES_BY_ID[playerId];
  }

  const exact = findExactNameImage(playerName);
  if(exact) return exact;

  if(playerId){
    return {
      img: `https://api.sofascore.app/api/v1/player/${playerId}/image`,
      initials: initials(playerName),
      name: playerName
    };
  }

  return {
    img: "",
    initials: initials(playerName),
    name: playerName
  };
}

function getPlayerImage(player){
  const imageData = playerImageData(player);
  return player?.image_url || imageData?.img || "";
}

function getPlayerInitials(player){
  const imageData = playerImageData(player);
  return imageData?.initials || initials(player?.player_name || player?.name || "");
}

function normalizeGroup(position){
  const pos = String(position || "").toUpperCase().trim();

  if(["POR", "GK", "G"].includes(pos)) return "POR";
  if(["DEF", "DF", "D", "CB", "LB", "RB", "LWB", "RWB"].includes(pos)) return "DEF";
  if(["MED", "MF", "M", "DM", "CM", "AM", "LM", "RM"].includes(pos)) return "MED";
  if(["DEL", "FW", "F", "ST", "CF", "LW", "RW"].includes(pos)) return "DEL";

  return "OTROS";
}

function getShirtNumber(player){
  return (
    player?.shirt_number ??
    player?.shirtNumber ??
    player?.jerseyNumber ??
    player?.jersey_number ??
    player?.number ??
    null
  );
}

function getPlayerGroupOverride(playerName){
  const normalizedPlayerName = normalizeText(playerName);

  for(const [name, group] of Object.entries(PLAYER_GROUP_OVERRIDES)){
    if(normalizeText(name) === normalizedPlayerName){
      return group;
    }
  }

  return null;
}

function normalizePlayer(player){
  const ratingRaw = player?.avg_rating;
  const ratingNum = Number(ratingRaw);

  const playerName = player?.player_name || player?.name || "Jugador";
  const position = player?.position || "-";

  return {
    player_id: player?.player_id || player?.id || null,
    id: player?.player_id || player?.id || null,
    team_id: player?.team_id || NACIONAL_ID,
    team_name: player?.team_name || "Atlético Nacional",

    player_name: playerName,
    name: playerName,
    position: position,
    group: getPlayerGroupOverride(playerName) || normalizeGroup(position),

    shirt_number: getShirtNumber(player),

    appearances: Number(player?.appearances || 0),
    avg_rating: Number.isFinite(ratingNum) && ratingNum > 0 ? ratingNum : null,

    goals: Number(player?.goals || 0),
    assists: Number(player?.assists || 0),
    yellow_cards: Number(player?.yellow_cards || 0),
    red_cards: Number(player?.red_cards || 0),

    image_url: player?.image_url || ""
  };
}

function ratingClass(value){
  const num = Number(value);

  if(!Number.isFinite(num) || num <= 0) return "neutral";
  if(num >= 7.5) return "elite";
  if(num >= 7.0) return "good";
  if(num >= 6.5) return "mid";
  if(num >= 6.0) return "warn";
  return "bad";
}

function formatRating(value){
  const num = Number(value);
  if(!Number.isFinite(num) || num <= 0) return "-";
  return num.toFixed(2);
}

function updateSummary(players){
  const totalEl = document.getElementById("total-players");
  const avgEl = document.getElementById("avg-rating");

  if(totalEl){
    totalEl.textContent = ALL_PLAYERS.length;
  }

  if(!avgEl) return;

  const ratings = ALL_PLAYERS
    .map(player => player.avg_rating)
    .filter(value => value !== null && value !== undefined && Number.isFinite(Number(value)));

  if(!ratings.length){
    avgEl.textContent = "-";
    return;
  }

  const avg = ratings.reduce((sum, value) => sum + Number(value), 0) / ratings.length;
  avgEl.textContent = avg.toFixed(2);
}

function avatarHTML(player){
  const imageUrl = getPlayerImage(player);
  const fallbackInitials = getPlayerInitials(player);
  const name = player.player_name || "Jugador";

  if(imageUrl){
    return `
      <div class="player-avatar">
        <img
          src="${imageUrl}"
          alt="${name}"
          onerror="this.remove(); this.parentNode.textContent='${fallbackInitials}'"
        >
      </div>
    `;
  }

  return `<div class="player-avatar">${fallbackInitials}</div>`;
}

function shirtBadgeHTML(player){
  const shirtNumber = getShirtNumber(player);

  return `
    <div class="player-shirt-badge">
      ${shirtNumber !== null && shirtNumber !== undefined && shirtNumber !== "" ? shirtNumber : "-"}
    </div>
  `;
}

function playerCardHTML(player){
  const rating = formatRating(player.avg_rating);
  const displayGroup = POSITION_LABELS[player.group] || "Otros";
  const displayPosition = player.position || "-";

  return `
    <article class="player-row-card">
      <div class="player-left">
        ${avatarHTML(player)}

        <div class="player-info">
          <div class="player-name-line">
            <h3 class="player-name">${player.player_name}</h3>
            <span class="position-chip">${displayPosition}</span>
          </div>

          <div class="player-subline">
            <span>${displayGroup}</span>
            <span>·</span>
            <span>${player.appearances || 0} partidos</span>
          </div>
        </div>
      </div>

      <div class="player-right">
        ${shirtBadgeHTML(player)}

        <div class="rating-block player-stat-rating ${ratingClass(player.avg_rating)}">
          <span class="rating-number">${rating}</span>
          <span class="rating-label">Rating</span>
        </div>
      </div>
    </article>
  `;
}

function sortPlayers(players){
  return [...players].sort((a, b) => {
    const groupDiff = POSITION_ORDER.indexOf(a.group) - POSITION_ORDER.indexOf(b.group);
    if(groupDiff !== 0) return groupDiff;

    const appDiff = Number(b.appearances || 0) - Number(a.appearances || 0);
    if(appDiff !== 0) return appDiff;

    const ratingA = a.avg_rating ?? 0;
    const ratingB = b.avg_rating ?? 0;
    if(ratingB !== ratingA) return ratingB - ratingA;

    return a.player_name.localeCompare(b.player_name, "es", { sensitivity: "base" });
  });
}

function getFilteredPlayers(){
  const searchInput = document.getElementById("player-search");
  const search = normalizeText(searchInput?.value || "");

  return ALL_PLAYERS.filter(player => {
    const matchesPosition = ACTIVE_POSITION === "TODOS" || player.group === ACTIVE_POSITION;

    const matchesSearch =
      !search ||
      normalizeText(player.player_name).includes(search) ||
      normalizeText(player.position).includes(search) ||
      normalizeText(POSITION_LABELS[player.group]).includes(search);

    return matchesPosition && matchesSearch;
  });
}

function renderPositionFilters(){
  const container = document.getElementById("position-filters");
  if(!container) return;

  const counts = {
    TODOS: ALL_PLAYERS.length,
    POR: ALL_PLAYERS.filter(player => player.group === "POR").length,
    DEF: ALL_PLAYERS.filter(player => player.group === "DEF").length,
    MED: ALL_PLAYERS.filter(player => player.group === "MED").length,
    DEL: ALL_PLAYERS.filter(player => player.group === "DEL").length,
    OTROS: ALL_PLAYERS.filter(player => player.group === "OTROS").length
  };

  const visibleFilters = POSITION_ORDER.filter(key => key === "TODOS" || counts[key] > 0);

  container.innerHTML = visibleFilters.map(key => `
    <button
      type="button"
      class="filter-pill ${ACTIVE_POSITION === key ? "active" : ""}"
      data-position="${key}"
    >
      ${POSITION_LABELS[key]} <span>${counts[key]}</span>
    </button>
  `).join("");

  container.querySelectorAll(".filter-pill").forEach(button => {
    button.addEventListener("click", () => {
      ACTIVE_POSITION = button.dataset.position || "TODOS";
      renderPositionFilters();
      renderPlayers();
    });
  });
}

function buildGroup(groupKey, players){
  if(!players.length) return "";

  const groupName = POSITION_LABELS[groupKey] || "Otros";

  return `
    <section class="group-block">
      <div class="group-header">
        <div>
          <div class="group-kicker">${groupName}</div>
          <h2 class="group-title">${groupName}</h2>
        </div>

        <div class="group-count">${players.length}</div>
      </div>

      <div class="player-list">
        ${players.map(playerCardHTML).join("")}
      </div>
    </section>
  `;
}

function renderPlayers(){
  const container = document.getElementById("players-groups");
  const empty = document.getElementById("empty-state");

  if(!container) return;

  const players = sortPlayers(getFilteredPlayers());

  if(!players.length){
    container.innerHTML = "";
    if(empty) empty.style.display = "block";
    updateSummary([]);
    return;
  }

  if(empty) empty.style.display = "none";
  updateSummary(players);

  const grouped = {
    POR: [],
    DEF: [],
    MED: [],
    DEL: [],
    OTROS: []
  };

  players.forEach(player => {
    grouped[player.group].push(player);
  });

  const html = [
    buildGroup("POR", grouped.POR),
    buildGroup("DEF", grouped.DEF),
    buildGroup("MED", grouped.MED),
    buildGroup("DEL", grouped.DEL),
    buildGroup("OTROS", grouped.OTROS)
  ].filter(Boolean).join("");

  container.innerHTML = html;
}

function wireSearch(){
  const searchInput = document.getElementById("player-search");
  if(!searchInput) return;

  searchInput.addEventListener("input", () => {
    renderPlayers();
  });
}

async function initPlantel(){
  try{
    const data = await fetchJSON("/api/plantel");
    const rawPlayers = Array.isArray(data.players) ? data.players : [];

    ALL_PLAYERS = rawPlayers.map(normalizePlayer);

    renderPositionFilters();
    renderPlayers();
    wireSearch();
  } catch(err){
    console.error("Error cargando plantel:", err);

    const empty = document.getElementById("empty-state");
    const container = document.getElementById("players-groups");

    if(container){
      container.innerHTML = "";
    }

    if(empty){
      empty.style.display = "block";
      empty.textContent = "No se pudo cargar el plantel.";
    }

    updateSummary([]);
  }
}

document.addEventListener("DOMContentLoaded", initPlantel);