// --------- ENDPOINTS DE TU BACKEND FLASK ---------
const NEXT_MATCH_ENDPOINT = '/api/next-match';
const PREVIOUS_MATCHES_ENDPOINT = '/api/previous-matches';
const LAST_MATCH_DETAIL_ENDPOINT = '/api/last-match-detail';
const TOP_PERFORMER_ENDPOINT = '/api/top-performer-last-five';

const NACIONAL_ID = 6106;

// --------- PLAYER IMAGES: ID FIRST, EXACT NAME SECOND, NO LOOSE MATCH ---------
const PLAYER_IMAGES_BY_ID = {
  /*
    Optional manual overrides using YOUR DB/API player_id.

    Example:
    123456: {
      img: 'https://images.fotmob.com/image_resources/playerimages/50065.png',
      initials: 'DO',
      name: 'David Ospina'
    }
  */
};

const PLAYER_IMAGES_BY_EXACT_NAME = {
  'David Ospina': {
    img: 'https://images.fotmob.com/image_resources/playerimages/50065.png',
    initials: 'DO'
  },
  'Harlen Castillo': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1435218.png',
    initials: 'HC'
  },
  'Kevin Cataño': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1886618.png',
    initials: 'KC'
  },
  'Kevin Catano': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1886618.png',
    initials: 'KC'
  },
  'Kevin Castaño': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1886618.png',
    initials: 'KC'
  },
  'Kevin Castano': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1886618.png',
    initials: 'KC'
  },
  'Andrés Román': {
    img: 'https://images.fotmob.com/image_resources/playerimages/925847.png',
    initials: 'AR'
  },
  'Andres Roman': {
    img: 'https://images.fotmob.com/image_resources/playerimages/925847.png',
    initials: 'AR'
  },
  'Milton Casco': {
    img: 'https://images.fotmob.com/image_resources/playerimages/174813.png',
    initials: 'MC'
  },

  // Ambiguous names: exact full name only, no generic Garcia/Uribe/Rengifo.
  'Simón García': {
    img: '',
    initials: 'SG'
  },
  'Simon Garcia': {
    img: '',
    initials: 'SG'
  },
  'Robinson García': {
    img: '',
    initials: 'RG'
  },
  'Robinson Garcia': {
    img: '',
    initials: 'RG'
  },
  'Cristian Uribe': {
    img: '',
    initials: 'CU'
  },
  'Matheus Uribe': {
    img: 'https://images.fotmob.com/image_resources/playerimages/320618.png',
    initials: 'MU'
  },

  'César Haydar': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1139171.png',
    initials: 'CH'
  },
  'Cesar Haydar': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1139171.png',
    initials: 'CH'
  },
  'William Tesillo': {
    img: 'https://images.fotmob.com/image_resources/playerimages/207383.png',
    initials: 'WT'
  },
  'Wiliam Tesillo': {
    img: 'https://images.fotmob.com/image_resources/playerimages/207383.png',
    initials: 'WT'
  },
  'Samuel Velásquez': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1433031.png',
    initials: 'SV'
  },
  'Samuel Velasquez': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1433031.png',
    initials: 'SV'
  },
  'Juan Manuel Rengifo': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1798773.png',
    initials: 'JM'
  },
  'Jorman Campuzano': {
    img: 'https://images.fotmob.com/image_resources/playerimages/922875.png',
    initials: 'JC'
  },
  'Edwin Cardona': {
    img: 'https://images.fotmob.com/image_resources/playerimages/177507.png',
    initials: 'EC'
  },
  'Andrés Sarmiento': {
    img: 'https://images.fotmob.com/image_resources/playerimages/942987.png',
    initials: 'AS'
  },
  'Andres Sarmiento': {
    img: 'https://images.fotmob.com/image_resources/playerimages/942987.png',
    initials: 'AS'
  },
  'Nicolás Rodríguez': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1460577.png',
    initials: 'NR'
  },
  'Nicolas Rodriguez': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1460577.png',
    initials: 'NR'
  },
  'Juan Zapata': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1199834.png',
    initials: 'JZ'
  },
  'Marlos Moreno': {
    img: 'https://images.fotmob.com/image_resources/playerimages/677249.png',
    initials: 'MM'
  },
  'Cristian Arango': {
    img: 'https://images.fotmob.com/image_resources/playerimages/452368.png',
    initials: 'CA'
  },
  'Eduard Bello': {
    img: 'https://images.fotmob.com/image_resources/playerimages/495825.png',
    initials: 'EB'
  },
  'Matías Lozano': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1895028.png',
    initials: 'ML'
  },
  'Matias Lozano': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1895028.png',
    initials: 'ML'
  },
  'Alfredo Morelos': {
    img: 'https://images.fotmob.com/image_resources/playerimages/579660.png',
    initials: 'AM'
  },
  'Dairon Asprilla': {
    img: 'https://images.fotmob.com/image_resources/playerimages/425783.png',
    initials: 'DA'
  }
};

