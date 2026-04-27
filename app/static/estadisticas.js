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

const LEADER_CATEGORIES = [
  { title:"Rating", subtitle:"Mejor promedio", field:"avg_rating", decimals:2 },
  { title:"Goles", subtitle:"Máximo goleador", field:"goals", decimals:0 },
  { title:"Asistencias", subtitle:"Máximo asistidor", field:"assists", decimals:0 },
  { title:"G + A", subtitle:"Goles + asistencias", field:"goals_assists", decimals:0 },
  { title:"xG", subtitle:"Expected goals", field:"xg_scored", decimals:2 },
  { title:"xA", subtitle:"Expected assists", field:"xa_assisted", decimals:2 },
  { title:"xG + xA", subtitle:"Producción esperada", field:"xg_xa", decimals:2 },
  { title:"Penales", subtitle:"Penales convertidos", field:"penalty_goals", decimals:0 },
  { title:"Big chances missed", subtitle:"Ocasiones claras falladas", field:"big_chances_missed", decimals:0 },
  { title:"Big chances created", subtitle:"Ocasiones claras creadas", field:"big_chances_created", decimals:0 },
  { title:"Acc. passes", subtitle:"Pases precisos por partido", field:"accurate_passes_per_match", decimals:1 },
  { title:"Key passes", subtitle:"Pases clave por partido", field:"key_passes_per_match", decimals:1 },
  { title:"Dribbles", subtitle:"Regates exitosos por partido", field:"successful_dribbles_per_match", decimals:1 },
  { title:"Penalties won", subtitle:"Penales ganados", field:"penalties_won", decimals:0 },
  { title:"Tackles", subtitle:"Entradas por partido", field:"tackles_per_match", decimals:1 },
  { title:"Interceptions", subtitle:"Intercepciones por partido", field:"interceptions_per_match", decimals:1 },
  { title:"Clearances", subtitle:"Despejes por partido", field:"clearances_per_match", decimals:1 },
  { title:"Def. contributions", subtitle:"Tackles + INT + clearances", field:"defensive_contributions_per_match", decimals:1 },
  { title:"Dispossessed", subtitle:"Pérdidas por partido", field:"dispossessed_per_match", decimals:1 },
  { title:"Yellow cards", subtitle:"Tarjetas amarillas", field:"yellow_cards", decimals:0 },
  { title:"Red cards", subtitle:"Tarjetas rojas", field:"red_cards", decimals:0 }
];

let PLAYERS = [];

async function fetchJSON(url){
  const res = await fetch(url);

  if(!res.ok){
    throw new Error("HTTP " + res.status);
  }

  return res.json();
}

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
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

  if(!parts.length) return "AN";
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

function playerImgTag(player, className = ""){
  const name = player?.player_name || player?.name || "Jugador";
  const imageUrl = getPlayerImage(player);
  const fallbackInitials = getPlayerInitials(player);

  if(imageUrl){
    return `
      <img
        class="${className}"
        src="${imageUrl}"
        alt="${name}"
        onerror="this.remove(); this.parentNode.textContent='${fallbackInitials}'"
      >
    `;
  }

  return fallbackInitials;
}

function formatStat(value, decimals = 2){
  if(value === null || value === undefined || value === ""){
    return "-";
  }

  const num = Number(value);

  if(Number.isNaN(num)){
    return value;
  }

  if(decimals === 0){
    return String(Math.round(num));
  }

  return num.toFixed(decimals).replace(/\.00$/, "");
}

function getTeamBadge(teamId){
  if(!teamId) return "";
  return `https://api.sofascore.app/api/v1/team/${teamId}/image`;
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
    avg_rating: Number(player.avg_rating || 0),

    goals: Number(player.goals || 0),
    assists: Number(player.assists || 0),
    goals_assists: Number(player.goals_assists || 0),

    xg_scored: Number(player.xg_scored || 0),
    xa_assisted: Number(player.xa_assisted || 0),
    xg_xa: Number(player.xg_xa || 0),

    penalty_goals: Number(player.penalty_goals || 0),
    penalties_taken: Number(player.penalties_taken || 0),

    big_chances_missed: Number(player.big_chances_missed || 0),
    big_chances_created: Number(player.big_chances_created || 0),

    accurate_passes_per_match: Number(player.accurate_passes_per_match || 0),
    accurate_passes_pct: Number(player.accurate_passes_pct || 0),

    key_passes_per_match: Number(player.key_passes_per_match || 0),
    successful_dribbles_per_match: Number(player.successful_dribbles_per_match || 0),
    successful_dribbles_pct: Number(player.successful_dribbles_pct || 0),

    penalties_won: Number(player.penalties_won || 0),

    tackles_per_match: Number(player.tackles_per_match || 0),
    interceptions_per_match: Number(player.interceptions_per_match || 0),
    clearances_per_match: Number(player.clearances_per_match || 0),
    defensive_contributions_per_match: Number(player.defensive_contributions_per_match || 0),

    dispossessed_per_match: Number(player.dispossessed_per_match || 0),

    yellow_cards: Number(player.yellow_cards || 0),
    red_cards: Number(player.red_cards || 0),

    image_url: player.image_url || ""
  };
}

