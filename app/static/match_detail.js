const EVENT_ID = Number(document.body.dataset.eventId);
const NACIONAL_ID = 6106;

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

const PLAYER_HEADSHOTS = {
  "david ospina": "https://images.fotmob.com/image_resources/playerimages/50065.png",
  "harlen castillo": "https://images.fotmob.com/image_resources/playerimages/1435218.png",
  "kevin catano": "https://images.fotmob.com/image_resources/playerimages/1886618.png",
  "kevin castaño": "https://images.fotmob.com/image_resources/playerimages/1886618.png",
  "andres roman": "https://images.fotmob.com/image_resources/playerimages/925847.png",
  "andrés román": "https://images.fotmob.com/image_resources/playerimages/925847.png",
  "milton casco": "https://images.fotmob.com/image_resources/playerimages/174813.png",
  "simon garcia": "https://images.fotmob.com/image_resources/playerimages/1579303.png",
  "simón garcía": "https://images.fotmob.com/image_resources/playerimages/1579303.png",
  "cesar haydar": "https://images.fotmob.com/image_resources/playerimages/1139171.png",
  "wiliam tesillo": "https://images.fotmob.com/image_resources/playerimages/207383.png",
  "william tesillo": "https://images.fotmob.com/image_resources/playerimages/207383.png",
  "neider parra": "https://www.fotmob.com/img/player-fallback-dark.png",
  "samuel velasquez": "https://images.fotmob.com/image_resources/playerimages/1433031.png",
  "samuel velásquez": "https://images.fotmob.com/image_resources/playerimages/1433031.png",
  "cristian uribe": "https://images.fotmob.com/image_resources/playerimages/1714944.png",
  "juan manuel rengifo": "https://images.fotmob.com/image_resources/playerimages/1798773.png",
  "matheus uribe": "https://images.fotmob.com/image_resources/playerimages/320618.png",
  "andres sarmiento": "https://images.fotmob.com/image_resources/playerimages/942987.png",
  "andrés sarmiento": "https://images.fotmob.com/image_resources/playerimages/942987.png",
  "jorman campuzano": "https://images.fotmob.com/image_resources/playerimages/922875.png",
  "edwin cardona": "https://images.fotmob.com/image_resources/playerimages/177507.png",
  "nicolas rodriguez": "https://images.fotmob.com/image_resources/playerimages/1460577.png",
  "nicolás rodríguez": "https://images.fotmob.com/image_resources/playerimages/1460577.png",
  "juan zapata": "https://images.fotmob.com/image_resources/playerimages/1199834.png",
  "marlos moreno": "https://images.fotmob.com/image_resources/playerimages/677249.png",
  "cristian arango": "https://images.fotmob.com/image_resources/playerimages/452368.png",
  "eduard bello": "https://images.fotmob.com/image_resources/playerimages/495825.png",
  "matias lozano": "https://images.fotmob.com/image_resources/playerimages/1895028.png",
  "matías lozano": "https://images.fotmob.com/image_resources/playerimages/1895028.png",
  "alfredo morelos": "https://images.fotmob.com/image_resources/playerimages/579660.png",
  "dairon asprilla": "https://images.fotmob.com/image_resources/playerimages/425783.png"
};

