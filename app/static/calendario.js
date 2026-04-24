const PLAYER_IMAGES = {
  "David Ospina": "https://images.fotmob.com/image_resources/playerimages/50065.png",
  "Harlen Castillo": "https://images.fotmob.com/image_resources/playerimages/1435218.png",
  "Kevin Cataño": "https://images.fotmob.com/image_resources/playerimages/1886618.png",
  "Andrés Román": "https://images.fotmob.com/image_resources/playerimages/925847.png",
  "Milton Casco": "https://images.fotmob.com/image_resources/playerimages/174813.png",
  "Simon Garcia": "https://images.fotmob.com/image_resources/playerimages/1579303.png",
  "César Haydar": "https://images.fotmob.com/image_resources/playerimages/1139171.png",
  "William Tesillo": "https://images.fotmob.com/image_resources/playerimages/207383.png",
  "Neider Parra": "https://www.fotmob.com/img/player-fallback-dark.png",
  "Samuel Velasquez": "https://images.fotmob.com/image_resources/playerimages/1433031.png",
  "Cristian Uribe": "https://images.fotmob.com/image_resources/playerimages/1714944.png",
  "Juan Manuel Rengifo": "https://images.fotmob.com/image_resources/playerimages/1798773.png",
  "Matheus Uribe": "https://images.fotmob.com/image_resources/playerimages/320618.png",
  "Andrés Sarmiento": "https://images.fotmob.com/image_resources/playerimages/942987.png",
  "Jorman Campuzano": "https://images.fotmob.com/image_resources/playerimages/922875.png",
  "Edwin Cardona": "https://images.fotmob.com/image_resources/playerimages/177507.png",
  "Nicolas Rodriguez": "https://images.fotmob.com/image_resources/playerimages/1460577.png",
  "Juan Zapata": "https://images.fotmob.com/image_resources/playerimages/1199834.png",
  "Marlos Moreno": "https://images.fotmob.com/image_resources/playerimages/677249.png",
  "Cristian Arango": "https://images.fotmob.com/image_resources/playerimages/452368.png",
  "Eduard Bello": "https://images.fotmob.com/image_resources/playerimages/495825.png",
  "Matias Lozano": "https://images.fotmob.com/image_resources/playerimages/1895028.png",
  "Alfredo Morelos": "https://images.fotmob.com/image_resources/playerimages/579660.png",
  "Dairon Asprilla": "https://images.fotmob.com/image_resources/playerimages/425783.png"
};

const PLAYER_CATEGORIES = [
  { key: "avg_rating", label: "Rating", subtitle: "Mejor rating", decimals: 2 },
  { key: "goals", label: "Goles", subtitle: "Máximo goleador", decimals: 0 },
  { key: "assists", label: "Asistencias", subtitle: "Máximo asistidor", decimals: 0 },
  { key: "g_a", label: "G + A", subtitle: "Goles + asistencias", decimals: 0 },
  { key: "xg", label: "xG", subtitle: "Mayor xG", decimals: 2 },
  { key: "xa", label: "xA", subtitle: "Mayor xA", decimals: 2 },
  { key: "big_chances_created", label: "Big chances", subtitle: "Más chances creadas", decimals: 0 },
  { key: "minutes_played", label: "Minutos", subtitle: "Más minutos jugados", decimals: 0 }
];

let allPlayers = [];

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function formatNumber(value, decimals = 2){
  const num = Number(value);
  if(Number.isNaN(num)) return decimals === 0 ? "0" : "0.00";
  return num.toFixed(decimals);
}

function initials(name){
  if(!name) return "AN";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

function getPlayerImage(name){
  return PLAYER_IMAGES[name] || "";
}

function normalizePlayer(player){
  const name = player.player_name || player.name || "Jugador";

  return {
    name,
    position: player.position || "-",
    appearances: Number(player.appearances || player.matches || 0),
    avg_rating: Number(player.avg_rating ?? player.rating ?? 0),
    goals: Number(player.goals || 0),
    assists: Number(player.assists || 0),
    g_a: Number(player.goals || 0) + Number(player.assists || 0),
    minutes_played: Number(player.minutes_played || player.minutes || 0),
    xg: Number(player.xg || player.expected_goals || 0),
    xa: Number(player.xa || player.expected_assists || 0),
    big_chances_created: Number(
      player.big_chances_created ||
      player.bigChancesCreated ||
      player.big_chances ||
      0
    )
  };
}

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
}

