const PLAYER_IMAGES = {
  Ospina: {
    img: "https://images.fotmob.com/image_resources/playerimages/50065.png",
    initials: "DO"
  },
  Castillo: {
    img: "https://images.fotmob.com/image_resources/playerimages/1435218.png",
    initials: "HC"
  },
  Cataño: {
    img: "https://images.fotmob.com/image_resources/playerimages/1886618.png",
    initials: "KC"
  },
  Castaño: {
    img: "https://images.fotmob.com/image_resources/playerimages/1886618.png",
    initials: "KC"
  },
  Roman: {
    img: "https://images.fotmob.com/image_resources/playerimages/925847.png",
    initials: "AR"
  },
  Román: {
    img: "https://images.fotmob.com/image_resources/playerimages/925847.png",
    initials: "AR"
  },
  Casco: {
    img: "https://images.fotmob.com/image_resources/playerimages/174813.png",
    initials: "MC"
  },
  Garcia: {
    img: "https://images.fotmob.com/image_resources/playerimages/1579303.png",
    initials: "SG"
  },
  García: {
    img: "https://images.fotmob.com/image_resources/playerimages/1579303.png",
    initials: "SG"
  },
  Haydar: {
    img: "https://images.fotmob.com/image_resources/playerimages/1139171.png",
    initials: "CH"
  },
  Tesillo: {
    img: "https://images.fotmob.com/image_resources/playerimages/207383.png",
    initials: "WT"
  },
  Parra: {
    img: "https://www.fotmob.com/img/player-fallback-dark.png",
    initials: "KP"
  },
  Velasquez: {
    img: "https://images.fotmob.com/image_resources/playerimages/1433031.png",
    initials: "SV"
  },
  Velásquez: {
    img: "https://images.fotmob.com/image_resources/playerimages/1433031.png",
    initials: "SV"
  },
  CUribe: {
    img: "https://images.fotmob.com/image_resources/playerimages/1714944.png",
    initials: "CU"
  },
  Rengifo: {
    img: "https://images.fotmob.com/image_resources/playerimages/1798773.png",
    initials: "JM"
  },
  Uribe: {
    img: "https://images.fotmob.com/image_resources/playerimages/320618.png",
    initials: "MU"
  },
  Sarmiento: {
    img: "https://images.fotmob.com/image_resources/playerimages/942987.png",
    initials: "AS"
  },
  Campuzano: {
    img: "https://images.fotmob.com/image_resources/playerimages/922875.png",
    initials: "JC"
  },
  Cardona: {
    img: "https://images.fotmob.com/image_resources/playerimages/177507.png",
    initials: "EC"
  },
  Rodriguez: {
    img: "https://images.fotmob.com/image_resources/playerimages/1460577.png",
    initials: "NR"
  },
  Rodríguez: {
    img: "https://images.fotmob.com/image_resources/playerimages/1460577.png",
    initials: "NR"
  },
  Zapata: {
    img: "https://images.fotmob.com/image_resources/playerimages/1199834.png",
    initials: "JZ"
  },
  Moreno: {
    img: "https://images.fotmob.com/image_resources/playerimages/677249.png",
    initials: "MM"
  },
  Arango: {
    img: "https://images.fotmob.com/image_resources/playerimages/452368.png",
    initials: "CA"
  },
  Bello: {
    img: "https://images.fotmob.com/image_resources/playerimages/495825.png",
    initials: "EB"
  },
  Lozano: {
    img: "https://images.fotmob.com/image_resources/playerimages/1895028.png",
    initials: "ML"
  },
  Morelos: {
    img: "https://images.fotmob.com/image_resources/playerimages/579660.png",
    initials: "AM"
  },
  Asprilla: {
    img: "https://images.fotmob.com/image_resources/playerimages/425783.png",
    initials: "DA"
  }
};

let ALL_PLAYERS = [];

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