// --------- HELPERS ---------
async function fetchJSON(url){
  const res = await fetch(url);

  if(!res.ok){
    throw new Error('HTTP ' + res.status + ' al llamar ' + url);
  }

  return res.json();
}

function shortName(name){
  if(!name) return 'AN';

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if(!parts.length){
    return 'AN';
  }

  if(parts.length === 1){
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function normalizeText(value){
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function isNacionalName(name){
  const normalized = normalizeText(name);
  return normalized.includes('atletico nacional');
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
  const playerName = player?.name || player?.player_name || '';

  // 1. Best: manual override by DB/API player_id.
  if(playerId && PLAYER_IMAGES_BY_ID[playerId]){
    return PLAYER_IMAGES_BY_ID[playerId];
  }

  // 2. For Nacional pages/players, use exact full-name fallback before SofaScore.
  // IMPORTANT: exact name only. No includes(), no surname-only matching.
  if(allowNameFallback){
    const exact = findExactNameImage(playerName);

    if(exact && exact.img){
      return exact;
    }

    if(exact){
      return {
        img: '',
        initials: exact.initials || shortName(playerName),
        name: playerName
      };
    }
  }

  // 3. Safe backup: SofaScore image by exact player_id.
  // Good for rival players because it does NOT use names.
  if(playerId){
    return {
      img: `https://api.sofascore.app/api/v1/player/${playerId}/image`,
      initials: shortName(playerName),
      name: playerName
    };
  }

  // 4. Final fallback.
  return {
    img: '',
    initials: shortName(playerName),
    name: playerName
  };
}

function playerAvatarHTML(player, options = {}){
  const name = player?.name || player?.player_name || '';
  const imageData = playerImageData(player, options);
  const fallbackInitials = imageData?.initials || shortName(name);
  const imageUrl = player?.image_url || imageData?.img || '';

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

  return `<div class="avatar green">${fallbackInitials || 'AN'}</div>`;
}

function classifyResult(m){
  const nacIsHome = isNacionalName(m.home_team);
  const nacScore = Number(nacIsHome ? m.home_score : m.away_score);
  const rivScore = Number(nacIsHome ? m.away_score : m.home_score);

  if(nacScore > rivScore) return 'win';
  if(nacScore < rivScore) return 'loss';

  return 'draw';
}

function percentFromRating(r){
  if(r === null || r === undefined || r === '') return 0;

  const v = parseFloat(r);

  if(isNaN(v)) return 0;

  const clamped = Math.max(0, Math.min(10, v));
  return (clamped / 10) * 100;
}

function getRatingColor(r){
  const v = parseFloat(r);

  if(isNaN(v)){
    return {
      bar: 'rgba(255,255,255,0.12)',
      text: '#9aa3af'
    };
  }

  if(v >= 8.0){
    return {
      bar: 'linear-gradient(90deg,#4dffab,#00c26a)',
      text: '#4dffab'
    };
  }

  if(v >= 7.0){
    return {
      bar: 'linear-gradient(90deg,#2ecc71,#1a7a45)',
      text: '#2ecc71'
    };
  }

  if(v >= 6.0){
    return {
      bar: 'linear-gradient(90deg,#f1c40f,#c9a300)',
      text: '#f1c40f'
    };
  }

  if(v >= 5.0){
    return {
      bar: 'linear-gradient(90deg,#e67e22,#d96a00)',
      text: '#e67e22'
    };
  }

  return {
    bar: 'linear-gradient(90deg,#e74c3c,#c0392b)',
    text: '#e74c3c'
  };
}

const COMPETITION_ICONS = {
  'Primera A, Apertura': '/static/icons/liga-betplay.png',
  'Primera A, Clausura': '/static/icons/liga-betplay.png',
  'Liga BetPlay': '/static/icons/liga-betplay.png',
  'Liga Betplay': '/static/icons/liga-betplay.png',
  'Copa BetPlay': '/static/icons/liga-betplay.png',
  'Copa Betplay': '/static/icons/liga-betplay.png'
};

function getCompetitionIcon(tournamentName){
  return COMPETITION_ICONS[tournamentName] || '/static/icons/liga-betplay.png';
}

// --------- NEXT MATCH ---------
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

  if(nextMatchMain){
    nextMatchMain.style.cursor = 'pointer';
    nextMatchMain.onclick = () => {
      window.location.href = '/next-match';
    };
  }

  if(!data || !data.home_team){
    if(statusEl) statusEl.textContent = 'Sin próximo partido disponible';
    return;
  }

  const homeTeam = data.home_team || '';
  const awayTeam = data.away_team || '';
  const homePos = data.home_position ?? '-';
  const awayPos = data.away_position ?? '-';
  const stadium = data.stadium || 'Por confirmar';

  if(tournamentEl) tournamentEl.textContent = data.tournament_name || '';
  if(statusEl) statusEl.textContent = data.status || 'Programado';
  if(homeEl) homeEl.textContent = homeTeam;
  if(awayEl) awayEl.textContent = awayTeam;
  if(dateEl) dateEl.textContent = data.date || '--/--/----';
  if(timeEl) timeEl.textContent = data.time || '--:--';
  if(venueEl) venueEl.textContent = stadium;

  if(posHomeEl){
    posHomeEl.innerHTML = `${homeTeam}: <strong>${homePos}</strong>° en la Liga BetPlay`;
  }

  if(posAwayEl){
    posAwayEl.innerHTML = `${awayTeam}: <strong>${awayPos}</strong>° en la Liga BetPlay`;
  }
}

// --------- TABLE CARD ---------
function normalizeTableRows(payload){
  if(Array.isArray(payload)) return payload;
  if(Array.isArray(payload?.table)) return payload.table;
  if(Array.isArray(payload?.flat_table)) return payload.flat_table;
  return [];
}

function renderTableFromFlat(flatTable){
  const tableBody = document.getElementById('table-body');

  if(!tableBody) return;

  tableBody.innerHTML = '';

  const rows = normalizeTableRows(flatTable);

  if(!rows.length){
    tableBody.textContent = 'Sin tabla disponible.';
    return;
  }

  const top = rows.slice(0, 8);

  top.forEach(row => {
    const teamName = row.team_name || row.team || row.name || '-';
    const isNacional = isNacionalName(teamName);

    const div = document.createElement('div');
    div.className = 'team-row' + (isNacional ? ' highlight' : '');

    div.innerHTML = `
      <div class="team-left">
        <div class="avatar ${isNacional ? 'green' : ''}">
          ${row.position ?? '-'}
        </div>

        <div class="meta">
          ${teamName}
          <span class="sub">
            PJ ${row.played ?? '-'} · G ${row.wins ?? '-'} · E ${row.draws ?? '-'} · P ${row.losses ?? '-'}
          </span>
        </div>
      </div>

      <div class="points">${row.points ?? '-'}</div>
    `;

    tableBody.appendChild(div);
  });
}

// --------- PREVIOUS MATCHES ---------
function renderPrevious(matches){
  const cont = document.getElementById('recent-matches');
  const formEl = document.getElementById('recent-form');

  if(!cont) return;

  cont.innerHTML = '';

  if(!matches || !matches.length){
    cont.textContent = 'Sin partidos por mostrar.';
    if(formEl) formEl.textContent = '';
    return;
  }

  const last5 = matches.slice(0, 5);

  last5.forEach(m => {
    const r = classifyResult(m);
    const cls = r === 'win' ? 'score-win'
              : r === 'loss' ? 'score-loss'
              : 'score-draw';

    const href = m.event_id ? `/match/${m.event_id}` : '#';

    const card = document.createElement('a');
    card.className = 'match match-link';
    card.href = href;

    if(!m.event_id){
      card.setAttribute('aria-disabled', 'true');
      card.addEventListener('click', e => e.preventDefault());
    }

    card.innerHTML = `
      <div class="match-opponent">
        <div class="badge-opponent competition-badge">
          <img
            src="${getCompetitionIcon(m.tournament_name)}"
            alt="${m.tournament_name || 'Competición'}"
            onerror="this.style.display='none'; this.parentNode.textContent='LB';"
          >
        </div>

        <div class="match-info">
          <span class="label">${m.date || '-'} · ${m.tournament_name || 'Competición'}</span>
          <span>${m.home_team || '-'} vs ${m.away_team || '-'}</span>
        </div>
      </div>

      <div class="score-pill ${cls}">
        ${m.home_score ?? '-'} : ${m.away_score ?? '-'}
      </div>
    `;

    cont.appendChild(card);
  });

  const wins = last5.filter(m => classifyResult(m) === 'win').length;
  const draws = last5.filter(m => classifyResult(m) === 'draw').length;
  const losses = last5.filter(m => classifyResult(m) === 'loss').length;

  if(formEl){
    formEl.textContent = `${wins} G · ${draws} E · ${losses} P (últimos ${last5.length})`;
  }
}

// --------- PLAYERS / RATINGS ---------
function pickLineupSide(detail, side){
  const info = detail?.match_info || {};
  const lineups = detail?.lineups || {};

  if(side === 'home') return lineups.home_xi || [];
  if(side === 'away') return lineups.away_xi || [];

  const homeIsNacional = isNacionalName(info.home_team);
  const awayIsNacional = isNacionalName(info.away_team);

  if(homeIsNacional) return lineups.home_xi || [];
  if(awayIsNacional) return lineups.away_xi || [];

  return [
    ...(lineups.home_xi || []),
    ...(lineups.away_xi || [])
  ].filter(p => Number(p.team_id) === NACIONAL_ID);
}

function renderPlayers(detail, side = 'nacional'){
  const list = document.getElementById('player-list');

  if(!list) return;

  list.innerHTML = '';

  if(!detail || !detail.lineups){
    list.textContent = 'Sin alineaciones en este partido.';
    return;
  }

  const xi = pickLineupSide(detail, side);

  if(!xi || !xi.length){
    list.textContent = 'Sin XI detectado en la API.';
    return;
  }

  xi.slice(0, 11).forEach(p => {
    const name = p.name || p.player_name || 'Jugador';
    const rating = p.rating ?? '-';
    const pct = percentFromRating(p.rating);
    const { bar, text } = getRatingColor(rating);

    const row = document.createElement('div');
    row.className = 'player';

    row.innerHTML = `
      <div class="name">
        ${playerAvatarHTML({ ...p, name }, { allowNameFallback: true })}
        <div class="player-meta">
          ${name}
          <span class="role">${p.position || ''}</span>
        </div>
      </div>

      <div class="bar">
        <i style="width:${pct}%; background:${bar};"></i>
      </div>

      <div class="rating-value" style="color:${text};">
        ${rating}
      </div>
    `;

    list.appendChild(row);
  });
}

// --------- TOP PERFORMER ---------
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
  const imageData = playerImageData({ ...player, name }, { allowNameFallback: true });
  const fallbackInitials = imageData?.initials || shortName(name);
  const imageUrl = player.image_url || imageData?.img || '';

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

// --------- LOADERS ---------
async function loadNextMatch(){
  try{
    const nextMatch = await fetchJSON(NEXT_MATCH_ENDPOINT);
    renderNextMatch(nextMatch);
  } catch(e){
    console.error('Error cargando próximo partido:', e);
  }
}

async function loadTopPerformer(){
  try{
    const topPerformerData = await fetchJSON(TOP_PERFORMER_ENDPOINT);
    renderTopPerformer(topPerformerData.player);
  } catch(e){
    console.error('Error cargando mejor rendimiento:', e);
  }
}

async function loadPreviousMatches(){
  try{
    const prevMatches = await fetchJSON(PREVIOUS_MATCHES_ENDPOINT);
    renderPrevious(prevMatches);
  } catch(e){
    console.error('Error cargando partidos recientes:', e);
  }
}

async function loadLastMatchDetail(){
  const tableBody = document.getElementById('table-body');
  const list = document.getElementById('player-list');

  try{
    const lastDetail = await fetchJSON(LAST_MATCH_DETAIL_ENDPOINT);

    // Table card
    try{
      if(lastDetail && lastDetail.flat_table){
        renderTableFromFlat(lastDetail.flat_table);
      } else if(tableBody){
        tableBody.textContent = 'Sin tabla disponible.';
      }
    } catch(tableErr){
      console.error('Error renderizando tabla:', tableErr);
      if(tableBody) tableBody.textContent = 'No se pudo cargar la tabla.';
    }

    // Detail button
    const lineupBtn = document.getElementById('lineup-detail-btn');

    if(lineupBtn && lastDetail && lastDetail.event_id){
      lineupBtn.href = `/match/${lastDetail.event_id}`;
    }

    // Lineups
    const tabHome = document.getElementById('tab-home');
    const tabAway = document.getElementById('tab-away');

    if(!lastDetail || !lastDetail.match_info || !lastDetail.lineups){
      if(list) list.textContent = 'Sin alineaciones en este partido.';
      return;
    }

    if(!tabHome || !tabAway || !list){
      renderPlayers(lastDetail, 'nacional');
      return;
    }

    const info = lastDetail.match_info || {};
    const nacSide = isNacionalName(info.away_team) ? 'away' : 'home';
    const rivSide = nacSide === 'away' ? 'home' : 'away';

    tabHome.textContent = 'XI Nacional';
    tabAway.textContent = 'XI Rival';

    tabHome.classList.add('active');
    tabAway.classList.remove('active');

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
  } catch(e){
    console.error('Error cargando último partido:', e);

    if(tableBody) tableBody.textContent = 'No se pudo cargar la tabla.';
    if(list) list.textContent = 'No se pudo cargar este bloque.';
  }
}

// --------- INIT ---------
async function initDashboard(){
  await Promise.allSettled([
    loadNextMatch(),
    loadTopPerformer(),
    loadPreviousMatches(),
    loadLastMatchDetail()
  ]);
}

document.addEventListener('DOMContentLoaded', initDashboard);