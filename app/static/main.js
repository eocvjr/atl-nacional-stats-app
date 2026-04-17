// ENDPOINTS DE TU BACKEND FLASK
const NEXT_MATCH_ENDPOINT        = '/api/next-match';
const PREVIOUS_MATCHES_ENDPOINT  = '/api/previous-matches';
const LAST_MATCH_DETAIL_ENDPOINT = '/api/last-match-detail';

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
    venueEl.textContent = `Estadio: ${stadium}`;
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
    cont.textContent = 'Sin partidos en el cache.';
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
        <div class="badge-opponent">${shortName(m.away_team)}</div>
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
    const initials = shortName(p.name);
    const pct = percentFromRating(p.rating);
    const { bar, text } = getRatingColor(p.rating);

    const row = document.createElement('div');
    row.className = 'player';
    row.innerHTML = `
      <div class="name">
        <div class="avatar green">${initials}</div>
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

// --------- HELPERS (iguales al main.js) ---------
async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('HTTP ' + res.status + ' al llamar ' + url);
  return res.json();
}

// Calcula diferencia de goles con signo
function formatDG(gf, ga){
  if(gf == null || ga == null) return '-';
  const d = gf - ga;
  if(d > 0) return '+' + d;
  return String(d);
}

// Genera puntos de forma a partir de historial (si el API lo provee)
// Acepta array de strings ['W','D','L'] o los infiere de los datos
function formDots(form){
  if(!form || !form.length) return '';
  return form.slice(-5).map(r => `<div class="fd ${r}" title="${r === 'W' ? 'Victoria' : r === 'D' ? 'Empate' : 'Derrota'}"></div>`).join('');
}

// --------- RENDER CHIPS DE NACIONAL ---------
function renderStats(row){
  const statsRow = document.getElementById('stats-row');
  if(!row){ statsRow.style.display = 'none'; return; }

  document.getElementById('s-pos').textContent  = row.position + '°';
  document.getElementById('s-pts').textContent  = row.points;
  document.getElementById('s-pj').textContent   = row.played ?? '-';

  const dg = formatDG(row.goals_for, row.goals_against);
  document.getElementById('s-dg').textContent = dg;

  statsRow.style.display = 'flex';
}

// --------- RENDER TABLA ---------
function renderTable(flatTable){
  const tableBody = document.getElementById('table-body');
  const updatedEl = document.getElementById('table-updated');
  tableBody.innerHTML = '';

  if(!flatTable || !flatTable.length){
    tableBody.innerHTML = '<div class="state-msg">Sin tabla disponible.</div>';
    return;
  }

  updatedEl.textContent = `${flatTable.length} equipos · actualizado a la fecha más reciente`;

  // Busca a Nacional para los chips
  const nac = flatTable.find(r =>
    r.team_name && r.team_name.toLowerCase().includes('atlético nacional')
  );
  renderStats(nac || null);

  flatTable.forEach((row, i) => {
    const isNacional = row.team_name &&
      row.team_name.toLowerCase().includes('atlético nacional');

    const pos = row.position ?? (i + 1);
    const isTop3 = pos <= 3;

    // Badge de posición
    let posBadgeClass = 'pos-badge';
    if(isNacional) posBadgeClass += ' nacional';
    else if(isTop3) posBadgeClass += ' top3';

    // Zona lateral (borde izquierdo por posición)
    let zoneBorder = '';
    if(pos <= 4)       zoneBorder = 'border-left:3px solid #00c26a;';
    else if(pos <= 8)  zoneBorder = 'border-left:3px solid #2196f3;';
    else if(pos >= flatTable.length - 1) zoneBorder = 'border-left:3px solid #e74c3c;';
    else               zoneBorder = 'border-left:3px solid transparent;';

    const dg = formatDG(row.goals_for, row.goals_against);
    const dotsHtml = row.form ? formDots(row.form) : '';

    const div = document.createElement('div');
    div.className = 'team-row' + (isNacional ? ' highlight' : '');
    div.style.cssText = zoneBorder;
    div.style.animationDelay = (i * 30) + 'ms';

    div.innerHTML = `
      <div class="${posBadgeClass}">${pos}</div>

      <div class="team-name-cell">
        <span class="name${isNacional ? ' highlight-name' : ''}">${row.team_name}</span>
      </div>

      <div class="cell">${row.played ?? '-'}</div>
      <div class="cell">${row.wins ?? '-'}</div>
      <div class="cell">${row.draws ?? '-'}</div>
      <div class="cell">${row.losses ?? '-'}</div>
      <div class="cell hide-mobile">${dg}</div>
      <div class="cell pts">${row.points ?? '-'}</div>
    `;

    tableBody.appendChild(div);
  });
}

// --------- INIT ---------
async function initTabla(){
  try {
    const data = await fetchJSON(LAST_MATCH_DETAIL_ENDPOINT);

    if(data && data.flat_table){
      renderTable(data.flat_table);
    } else {
      document.getElementById('table-body').innerHTML =
        '<div class="state-msg">No se encontró la tabla en el endpoint.</div>';
      document.getElementById('table-updated').textContent = 'Sin datos';
    }

    // Fecha del último partido (si viene en match_info)
    if(data && data.match_info && data.match_info.date){
      document.getElementById('table-date').textContent =
        'Tras partido del ' + data.match_info.date;
    }

  } catch(e) {
    console.error('Error cargando tabla:', e);
    document.getElementById('table-body').innerHTML =
      '<div class="state-msg">Error al cargar la tabla. Revisá la consola.</div>';
    document.getElementById('table-updated').textContent = 'Error de conexión';
  }
}

document.addEventListener('DOMContentLoaded', initTabla);