function normalizeText(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function initials(name){
  if(!name) return "--";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function findPlayerImage(playerName){
  const normalizedName = normalizeText(playerName);

  for(const [key, data] of Object.entries(PLAYER_IMAGES)){
    const normalizedKey = normalizeText(key);

    if(normalizedName.includes(normalizedKey)){
      return data;
    }
  }

  return null;
}

function normalizeGroup(position){
  const pos = (position || "").toUpperCase().trim();

  if(["POR", "GK", "G"].includes(pos)) return "POR";
  if(["DEF", "DF", "D", "CB", "LB", "RB", "LWB", "RWB"].includes(pos)) return "DEF";
  if(["MED", "MF", "M", "DM", "CM", "AM", "LM", "RM"].includes(pos)) return "MED";
  if(["DEL", "FW", "F", "ST", "CF", "LW", "RW"].includes(pos)) return "DEL";

  return "OTROS";
}

function positionLabel(position){
  return normalizeGroup(position);
}

function updateSummary(players){
  const totalEl = document.getElementById("total-players");
  const avgEl = document.getElementById("avg-rating");

  totalEl.textContent = players.length;

  const ratings = players
    .map(p => p.avg_rating)
    .filter(v => v !== null && v !== undefined && v !== "");

  if(ratings.length){
    const avg = ratings.reduce((a, b) => a + Number(b), 0) / ratings.length;
    avgEl.textContent = avg.toFixed(2);
  } else {
    avgEl.textContent = "-";
  }
}

function avatarHTML(player){
  const match = findPlayerImage(player.player_name);
  const imageUrl = player.image_url || match?.img;
  const fallbackInitials = match?.initials || initials(player.player_name);

  if(imageUrl){
    return `
      <div class="player-avatar">
        <img
          src="${imageUrl}"
          alt="${player.player_name}"
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
          <div class="stat-value">${player.avg_rating ?? "-"}</div>
          <div class="stat-label">Rating promedio</div>
        </div>
      </div>
    </div>
  `;
}

function renderPlayers(players){
  const container = document.getElementById("players-groups");
  const empty = document.getElementById("empty-state");

  container.innerHTML = "";

  if(!players || !players.length){
    empty.style.display = "block";
    updateSummary([]);
    return;
  }

  empty.style.display = "none";
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

  const order = ["POR", "DEF", "MED", "DEL"];

  order.forEach(groupName => {
    if(!grouped[groupName].length) return;

    const block = document.createElement("section");
    block.className = "group-block";

    const groupPlayers = grouped[groupName];

    const titleMap = {
      POR: "Porteros",
      DEF: "Defensas",
      MED: "Mediocampistas",
      DEL: "Delanteros"
    };

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

  if(grouped.OTROS.length){
    const block = document.createElement("section");
    block.className = "group-block";

    block.innerHTML = `
      <div class="group-header">
        <h2 class="group-title">Otros</h2>
        <div class="group-count">${grouped.OTROS.length}</div>
      </div>
      <div class="group-grid">
        ${grouped.OTROS.map(playerCardHTML).join("")}
      </div>
    `;

    container.appendChild(block);
  }
}

function applyFilters(){
  const search = document.getElementById("player-search").value.trim().toLowerCase();

  const filtered = ALL_PLAYERS.filter(player => {
    return !search || (player.player_name || "").toLowerCase().includes(search);
  });

  renderPlayers(filtered);
}

async function initPlantel(){
  try {
    const data = await fetchJSON("/api/plantel");
    ALL_PLAYERS = data.players || [];
    renderPlayers(ALL_PLAYERS);

    document.getElementById("player-search").addEventListener("input", applyFilters);
  } catch(err) {
    console.error(err);
    document.getElementById("empty-state").style.display = "block";
    document.getElementById("empty-state").textContent = "No se pudo cargar el plantel.";
  }
}

document.addEventListener("DOMContentLoaded", initPlantel);