function renderSummary(summary){
  const played = Number(summary.played || 0);
  const points = Number(summary.points || 0);
  const goalsFor = Number(summary.goals_for || 0);
  const goalsAgainst = Number(summary.goals_against || 0);
  const wins = Number(summary.wins || 0);
  const draws = Number(summary.draws || 0);
  const losses = Number(summary.losses || 0);
  const goalDiff = Number(summary.goal_diff ?? (goalsFor - goalsAgainst));
  const goalsPerGame = Number(summary.goals_per_game || 0);
  const goalsAgainstPerGame = Number(summary.goals_against_per_game || 0);

  setText("kpi-matches", played);
  setText("kpi-points", points);
  setText("kpi-gf", goalsFor);
  setText("kpi-ga", goalsAgainst);

  setText("team-rating", "-");
  setText("team-goals-per-match", formatStat(goalsPerGame, 2));
  setText("team-conceded-per-match", formatStat(goalsAgainstPerGame, 2));
  setText("team-goal-diff", goalDiff > 0 ? `+${goalDiff}` : `${goalDiff}`);
  setText("team-wins", wins);
  setText("team-clean-sheets", "-");

  setText("sum-wins", wins);
  setText("sum-draws", draws);
  setText("sum-losses", losses);
  setText("sum-gd", goalDiff > 0 ? `+${goalDiff}` : `${goalDiff}`);
  setText("sum-gpg", formatStat(goalsPerGame, 2));
  setText("sum-gapg", formatStat(goalsAgainstPerGame, 2));
}

function renderForm(data){
  const container = document.getElementById("recent-form");
  if(!container) return;

  container.innerHTML = "";

  const recentMatches = Array.isArray(data.recent_matches) ? data.recent_matches : [];

  if(recentMatches.length){
    recentMatches.forEach(match => {
      const div = document.createElement("div");
      div.className = "form-match";

      div.innerHTML = `
        <div class="form-badge">
          ${match.opponent_id ? `<img src="${getTeamBadge(match.opponent_id)}" alt="${match.opponent_name || ""}">` : ""}
        </div>

        <div class="form-opponent">${match.opponent_name || "-"}</div>

        <div class="form-result ${match.result || "D"}">${match.result || "-"}</div>
      `;

      container.appendChild(div);
    });

    return;
  }

  const form = Array.isArray(data.recent_form) ? data.recent_form : [];

  if(!form.length){
    container.innerHTML = `<div class="muted">No hay forma reciente disponible.</div>`;
    return;
  }

  form.forEach(result => {
    const value = String(result || "").toUpperCase();
    const div = document.createElement("div");

    let resultClass = "D";
    if(value === "W") resultClass = "W";
    if(value === "L") resultClass = "L";

    div.className = `form-pill ${resultClass}`;
    div.textContent = value;

    container.appendChild(div);
  });
}

function getTopThree(players, field){
  return [...players]
    .filter(player => {
      const value = Number(player[field] || 0);
      return !Number.isNaN(value);
    })
    .sort((a, b) => {
      const av = Number(a[field] || 0);
      const bv = Number(b[field] || 0);

      if(bv !== av) return bv - av;

      return Number(b.appearances || 0) - Number(a.appearances || 0);
    })
    .slice(0, 3);
}

