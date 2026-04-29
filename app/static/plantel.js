const NACIONAL_ID = 6106;

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
 1602863: {
      img: "https://images.fotmob.com/image_resources/playerimages/1579303.png",
      initials: "SG",
      name: "Simon Garcia"
};

const PLAYER_IMAGES_BY_EXACT_NAME = {
  // Exact-name fallback only. No generic surname keys.
  // This page is Nacional-only, so exact-name fallback is safe if player_id is missing.

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
    img: "https://images.fotmob.com/image_resources/playerimages/1714944.png",
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

let ALL_PLAYERS = [];

async function fetchJSON(url){
  const res = await fetch(url);

  if(!res.ok){
    throw new Error("HTTP " + res.status);
  }

  return res.json();
}

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

function playerImageData(player, options = {}){
  const allowNameFallback = options.allowNameFallback ?? true;
  const playerId = getPlayerId(player);
  const playerName = player?.player_name || player?.name || "";

  // 1. Best: manual override by DB/API player_id.
  if(playerId && PLAYER_IMAGES_BY_ID[playerId]){
    return PLAYER_IMAGES_BY_ID[playerId];
  }

  // 2. Safe: SofaScore image by exact player_id.
  if(playerId){
    return {
      img: `https://api.sofascore.app/api/v1/player/${playerId}/image`,
      initials: initials(playerName),
      name: playerName
    };
  }

  // 3. Exact full-name fallback only. No includes().
  if(allowNameFallback){
    const exact = findExactNameImage(playerName);

    if(exact){
      return exact;
    }
  }

  return {
    img: "",
    initials: initials(playerName),
    name: playerName
  };
}

function getPlayerImage(player){
  const imageData = playerImageData(player, { allowNameFallback: true });
  return player?.image_url || imageData?.img || "";
}

function getPlayerInitials(player){
  const imageData = playerImageData(player, { allowNameFallback: true });
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

function positionLabel(position){
  return normalizeGroup(position);
}

function normalizePlayer(player){
  return {
    player_id: player.player_id || player.id || null,
    id: player.player_id || player.id || null,
    team_id: player.team_id || NACIONAL_ID,
    team_name: player.team_name || "Atlético Nacional",

    player_name: player.player_name || player.name || "Jugador",
    name: player.player_name || player.name || "Jugador",
    position: player.position || "-",
    appearances: Number(player.appearances || 0),
    avg_rating: player.avg_rating === null || player.avg_rating === undefined || player.avg_rating === ""
      ? null
      : Number(player.avg_rating),

    goals: Number(player.goals || 0),
    assists: Number(player.assists || 0),
    yellow_cards: Number(player.yellow_cards || 0),
    red_cards: Number(player.red_cards || 0),

    image_url: player.image_url || ""
  };
}

function updateSummary(players){
  const totalEl = document.getElementById("total-players");
  const avgEl = document.getElementById("avg-rating");

  if(totalEl){
    totalEl.textContent = players.length;
  }

  if(!avgEl) return;

  const ratings = players
    .map(player => player.avg_rating)
    .filter(value => value !== null && value !== undefined && value !== "" && !Number.isNaN(Number(value)));

  if(ratings.length){
    const avg = ratings.reduce((sum, value) => sum + Number(value), 0) / ratings.length;
    avgEl.textContent = avg.toFixed(2);
  } else {
    avgEl.textContent = "-";
  }
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

function playerCardHTML(player){
  return `
    <div class="player-card">
      <div class="player-top">
        ${avatarHTML(player)}
        <div class="position-badge">${positionLabel(player.position)}</div>
      </div>

      <div class="player-main">
        <div class="player-name">${player.player_name}</div>
        <div class="player-sub">${positionLabel(player.position)}</div>
      </div>

      <div class="player-divider"></div>

      <div class="stats-row">
        <div class="stat">
          <div class="stat-value">${player.appearances ?? "-"}</div>
          <div class="stat-label">Apariciones</div>
        </div>

        <div class="stat">
          <div class="stat-value">${
            player.avg_rating === null || player.avg_rating === undefined || Number.isNaN(Number(player.avg_rating))
              ? "-"
              : Number(player.avg_rating).toFixed(2)
          }</div>
          <div class="stat-label">Rating promedio</div>
        </div>
      </div>
    </div>
  `;
}

function renderPlayers(players){
  const container = document.getElementById("players-groups");
  const empty = document.getElementById("empty-state");

  if(!container) return;

  container.innerHTML = "";

  if(!players || !players.length){
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
    grouped[normalizeGroup(player.position)].push(player);
  });

  const titleMap = {
    POR: "Porteros",
    DEF: "Defensas",
    MED: "Mediocampistas",
    DEL: "Delanteros",
    OTROS: "Otros"
  };

  ["POR", "DEF", "MED", "DEL", "OTROS"].forEach(groupName => {
    const groupPlayers = grouped[groupName];

    if(!groupPlayers.length) return;

    const block = document.createElement("section");
    block.className = "group-block";

    block.innerHTML = `
      <div class="group-header">
        <h2 class="group-title">${titleMap[groupName]}</h2>
        <div class="group-count">${groupPlayers.length}</div>
      </div>

      <div class="group-grid">
        ${groupPlayers.map(playerCardHTML).join("")}
      </div>
    `;

    container.appendChild(block);
  });
}

function applyFilters(){
  const searchInput = document.getElementById("player-search");
  const search = normalizeText(searchInput?.value || "");

  const filtered = ALL_PLAYERS.filter(player => {
    const name = normalizeText(player.player_name || "");
    const position = normalizeText(player.position || "");
    const group = normalizeText(positionLabel(player.position));

    return !search
      || name.includes(search)
      || position.includes(search)
      || group.includes(search);
  });

  renderPlayers(filtered);
}

async function initPlantel(){
  try{
    const data = await fetchJSON("/api/plantel");

    const rawPlayers = Array.isArray(data.players) ? data.players : [];
    ALL_PLAYERS = rawPlayers.map(normalizePlayer);

    renderPlayers(ALL_PLAYERS);

    const searchInput = document.getElementById("player-search");

    if(searchInput){
      searchInput.addEventListener("input", applyFilters);
    }
  } catch(err){
    console.error(err);

    const empty = document.getElementById("empty-state");

    if(empty){
      empty.style.display = "block";
      empty.textContent = "No se pudo cargar el plantel.";
    }

    updateSummary([]);
  }
}

document.addEventListener("DOMContentLoaded", initPlantel);