function renderRecentForm(form){
  const container = document.getElementById("recent-form");
  if(!container) return;
  container.innerHTML = "";

  const items = Array.isArray(form) ? form : [];
  if(!items.length){
    container.innerHTML = `<div class="player-preview-empty">Sin forma reciente disponible.</div>`;
    return;
  }

  items.forEach(item => {
    const value = String(item || "").toUpperCase();
    const pill = document.createElement("div");
    pill.className = "form-pill";

    if(value === "W"){
      pill.classList.add("win");
      pill.textContent = "W";
    } else if(value === "D"){
      pill.classList.add("draw");
      pill.textContent = "D";
    } else {
      pill.classList.add("loss");
      pill.textContent = "L";
    }

    container.appendChild(pill);
  });
}

function renderSummary(summary){
  const matches = Number(summary.played ?? summary.matches ?? summary.partidos ?? 0);
  const points = Number(summary.points ?? summary.puntos ?? 0);
  const goalsFor = Number(summary.goals_for ?? summary.gf ?? summary.goles_a_favor ?? 0);
  const goalsAgainst = Number(summary.goals_against ?? summary.ga ?? summary.goles_en_contra ?? 0);
  const wins = Number(summary.wins ?? summary.victorias ?? 0);
  const draws = Number(summary.draws ?? summary.empates ?? 0);
  const losses = Number(summary.losses ?? summary.derrotas ?? 0);
  const goalDiff = Number(summary.goal_diff ?? summary.dg ?? (goalsFor - goalsAgainst));

  const goalsPerGame = Number(
    summary.goals_per_game ?? (matches ? goalsFor / matches : 0)
  );

  const concededPerGame = Number(
    summary.goals_against_per_game ?? (matches ? goalsAgainst / matches : 0)
  );

  const teamRating = Number(summary.team_rating ?? summary.avg_rating ?? summary.rating ?? 0);
  const cleanSheets = Number(summary.clean_sheets ?? summary.cleanSheets ?? 0);

  setText("kpi-matches", matches);
  setText("kpi-points", points);
  setText("kpi-gf", goalsFor);
  setText("kpi-ga", goalsAgainst);

  setText("team-rating", teamRating ? formatNumber(teamRating, 2) : "-");
  setText("team-goals-per-match", formatNumber(goalsPerGame, 2));
  setText("team-conceded-per-match", formatNumber(concededPerGame, 2));
  setText("team-goal-diff", goalDiff > 0 ? `+${goalDiff}` : `${goalDiff}`);
  setText("team-wins", wins);
  setText("team-clean-sheets", cleanSheets || "-");

  setText("sum-wins", wins);
  setText("sum-draws", draws);
  setText("sum-losses", losses);
  setText("sum-gd", goalDiff > 0 ? `+${goalDiff}` : `${goalDiff}`);
  setText("sum-gpg", formatNumber(goalsPerGame, 2));
  setText("sum-gapg", formatNumber(concededPerGame, 2));
}

function renderAvatar(name, className = "player-stat-avatar"){
  const imgUrl = getPlayerImage(name);

  if(imgUrl){
    return `
      <div class="${className}">
        <img src="${imgUrl}" alt="${name}" onerror="this.parentElement.innerHTML='${initials(name)}'">
      </div>
    `;
  }

  return `<div class="${className}">${initials(name)}</div>`;
}

function getLeaderForCategory(categoryKey){
  if(!allPlayers.length) return null;

  const sorted = [...allPlayers].sort((a, b) => {
    const aVal = Number(a[categoryKey] || 0);
    const bVal = Number(b[categoryKey] || 0);

    if(bVal !== aVal) return bVal - aVal;
    return (b.appearances || 0) - (a.appearances || 0);
  });

  return sorted[0] || null;
}

