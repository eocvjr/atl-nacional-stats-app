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
  tableBody.innerHTML = '';

  if(!flatTable || !flatTable.length){
    tableBody.textContent = 'Sin tabla disponible.';
    return;
  }

  // Tomamos solo top 8 para que no sea muy largo
  const top = flatTable.slice(0, 8);

  top.forEach(row => {
    const isNacional = row.team_name &&
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
      <div class="bar"><i style="width:${pct}%;"></i></div>
      <div class="rating-value">${p.rating ?? '-'}</div>
    `;
    list.appendChild(row);
  });
}

// --------- INIT ---------
async function initDashboard(){
  try {
    const [nextMatch, prevMatches, lastDetail] = await Promise.all([
      fetchJSON(NEXT_MATCH_ENDPOINT),
      fetchJSON(PREVIOUS_MATCHES_ENDPOINT),
      fetchJSON(LAST_MATCH_DETAIL_ENDPOINT),
    ]);

    renderNextMatch(nextMatch);
    renderPrevious(prevMatches);

    if(lastDetail && lastDetail.flat_table){
      renderTableFromFlat(lastDetail.flat_table);
    }

    const tabHome = document.getElementById('tab-home');
    const tabAway = document.getElementById('tab-away');

    if (!lastDetail || !lastDetail.match_info || !lastDetail.lineups) {
      const list = document.getElementById('player-list');
      if (list) list.textContent = 'Sin alineaciones en este partido.';
      return;
    }

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
  } catch(e) {
    console.error('Error inicializando dashboard:', e);
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);