function buildLeaderCard(category, topThree){
  if(!topThree.length){
    return `
      <div class="leader-stat-card">
        <div class="leader-card-head">
          <div>
            <div class="leader-card-title">${category.title}</div>
            <div class="leader-card-subtitle">${category.subtitle}</div>
          </div>
        </div>
        <div class="muted">Sin datos.</div>
      </div>
    `;
  }

  const leader = topThree[0];
  const runners = topThree.slice(1);

  return `
    <div class="leader-stat-card">
      <div class="leader-card-head">
        <div>
          <div class="leader-card-title">${category.title}</div>
          <div class="leader-card-subtitle">${category.subtitle}</div>
        </div>
      </div>

      <div class="leader-top">
        <div class="leader-top-left">
          <div class="leader-avatar">
            ${playerImgTag(leader)}
          </div>

          <div class="leader-main-info">
            <div class="leader-name">${leader.player_name}</div>
            <div class="leader-meta">${leader.position || "-"} · ${leader.appearances || 0} partidos</div>
          </div>
        </div>

        <div class="leader-value">${formatStat(leader[category.field], category.decimals)}</div>
      </div>

      <div class="runner-list">
        ${runners.map((player, index) => `
          <div class="runner-row">
            <div class="runner-left">
              <div class="runner-rank">${index + 2}</div>

              <div>
                <div class="runner-name">${player.player_name}</div>
                <div class="runner-meta">${player.position || "-"} · ${player.appearances || 0} partidos</div>
              </div>
            </div>

            <div class="runner-value">${formatStat(player[category.field], category.decimals)}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderLeaderCards(players){
  const container = document.getElementById("leaders-grid");
  if(!container) return;

  container.innerHTML = "";

  if(!players.length){
    container.innerHTML = `<div class="muted">No hay líderes disponibles.</div>`;
    return;
  }

  LEADER_CATEGORIES.forEach(category => {
    const topThree = getTopThree(players, category.field);
    container.insertAdjacentHTML("beforeend", buildLeaderCard(category, topThree));
  });
}

function populatePlayerSelect(players){
  const select = document.getElementById("player-select");
  if(!select) return;

  select.innerHTML = '<option value="">Seleccioná un jugador</option>';

  players.forEach((player, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${player.player_name} (${player.position || "-"})`;

    select.appendChild(option);
  });
}

function renderPlayerPreview(player){
  const container = document.getElementById("player-preview");
  if(!container) return;

  if(!player){
    container.innerHTML = `
      <div class="player-preview-empty">
        Seleccioná un jugador para ver su resumen.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="player-preview-card">
      <div class="leader-top" style="margin-bottom:0;">
        <div class="leader-top-left">
          <div class="leader-avatar">
            ${playerImgTag(player)}
          </div>

          <div class="leader-main-info">
            <div class="leader-name">${player.player_name}</div>
            <div class="leader-meta">${player.position || "-"} · ${player.appearances || 0} partidos</div>
          </div>
        </div>

        <div class="leader-value">${formatStat(player.avg_rating, 2)}</div>
      </div>

      <div class="player-preview-stats">
        <div class="preview-stat">
          <div class="preview-stat-label">Goles</div>
          <div class="preview-stat-value">${formatStat(player.goals, 0)}</div>
        </div>

        <div class="preview-stat">
          <div class="preview-stat-label">Asistencias</div>
          <div class="preview-stat-value">${formatStat(player.assists, 0)}</div>
        </div>

        <div class="preview-stat">
          <div class="preview-stat-label">G + A</div>
          <div class="preview-stat-value">${formatStat(player.goals_assists, 0)}</div>
        </div>

        <div class="preview-stat">
          <div class="preview-stat-label">xG + xA</div>
          <div class="preview-stat-value">${formatStat(player.xg_xa, 2)}</div>
        </div>
      </div>
    </div>
  `;
}

function wirePlayerLookup(){
  const btn = document.getElementById("player-btn");
  const select = document.getElementById("player-select");

  if(!btn || !select) return;

  btn.addEventListener("click", () => {
    const index = select.value;

    if(index === ""){
      renderPlayerPreview(null);
      return;
    }

    renderPlayerPreview(PLAYERS[Number(index)]);
  });

  select.addEventListener("change", () => {
    const index = select.value;

    if(index === ""){
      renderPlayerPreview(null);
      return;
    }

    renderPlayerPreview(PLAYERS[Number(index)]);
  });
}

async function initEstadisticas(){
  try{
    const data = await fetchJSON("/api/estadisticas");

    const playersRaw = data.players || [];
    PLAYERS = playersRaw.map(normalizePlayer);

    renderSummary(data.summary || {});
    renderForm(data);
    renderLeaderCards(PLAYERS);
    populatePlayerSelect(PLAYERS);
    wirePlayerLookup();
  } catch(err){
    console.error("Error cargando estadísticas:", err);
  }
}

document.addEventListener("DOMContentLoaded", initEstadisticas);