function renderPlayerStatGrid(){
  const container = document.getElementById("player-stat-grid");
  if(!container) return;
  container.innerHTML = "";

  PLAYER_CATEGORIES.forEach(category => {
    const leader = getLeaderForCategory(category.key);

    const card = document.createElement("div");
    card.className = "player-stat-card clickable";

    if(!leader){
      card.innerHTML = `
        <div class="player-stat-card-top">
          <div>
            <div class="player-stat-label">${category.label}</div>
            <div class="player-stat-sub">${category.subtitle}</div>
          </div>
          <div class="player-stat-value">-</div>
        </div>
      `;
      container.appendChild(card);
      return;
    }

    const rawValue = leader[category.key] || 0;
    const displayValue = category.decimals === 0
      ? String(Number(rawValue || 0))
      : formatNumber(rawValue, category.decimals);

    card.innerHTML = `
      <div class="player-stat-card-top">
        <div>
          <div class="player-stat-label">${category.label}</div>
          <div class="player-stat-sub">${category.subtitle}</div>
        </div>
        <div class="player-stat-value">${displayValue}</div>
      </div>

      <div class="player-stat-leader">
        ${renderAvatar(leader.name)}
        <div class="player-stat-meta">
          <div class="player-stat-name">${leader.name}</div>
          <div class="player-stat-extra">${leader.position} · ${leader.appearances} partidos</div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      const select = document.getElementById("player-select");
      if(select){
        select.value = leader.name;
      }
      renderPlayerPreview(leader.name);
    });

    container.appendChild(card);
  });
}

function renderPlayerSelect(players){
  const select = document.getElementById("player-select");
  if(!select) return;

  select.innerHTML = "";

  if(!players.length){
    select.innerHTML = `<option value="">Sin jugadores</option>`;
    return;
  }

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Seleccioná un jugador";
  select.appendChild(defaultOption);

  players.forEach(player => {
    const option = document.createElement("option");
    option.value = player.name;
    option.textContent = player.name;
    select.appendChild(option);
  });
}

function renderPlayerPreview(playerName){
  const container = document.getElementById("player-preview");
  if(!container) return;

  const player = allPlayers.find(p => p.name === playerName);

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
      <div class="player-preview-top">
        ${renderAvatar(player.name, "player-preview-avatar")}
        <div>
          <div class="player-preview-name">${player.name}</div>
          <div class="player-preview-sub">${player.position} · ${player.appearances} partidos</div>
        </div>
      </div>

      <div class="player-preview-stats">
        <div class="preview-stat">
          <div class="preview-stat-label">Rating</div>
          <div class="preview-stat-value">${formatNumber(player.avg_rating, 2)}</div>
        </div>
        <div class="preview-stat">
          <div class="preview-stat-label">Goles</div>
          <div class="preview-stat-value">${player.goals}</div>
        </div>
        <div class="preview-stat">
          <div class="preview-stat-label">Asistencias</div>
          <div class="preview-stat-value">${player.assists}</div>
        </div>
        <div class="preview-stat">
          <div class="preview-stat-label">G + A</div>
          <div class="preview-stat-value">${player.g_a}</div>
        </div>
        <div class="preview-stat">
          <div class="preview-stat-label">xG</div>
          <div class="preview-stat-value">${formatNumber(player.xg, 2)}</div>
        </div>
        <div class="preview-stat">
          <div class="preview-stat-label">xA</div>
          <div class="preview-stat-value">${formatNumber(player.xa, 2)}</div>
        </div>
        <div class="preview-stat">
          <div class="preview-stat-label">Big chances created</div>
          <div class="preview-stat-value">${player.big_chances_created}</div>
        </div>
        <div class="preview-stat">
          <div class="preview-stat-label">Minutos jugados</div>
          <div class="preview-stat-value">${player.minutes_played}</div>
        </div>
      </div>
    </div>
  `;
}

function wirePlayerLookup(){
  const btn = document.getElementById("player-btn");
  const select = document.getElementById("player-select");

  if(btn){
    btn.addEventListener("click", () => {
      renderPlayerPreview(select.value);
    });
  }

  if(select){
    select.addEventListener("change", () => {
      renderPlayerPreview(select.value);
    });
  }
}

async function initEstadisticas(){
  try {
    const data = await fetchJSON("/api/estadisticas");

    const summary = data.summary || data.resumen || {};
    const recentForm = data.recent_form || data.form || data.forma_reciente || [];
    const playersRaw = data.players || data.top_players || data.player_stats || [];

    allPlayers = playersRaw.map(normalizePlayer);

    renderSummary(summary);
    renderRecentForm(recentForm);
    renderPlayerStatGrid();
    renderPlayerSelect(allPlayers);
    wirePlayerLookup();
  } catch (err) {
    console.error("Error cargando estadísticas:", err);
  }
}

document.addEventListener("DOMContentLoaded", initEstadisticas);