function normalizeName(value){
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
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getPlayerHeadshot(name){
  const normalized = normalizeName(name);

  for(const [key, url] of Object.entries(PLAYER_HEADSHOTS)){
    const normalizedKey = normalizeName(key);

    if(normalized === normalizedKey || normalized.includes(normalizedKey)){
      return url;
    }
  }

  return "";
}

function lastName(name){
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "Jugador";
}

function formatRating(value){
  if(value === undefined || value === null || value === "") return "";
  const n = Number(value);
  if(Number.isNaN(n)) return "";
  return n.toFixed(1);
}

function formatStatValue(value){
  if(value === undefined || value === null || value === "" || value === "-"){
    return null;
  }

  const raw = String(value).trim();

  if(raw.includes("/") || raw.includes("%")){
    return raw;
  }

  const num = Number(raw);

  if(!Number.isNaN(num) && Number.isFinite(num)){
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
      <div class="modal-stat-name">${label}</div>
      <div class="modal-stat-value">${formatted}</div>
    </div>
  `;
}

function statsArrayToObject(statsArray){
  const obj = {};

  if(!Array.isArray(statsArray)){
    return obj;
  }

  statsArray.forEach(stat => {
    obj[stat.stat_name] = stat.stat_value;
  });

  return obj;
}

async function openPlayerModalFromApi(playerId){
  try{
    const data = await fetchJSON(`/api/match/${EVENT_ID}/player/${playerId}`);

    const normalizedPlayer = {
      name: data.name,
      player_name: data.name,
      position: data.position,
      rating: data.rating,
      team_name: data.team_name,
      shirt_number: data.shirt_number,
      goals: data.goals,
      assists: data.assists,
      statistics: statsArrayToObject(data.stats)
    };

    openPlayerModal(normalizedPlayer, data.team_name || "Atlético Nacional");
  } catch(err){
    console.error("Error opening player modal:", err);
  }
}

function openPlayerModal(player, teamName){
  const modal = document.getElementById("player-modal");
  const name = player.name || player.player_name || "Jugador";
  const rating = player.rating ?? "-";
  const position = player.position || "-";
  const avatar = document.getElementById("pm-avatar");
  const imageUrl = getPlayerHeadshot(name);
  const fallbackInitials = initials(name);

  document.getElementById("pm-name").textContent = name;
  document.getElementById("pm-position").textContent = position;
  document.getElementById("pm-team").textContent = teamName || "-";
  document.getElementById("pm-rating-badge").textContent = rating;
  document.getElementById("pm-rating-meta").textContent = rating;

  if(imageUrl){
    avatar.innerHTML = `
      <img
        src="${imageUrl}"
        alt="${name}"
        onerror="this.remove(); this.parentNode.textContent='${fallbackInitials}'"
      >
    `;
  } else {
    avatar.textContent = fallbackInitials;
  }

  const stats = player.statistics || player.stats || {};
  const statsList = document.getElementById("pm-stats-list");

  statsList.innerHTML = `
    ${modalStatRow("Rating", rating)}
    ${modalStatRow("Posición", position)}
    ${modalStatRow("Minutes played", stats.minutesPlayed ?? stats.minutes_played ?? player.minutes_played)}
    ${modalStatRow("Goals", stats.goals ?? stats.goal ?? player.goals)}
    ${modalStatRow("Expected goals (xG)", stats.expectedGoals ?? stats.expected_goals ?? stats.xg ?? player.xg)}
    ${modalStatRow("Assists", stats.goalAssist ?? stats.assists ?? player.assists)}
    ${modalStatRow("Expected assists (xA)", stats.expectedAssists ?? stats.expected_assists ?? stats.xa ?? player.xa)}
    ${modalStatRow("Key passes", stats.keyPass ?? stats.keyPasses ?? stats.key_passes)}
    ${modalStatRow("Crosses", stats.totalCross ?? stats.crosses)}
    ${modalStatRow("Accurate crosses", stats.accurateCross ?? stats.accurate_crosses)}
    ${modalStatRow("Accurate passes", stats.accuratePass ?? stats.accurate_passes)}
    ${modalStatRow("Total passes", stats.totalPass ?? stats.total_passes)}
    ${modalStatRow("Long balls", stats.totalLongBalls ?? stats.long_balls)}
    ${modalStatRow("Accurate long balls", stats.accurateLongBalls ?? stats.accurate_long_balls)}
    ${modalStatRow("Total shots", stats.totalShots ?? stats.shots_total)}
    ${modalStatRow("xGOT", stats.expectedGoalsOnTarget ?? stats.xgot)}
    ${modalStatRow("Shots on target", stats.onTargetScoringAttempt ?? stats.shots_on_target)}
    ${modalStatRow("Shots blocked", stats.blockedScoringAttempt ?? stats.shots_blocked)}
    ${modalStatRow("Touches", stats.touches)}
    ${modalStatRow("Unsuccessful touches", stats.unsuccessfulTouches)}
    ${modalStatRow("Dribbles successful", stats.wonContest ?? stats.dribbles_won)}
    ${modalStatRow("Possession lost", stats.possessionLostCtrl ?? stats.possession_lost)}
    ${modalStatRow("Tackles", stats.totalTackle ?? stats.tackles)}
    ${modalStatRow("Tackles won", stats.wonTackle ?? stats.tackles_won)}
    ${modalStatRow("Interceptions", stats.interceptionWon ?? stats.interceptions)}
    ${modalStatRow("Clearances", stats.totalClearance ?? stats.clearances)}
    ${modalStatRow("Blocked shots", stats.outfielderBlock ?? stats.blocked_shots)}
    ${modalStatRow("Recoveries", stats.ballRecovery ?? stats.recoveries)}
    ${modalStatRow("Ground duels won", stats.groundDuelsWon)}
    ${modalStatRow("Aerial duels won", stats.aerialWon)}
    ${modalStatRow("Fouls", stats.fouls)}
    ${modalStatRow("Dribbled past", stats.challengeLost)}
  `;

  modal.classList.remove("hidden");
}

function closePlayerModal(){
  document.getElementById("player-modal").classList.add("hidden");
}

function createPlayerNode(player){
  const node = document.createElement("button");
  node.type = "button";
  node.className = "player-node";

  const name = player.name || player.player_name || "Jugador";
  const photo = getPlayerHeadshot(name);
  const rating = formatRating(player.rating);
  const shirt = player.shirt_number ? `#${player.shirt_number}` : "";
  const goals = Number(player.goals || 0);
  const assists = Number(player.assists || 0);

  let icons = "";

  if(goals > 0 || assists > 0){
    icons += `<div class="player-icons">`;

    for(let i = 0; i < goals; i++){
      icons += `<div class="player-icon-badge" title="Gol">⚽</div>`;
    }

    for(let i = 0; i < assists; i++){
      icons += `<div class="player-icon-badge" title="Asistencia">🅰</div>`;
    }

    icons += `</div>`;
  }

  node.innerHTML = `
    <div class="player-avatar">
      ${icons}
      ${rating ? `<div class="rating-pill">${rating}</div>` : ""}
      ${
        photo
          ? `<img src="${photo}" alt="${name}" onerror="this.remove(); this.parentNode.insertAdjacentHTML('beforeend','<div class=&quot;player-initials&quot;>${initials(name)}</div>')">`
          : `<div class="player-initials">${initials(name)}</div>`
      }
    </div>

    <div class="player-label">
      ${shirt ? `<span class="player-shirt">${shirt}</span>` : ""}
      <span class="player-lastname">${lastName(name)}</span>
    </div>
    <div class="player-position">${player.position || ""}</div>
  `;

  if(player.has_detail && player.player_id){
    node.addEventListener("click", () => openPlayerModalFromApi(player.player_id));
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

  players.forEach(player => {
    const pos = String(player.position || "").toUpperCase();

    if(grouped[pos]){
      grouped[pos].push(player);
    } else {
      grouped.MED.push(player);
    }
  });

  return grouped;
}

function renderNacionalPitch(players){
  const pitch = document.getElementById("nacional-pitch");

  if(!pitch) return;

  pitch.querySelectorAll(".formation-row").forEach(row => row.remove());

  if(!players || !players.length){
    const row = document.createElement("div");
    row.className = "formation-row row-mid";
    row.innerHTML = `<div class="empty">Sin alineación disponible.</div>`;
    pitch.appendChild(row);
    return;
  }

  const grouped = groupFormation(players);

  const rows = [
    { key:"POR", className:"row-gk" },
    { key:"DEF", className:"row-def" },
    { key:"MED", className:"row-mid" },
    { key:"DEL", className:"row-att" }
  ];

  rows.forEach(rowInfo => {
    const row = document.createElement("div");
    row.className = `formation-row ${rowInfo.className}`;

    grouped[rowInfo.key].forEach(player => {
      row.appendChild(createPlayerNode(player));
    });

    pitch.appendChild(row);
  });
}

function getNacionalPlayers(info, lineups){
  const home = lineups.home_xi || [];
  const away = lineups.away_xi || [];

  const homeHasNacional = home.some(p => Number(p.team_id) === NACIONAL_ID)
    || normalizeName(info.home_team).includes("atletico nacional");

  const awayHasNacional = away.some(p => Number(p.team_id) === NACIONAL_ID)
    || normalizeName(info.away_team).includes("atletico nacional");

  if(homeHasNacional){
    return home.filter(p => !p.team_id || Number(p.team_id) === NACIONAL_ID);
  }

  if(awayHasNacional){
    return away.filter(p => !p.team_id || Number(p.team_id) === NACIONAL_ID);
  }

  return [];
}

function renderStats(stats){
  const container = document.getElementById("md-stats");
  container.innerHTML = "";

  if(!stats || !stats.length){
    container.innerHTML = '<div class="empty">Sin estadísticas disponibles.</div>';
    return;
  }

  stats.forEach(stat => {
    const row = document.createElement("div");
    row.className = "stat-row";

    row.innerHTML = `
      <div>${stat.home ?? "-"}</div>
      <div class="stat-name">${stat.name || "-"}</div>
      <div style="text-align:right">${stat.away ?? "-"}</div>
    `;

    container.appendChild(row);
  });
}

function renderTable(rows){
  const container = document.getElementById("md-table");
  container.innerHTML = "";

  if(!rows || !rows.length){
    container.innerHTML = '<div class="empty">Sin tabla disponible.</div>';
    return;
  }

  rows.slice(0, 8).forEach(row => {
    const isNacional = normalizeName(row.team_name).includes("atletico nacional");
    const div = document.createElement("div");

    div.className = "team-row" + (isNacional ? " highlight" : "");

    div.innerHTML = `
      <div class="left">
        <div>${row.position}. ${row.team_name}</div>
        <div class="sub">PJ ${row.played} · G ${row.wins} · E ${row.draws} · P ${row.losses}</div>
      </div>
      <div>${row.points} pts</div>
    `;

    container.appendChild(div);
  });
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

    document.getElementById("md-tournament").textContent = info.tournament_name || "Torneo";
    document.getElementById("md-title").textContent = `${info.home_team || "-"} vs ${info.away_team || "-"}`;
    document.getElementById("md-meta").textContent = `${match.date || "-"} · ${match.time || "-"}`;
    document.getElementById("md-status").textContent = info.status || "-";

    document.getElementById("md-home").textContent = info.home_team || "-";
    document.getElementById("md-away").textContent = info.away_team || "-";
    document.getElementById("md-home-score").textContent = info.home_score ?? "-";
    document.getElementById("md-away-score").textContent = info.away_score ?? "-";

    document.getElementById("lineup-subtitle").textContent =
      nacionalPlayers.length
        ? `${nacionalPlayers.length} jugadores · click en el jugador para ver detalle`
        : "Sin alineación de Nacional disponible.";


    renderTeamBadge("md-home-badge", info.home_team);
    renderTeamBadge("md-away-badge", info.away_team);
    renderNacionalPitch(nacionalPlayers);
    renderTable(flatTable);

    const totalStats = statsByPeriod.TOTAL || [];
    const firstHalfStats = statsByPeriod["1T"] || [];
    const secondHalfStats = statsByPeriod["2T"] || [];

    const totalBtn = document.getElementById("stats-total-btn");
    const firstBtn = document.getElementById("stats-1t-btn");
    const secondBtn = document.getElementById("stats-2t-btn");

    function setActiveStats(period){
      totalBtn.classList.remove("active");
      firstBtn.classList.remove("active");
      secondBtn.classList.remove("active");

      if(period === "TOTAL"){
        totalBtn.classList.add("active");
        renderStats(totalStats);
      } else if(period === "1T"){
        firstBtn.classList.add("active");
        renderStats(firstHalfStats);
      } else if(period === "2T"){
        secondBtn.classList.add("active");
        renderStats(secondHalfStats);
      }
    }

    totalBtn.onclick = () => setActiveStats("TOTAL");
    firstBtn.onclick = () => setActiveStats("1T");
    secondBtn.onclick = () => setActiveStats("2T");

    setActiveStats("TOTAL");

    loading.style.display = "none";
    error.style.display = "none";
    content.style.display = "flex";
  } catch(e){
    loading.style.display = "none";
    error.style.display = "block";
    error.textContent = "No se pudo cargar este partido.";
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("player-modal-close")?.addEventListener("click", closePlayerModal);
  document.getElementById("player-modal-overlay")?.addEventListener("click", closePlayerModal);
  initMatchDetail();
});

const TEAM_BADGES = {
  "Atlético Nacional": "https://images.fotmob.com/image_resources/logo/teamlogo/6368.png",
  "Deportivo Pasto": "https://images.fotmob.com/image_resources/logo/teamlogo/4405.png",
  "Junior Barranquilla": "https://images.fotmob.com/image_resources/logo/teamlogo/2254.png",
  "Deportes Tolima": "https://images.fotmob.com/image_resources/logo/teamlogo/1894.png",
  "América de Cali": "https://images.fotmob.com/image_resources/logo/teamlogo/10280.png",
  "Once Caldas": "https://images.fotmob.com/image_resources/logo/teamlogo/6024.png",
  "Internacional de Bogotá": "https://images.fotmob.com/image_resources/logo/teamlogo/47240.png",
  "Independiente Santa Fe": "https://images.fotmob.com/image_resources/logo/teamlogo/7818.png",
  "Deportivo Cali": "https://images.fotmob.com/image_resources/logo/teamlogo/6387.png",
  "Independiente Medellín": "https://images.fotmob.com/image_resources/logo/teamlogo/2528.png",
  "Atlético Bucaramanga": "https://images.fotmob.com/image_resources/logo/teamlogo/4401.png",
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

function teamInitials(name){
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
}

function renderTeamBadge(elementId, teamName){
  const el = document.getElementById(elementId);
  if(!el) return;

  const url = TEAM_BADGES[teamName];

  if(url){
    el.innerHTML = `
      <img
        src="${url}"
        alt="${teamName}"
        onerror="this.remove(); this.parentNode.textContent='${teamInitials(teamName)}'"
      >
    `;
  } else {
    el.textContent = teamInitials(teamName);
  }
}