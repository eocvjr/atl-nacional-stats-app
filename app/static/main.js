// ENDPOINTS DE TU BACKEND FLASK
const NEXT_MATCH_ENDPOINT        = '/api/next-match';
const PREVIOUS_MATCHES_ENDPOINT  = '/api/previous-matches';
const LAST_MATCH_DETAIL_ENDPOINT = '/api/last-match-detail';
const TOP_PERFORMER_ENDPOINT = '/api/top-performer-last-five';

// --------- HELPERS ---------
async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('HTTP ' + res.status + ' al llamar ' + url);
  return res.json();
}

function shortName(name){
  if(!name) return '';
  const parts = name.split(' ');
  if(parts.length === 1) return parts[0].slice(0,3).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function normalizeText(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
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

function playerAvatarHTML(player){
  const name = player?.name || "";
  const match = findPlayerImage(name);
  const fallbackInitials = match?.initials || shortName(name);
  const imageUrl = player?.image_url || match?.img;

  if(imageUrl){
    return `
      <div class="avatar green">
        <img
          src="${imageUrl}"
          alt="${name}"
          onerror="this.remove(); this.parentNode.textContent='${fallbackInitials}'"
        >
      </div>
    `;
  }

  return `<div class="avatar green">${fallbackInitials}</div>`;
}

function classifyResult(m){
  const nacIsHome = m.home_team === 'Atlético Nacional';
  const nacScore = nacIsHome ? m.home_score : m.away_score;
  const rivScore = nacIsHome ? m.away_score : m.home_score;
  if(nacScore > rivScore) return 'win';
  if(nacScore < rivScore) return 'loss';
  return 'draw';
}

function percentFromRating(r){
  if(r == null) return 0;
  const v = parseFloat(r);
  if(isNaN(v)) return 0;
  const c = Math.max(5, Math.min(10, v)); // clamp 5–10
  return ((c - 5) / 5) * 100;            // 0–100
}

const COMPETITION_ICONS = {
  "Primera A, Apertura": "/static/icons/liga-betplay.png",
  "Primera A, Clausura": "/static/icons/liga-betplay.png",
  "Liga BetPlay": "/static/icons/liga-betplay.png",
  "Liga Betplay": "/static/icons/liga-betplay.png",
  "Copa BetPlay": "/static/icons/liga-betplay.png",
  "Copa Betplay": "/static/icons/liga-betplay.png"
};

function getCompetitionIcon(tournamentName){
  return COMPETITION_ICONS[tournamentName] || "/static/icons/liga-betplay.png";
}

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
    initials: "NP"
  },
  Velasquez: {
    img: "https://images.fotmob.com/image_resources/playerimages/1433031.png",
    initials: "SV"
  },
  Velásquez: {
    img: "https://images.fotmob.com/image_resources/playerimages/1433031.png",
    initials: "SV"
  },
  "Cristian Uribe": {
    img: "https://images.fotmob.com/image_resources/playerimages/1714944.png",
    initials: "CU"
  },
  Rengifo: {
    img: "https://images.fotmob.com/image_resources/playerimages/1798773.png",
    initials: "JM"
  },
  "Matheus Uribe": {
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

function initialsFromName(name){
  if(!name) return 'AN';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function renderTopPerformer(player){
  const card = document.getElementById('top-performer-card');

  if(!card || !player){
    if(card) card.style.display = 'none';
    return;
  }

  const avatar = document.getElementById('top-performer-avatar');
  const nameEl = document.getElementById('top-performer-name');
  const posEl = document.getElementById('top-performer-position');
  const ratingEl = document.getElementById('top-performer-rating');
  const matchesEl = document.getElementById('top-performer-matches');
  const goalsEl = document.getElementById('top-performer-goals');
  const assistsEl = document.getElementById('top-performer-assists');

  const name = player.player_name || player.name || '-';

  const match = findPlayerImage(name);
  const fallbackInitials = match?.initials || shortName(name);
  const imageUrl = player.image_url || match?.img;

  if(avatar){
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
  }

  if(nameEl) nameEl.textContent = name;
  if(posEl) posEl.textContent = player.position || '-';
  if(ratingEl) ratingEl.textContent = player.avg_rating ?? player.rating ?? '-';
  if(matchesEl) matchesEl.textContent = player.matches_played ?? '-';
  if(goalsEl) goalsEl.textContent = player.goals ?? 0;
  if(assistsEl) assistsEl.textContent = player.assists ?? 0;

  card.style.display = 'block';
}

// --------- COLORES POR RATING ---------
function getRatingColor(r){
  const v = parseFloat(r);
  if(isNaN(v)) return { bar: 'rgba(255,255,255,0.12)', text: '#9aa3af' };
  if(v >= 8.0) return { bar: 'linear-gradient(90deg,#4dffab,#00c26a)', text: '#4dffab' };  // verde brillante (color original)
  if(v >= 7.0) return { bar: 'linear-gradient(90deg,#2ecc71,#1a7a45)', text: '#2ecc71' };  // verde oscuro
  if(v >= 6.0) return { bar: 'linear-gradient(90deg,#f1c40f,#c9a300)', text: '#f1c40f' };  // amarillo
  if(v >= 5.0) return { bar: 'linear-gradient(90deg,#e67e22,#d96a00)', text: '#e67e22' };  // naranja
  return             { bar: 'linear-gradient(90deg,#e74c3c,#c0392b)', text: '#e74c3c' };   // rojo
}

function renderNextMatch(data){
  const statusEl = document.getElementById('nm-status');
  const tournamentEl = document.getElementById('nm-tournament');
  const homeEl = document.getElementById('nm-home');
  const awayEl = document.getElementById('nm-away');
  const dateEl = document.getElementById('nm-date');
  const timeEl = document.getElementById('nm-time');
  const venueEl = document.getElementById('nm-venue');
  const posHomeEl = document.getElementById('nm-pos-home');
  const posAwayEl = document.getElementById('nm-pos-away');
  const nextMatchMain = document.getElementById('next-match-main');
  
  if (nextMatchMain) {
  nextMatchMain.style.cursor = 'pointer';
  nextMatchMain.onclick = () => {
    window.location.href = '/next-match';
  };
}

  if(!data || !data.home_team){
    if (statusEl) statusEl.textContent = 'Sin próximo partido disponible';
    return;
  }

  const homeTeam = data.home_team || '';
  const awayTeam = data.away_team || '';
  const homePos = data.home_position ?? '-';
  const awayPos = data.away_position ?? '-';
  const stadium = data.stadium || 'Por confirmar';

  if (tournamentEl) tournamentEl.textContent = data.tournament_name || '';
  if (statusEl) statusEl.textContent = data.status || 'Programado';
  if (homeEl) homeEl.textContent = homeTeam;
  if (awayEl) awayEl.textContent = awayTeam;
  if (dateEl) dateEl.textContent = data.date || '--/--/----';
  if (timeEl) timeEl.textContent = data.time || '--:--';

  if (venueEl) {
    venueEl.textContent = `${stadium}`;
  }

  if (posHomeEl) {
    posHomeEl.innerHTML = `${homeTeam}: <strong>${homePos}</strong>° de la Liga BetPlay`;
  }

  if (posAwayEl) {
    posAwayEl.innerHTML = `${awayTeam}: <strong>${awayPos}</strong>° de la Liga BetPlay`;
  }
}

// --------- TABLE (columna izquierda, bloque inferior) ---------
function renderTableFromFlat(flatTable, nacionalName = 'Atlético Nacional'){
  const tableBody = document.getElementById('table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if(!flatTable || !flatTable.length){
    tableBody.textContent = 'Sin tabla disponible.';
    return;
  }

  const top = flatTable.slice(0, 8);

  top.forEach(row => {
    const isNacional =
      row.team_name &&
      row.team_name.toLowerCase().includes(nacionalName.toLowerCase());

    const div = document.createElement('div');
    div.className = 'team-row' + (isNacional ? ' highlight' : '');

    div.innerHTML = `
      <div class="team-left">
        <div class="avatar ${isNacional ? 'green' : ''}">
          ${row.position}
        </div>
        <div class="meta">
          ${row.team_name}
          <span class="sub">PJ ${row.played} · G ${row.wins} · E ${row.draws} · P ${row.losses}</span>
        </div>
      </div>
      <div class="points">${row.points}</div>
    `;

    tableBody.appendChild(div);
  });
}

// --------- PREVIOUS MATCHES (columna central) ---------
function renderPrevious(matches){
  const cont = document.getElementById('recent-matches');
  const formEl = document.getElementById('recent-form');
  cont.innerHTML = '';

  if(!matches || !matches.length){
    cont.textContent = 'Sin partidos por mostrar.';
    formEl.textContent = '';
    return;
  }

  const last5 = matches.slice(0, 5);

  last5.forEach(m => {
    const r = classifyResult(m);
    const cls = r === 'win' ? 'score-win'
              : r === 'loss' ? 'score-loss'
              : 'score-draw';

    const div = document.createElement('div');
    div.className = 'match';
    div.innerHTML = `
      <div class="match-opponent">
        <div class="badge-opponent competition-badge">
        <img
         src="${getCompetitionIcon(m.tournament_name)}"
         alt="${m.tournament_name || 'Competición'}"
         onerror="this.style.display='none'; this.parentNode.textContent='LB';"
       >
     </div>
        <div class="match-info">
          <span class="label">${m.date} · ${m.tournament_name}</span>
          <span>${m.home_team} vs ${m.away_team}</span>
        </div>
      </div>
      <div class="score-pill ${cls}">
        ${m.home_score} : ${m.away_score}
      </div>
    `;
    cont.appendChild(div);
  });

  const wins   = last5.filter(m => classifyResult(m) === 'win').length;
  const draws  = last5.filter(m => classifyResult(m) === 'draw').length;
  const losses = last5.filter(m => classifyResult(m) === 'loss').length;

  formEl.textContent = `${wins} G · ${draws} E · ${losses} P (últimos ${last5.length})`;
}

// --------- PLAYERS / RATINGS (columna derecha) ---------
function renderPlayers(detail, side = 'home'){
  const list = document.getElementById('player-list');
  list.innerHTML = '';

  if(!detail || !detail.lineups){
    list.textContent = 'Sin alineaciones en este partido.';
    return;
  }

  const xi = side === 'home'
    ? detail.lineups.home_xi
    : detail.lineups.away_xi;

  if(!xi || !xi.length){
    list.textContent = 'Sin XI detectado en la API.';
    return;
  }

  xi.forEach(p => {
  const pct = percentFromRating(p.rating);
  const { bar, text } = getRatingColor(p.rating);

  const row = document.createElement('div');
  row.className = 'player';
  row.innerHTML = `
    <div class="name">
      ${playerAvatarHTML(p)}
      <div class="player-meta">
        ${p.name}
        <span class="role">${p.position || ''}</span>
      </div>
    </div>
    <div class="bar"><i style="width:${pct}%; background:${bar};"></i></div>
    <div class="rating-value" style="color:${text};">${p.rating ?? '-'}</div>
  `;
  list.appendChild(row);
});
}

// --------- INIT ---------
async function initDashboard(){
  try {
    const nextMatch = await fetchJSON(NEXT_MATCH_ENDPOINT);
    renderNextMatch(nextMatch);
  } catch (e) {
    console.error('Error cargando próximo partido:', e);
  }

  try {
  const topPerformerData = await fetchJSON(TOP_PERFORMER_ENDPOINT);
  renderTopPerformer(topPerformerData.player);
  } catch (e) {
  console.error('Error cargando mejor rendimiento:', e);
  }
  try {
    const prevMatches = await fetchJSON(PREVIOUS_MATCHES_ENDPOINT);
    renderPrevious(prevMatches);
  } catch (e) {
    console.error('Error cargando partidos recientes:', e);
  }

  try {
    const lastDetail = await fetchJSON(LAST_MATCH_DETAIL_ENDPOINT);

    if(lastDetail && lastDetail.flat_table){
      renderTableFromFlat(lastDetail.flat_table);
    }
    
    const lineupBtn = document.getElementById('lineup-detail-btn');
    if (lineupBtn && lastDetail && lastDetail.event_id) {
      lineupBtn.href = `/match/${lastDetail.event_id}`;
    }

    const tabHome = document.getElementById('tab-home');
    const tabAway = document.getElementById('tab-away');
    const list = document.getElementById('player-list');

    if (!lastDetail || !lastDetail.match_info || !lastDetail.lineups) {
      if (list) list.textContent = 'Sin alineaciones en este partido.';
      return;
    }

    if (!tabHome || !tabAway || !list) return;

    const nacSide = lastDetail.match_info.away_team === 'Atlético Nacional' ? 'away' : 'home';
    const rivSide = nacSide === 'away' ? 'home' : 'away';

    tabHome.textContent = 'XI Nacional';
    tabAway.textContent = 'XI Rival';

    renderPlayers(lastDetail, nacSide);

    tabHome.onclick = () => {
      tabHome.classList.add('active');
      tabAway.classList.remove('active');
      renderPlayers(lastDetail, nacSide);
    };

    tabAway.onclick = () => {
      tabAway.classList.add('active');
      tabHome.classList.remove('active');
      renderPlayers(lastDetail, rivSide);
    };
  } catch (e) {
    console.error('Error cargando tabla / último partido:', e);

    const tableBody = document.getElementById('table-body');
    if (tableBody) tableBody.textContent = 'No se pudo cargar la tabla.';

    const list = document.getElementById('player-list');
    if (list) list.textContent = 'No se pudo cargar este bloque.';
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);