async function fetchJSON(url){
  const res = await fetch(url);

  if(!res.ok){
    throw new Error('HTTP ' + res.status);
  }

  return res.json();
}

function normalizeName(value){
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function setText(id, value){
  const el = document.getElementById(id);
  if(el){
    el.textContent = value ?? '';
  }
}

function initials(name){
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if(!parts.length) return '?';
  if(parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return parts
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function lastName(name){
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return parts.length ? parts[parts.length - 1] : 'Jugador';
}

const TEAM_BADGES = {
  'Atlético Nacional': 'https://images.fotmob.com/image_resources/logo/teamlogo/6368.png',
  'Atletico Nacional': 'https://images.fotmob.com/image_resources/logo/teamlogo/6368.png',
  'Once Caldas': 'https://images.fotmob.com/image_resources/logo/teamlogo/6024.png',
  'Deportivo Pereira': 'https://images.fotmob.com/image_resources/logo/teamlogo/4404.png',
  'Atlético Bucaramanga': 'https://images.fotmob.com/image_resources/logo/teamlogo/4401.png',
  'Atletico Bucaramanga': 'https://images.fotmob.com/image_resources/logo/teamlogo/4401.png',
  'Jaguares de Córdoba': 'https://images.fotmob.com/image_resources/logo/teamlogo/424270.png',
  'Jaguares de Cordoba': 'https://images.fotmob.com/image_resources/logo/teamlogo/424270.png',
  'Cúcuta Deportivo': 'https://images.fotmob.com/image_resources/logo/teamlogo/6254.png',
  'Cucuta Deportivo': 'https://images.fotmob.com/image_resources/logo/teamlogo/6254.png',
  'Boyacá Chicó FC': 'https://images.fotmob.com/image_resources/logo/teamlogo/6255.png',
  'Boyaca Chico FC': 'https://images.fotmob.com/image_resources/logo/teamlogo/6255.png',
  'Independiente Medellín': 'https://images.fotmob.com/image_resources/logo/teamlogo/2528.png',
  'Independiente Medellin': 'https://images.fotmob.com/image_resources/logo/teamlogo/2528.png'
};

const LEAGUE_BADGES = {
  'primera a': 'https://images.fotmob.com/image_resources/logo/leaguelogo/274.png',
  'liga betplay': 'https://images.fotmob.com/image_resources/logo/leaguelogo/274.png',
  'copa betplay': 'https://images.fotmob.com/image_resources/logo/leaguelogo/144.png',
  'libertadores': 'https://images.fotmob.com/image_resources/logo/leaguelogo/242.png',
  'sudamericana': 'https://images.fotmob.com/image_resources/logo/leaguelogo/9472.png'
};

const PLAYER_IMAGES_BY_EXACT_NAME = {
  'Harlen Castillo': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1435218.png',
    initials: 'HC'
  },
  'Andrés Román': {
    img: 'https://images.fotmob.com/image_resources/playerimages/925847.png',
    initials: 'AR'
  },
  'Andres Roman': {
    img: 'https://images.fotmob.com/image_resources/playerimages/925847.png',
    initials: 'AR'
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
  'Samuel Velásquez': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1433031.png',
    initials: 'SV'
  },
  'Samuel Velasquez': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1433031.png',
    initials: 'SV'
  },
  'Andrés Sarmiento': {
    img: 'https://images.fotmob.com/image_resources/playerimages/942987.png',
    initials: 'AS'
  },
  'Andres Sarmiento': {
    img: 'https://images.fotmob.com/image_resources/playerimages/942987.png',
    initials: 'AS'
  },
  'Eduard Bello': {
    img: 'https://images.fotmob.com/image_resources/playerimages/495825.png',
    initials: 'EB'
  },
  'Edwin Cardona': {
    img: 'https://images.fotmob.com/image_resources/playerimages/177507.png',
    initials: 'EC'
  },
  'Jorman Campuzano': {
    img: 'https://images.fotmob.com/image_resources/playerimages/922875.png',
    initials: 'JC'
  },
  'Juan Manuel Rengifo': {
    img: 'https://images.fotmob.com/image_resources/playerimages/1798773.png',
    initials: 'JM'
  },
  'Alfredo Morelos': {
    img: 'https://images.fotmob.com/image_resources/playerimages/579660.png',
    initials: 'AM'
  }
};

function getTeamBadge(teamName){
  const normalized = normalizeName(teamName);

  for(const [name, url] of Object.entries(TEAM_BADGES)){
    if(normalizeName(name) === normalized){
      return url;
    }
  }

  return '';
}

function getLeagueBadge(tournamentName){
  const normalized = normalizeName(tournamentName);

  for(const [key, url] of Object.entries(LEAGUE_BADGES)){
    if(normalized.includes(key)){
      return url;
    }
  }

  return LEAGUE_BADGES['primera a'];
}

function setLogo(id, teamName){
  const el = document.getElementById(id);
  if(!el) return;

  const badge = getTeamBadge(teamName);
  const short = initials(teamName);

  if(badge){
    el.innerHTML = `
      <img
        src="${badge}"
        alt="${teamName || 'Equipo'}"
        onerror="this.remove(); this.parentNode.textContent='${short}'"
      >
    `;
  } else {
    el.textContent = short;
  }
}

function setLeagueLogo(id, tournamentName){
  const el = document.getElementById(id);
  if(!el) return;

  const badge = getLeagueBadge(tournamentName);

  if(badge){
    el.innerHTML = `<img src="${badge}" alt="${tournamentName || 'Liga'}">`;
  } else {
    el.textContent = 'LB';
  }
}

function playerInitials(name){
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if(!parts.length) return 'AN';
  if(parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function findExactPlayerImage(playerName){
  const normalizedName = normalizeName(playerName);

  for(const [name, data] of Object.entries(PLAYER_IMAGES_BY_EXACT_NAME)){
    if(normalizeName(name) === normalizedName){
      return data;
    }
  }

  return null;
}

function playerImage(player){
  const name = player.player_name || player.name || '';
  const exact = findExactPlayerImage(name);

  // For this page, this is Nacional-only, so exact name is safe.
  if(exact && exact.img){
    return exact.img;
  }

  if(player.image_url){
    return player.image_url;
  }

  // Use SofaScore only as backup.
  const playerId = player.player_id || player.id;
  if(playerId){
    return `https://api.sofascore.app/api/v1/player/${playerId}/image`;
  }

  return '';
}

function formatRating(value){
  if(value === null || value === undefined || value === '') return '';

  const num = Number(value);

  if(!Number.isFinite(num)) return '';

  return num.toFixed(1);
}

function normalizePlayerPosition(position){
  const pos = String(position || '').toUpperCase();

  if(['POR', 'GK', 'G'].includes(pos)) return 'POR';
  if(['DEF', 'DF', 'D'].includes(pos)) return 'DEF';
  if(['MED', 'MF', 'M'].includes(pos)) return 'MED';
  if(['DEL', 'FW', 'F', 'ST'].includes(pos)) return 'DEL';

  return pos || '';
}

function getFormationFromPlayers(players){
  const list = Array.isArray(players) ? players.slice(0, 11) : [];

  const counts = {
    DEF: 0,
    MED: 0,
    DEL: 0
  };

  list.forEach(player => {
    const pos = normalizePlayerPosition(player.position);

    if(pos === 'DEF') counts.DEF += 1;
    else if(pos === 'MED') counts.MED += 1;
    else if(pos === 'DEL') counts.DEL += 1;
  });

  const parts = [counts.DEF, counts.MED, counts.DEL].filter(Boolean);

  return parts.length ? parts.join('-') : 'Último XI';
}
function groupLineup(players){
  const groups = {
    POR: [],
    DEF: [],
    MED: [],
    DEL: []
  };

  players.forEach(player => {
    const pos = normalizePlayerPosition(player.position);

    if(pos === 'POR') groups.POR.push(player);
    else if(pos === 'DEF') groups.DEF.push(player);
    else if(pos === 'DEL') groups.DEL.push(player);
    else groups.MED.push(player);
  });

  return groups;
}

function getPlayerCoordinates(players){
  const groups = groupLineup(players);

  const coordinates = [];

  function addRow(rowPlayers, y){
    const count = rowPlayers.length;

    if(!count) return;

    const xsByCount = {
      1: [50],
      2: [38, 62],
      3: [30, 50, 70],
      4: [22, 40, 60, 78],
      5: [16, 33, 50, 67, 84]
    };

    const xs = xsByCount[count] || xsByCount[5];

    rowPlayers.forEach((player, index) => {
      coordinates.push({
        player,
        x: xs[index] || 50,
        y
      });
    });
  }

  // Same visual idea as match detail: GK top, defenders, mids, striker bottom
  addRow(groups.POR, 13);
  addRow(groups.DEF, 33);
  addRow(groups.MED, 59);
  addRow(groups.DEL, 84);

  return coordinates;
}

function lineupPlayerHTML(player, x, y){
  const name = player.name || player.player_name || 'Jugador';
  const img = playerImage(player);
  const short = playerInitials(name);
  const shirt = player.shirt_number || player.jerseyNumber || '';

  return `
    <div class="lineup-player" style="left:${x}%; top:${y}%;">
      <div class="lineup-avatar">
        ${
          img
            ? `<img src="${img}" alt="${name}" onerror="this.remove(); this.parentNode.textContent='${short}'">`
            : short
        }
      </div>

      <div class="lineup-name">
        ${shirt ? `<span class="lineup-shirt">#${shirt}</span>` : ''}
        ${lastName(name)}
      </div>

      <div class="lineup-pos">${normalizePlayerPosition(player.position)}</div>
    </div>
  `;
}

function renderFormationPitch(players){
  const pitchContainer = document.getElementById('last-lineup-list');
  if(!pitchContainer) return;

  const list = Array.isArray(players) ? players.slice(0, 11) : [];

  if(!list.length){
    pitchContainer.innerHTML = `
      <div class="lineup-empty">
        Sin alineación disponible.
      </div>
    `;
    return;
  }

  const positionedPlayers = getPlayerCoordinates(list);

  pitchContainer.innerHTML = positionedPlayers
    .map(({ player, x, y }) => lineupPlayerHTML(player, x, y))
    .join('');
}

function renderNacionalLineup(players){
  const oldContainer = document.getElementById('nacional-lineup');
  const list = Array.isArray(players) ? players.slice(0, 11) : [];

  // Old fallback container, if still present
  if(oldContainer){
    oldContainer.innerHTML = '';

    if(!list.length){
      oldContainer.innerHTML = `
        <div class="muted">
          No hay última alineación disponible en la base de datos.
        </div>
      `;
    } else {
      list.forEach(player => {
        const row = document.createElement('div');
        row.className = 'player-row';

        row.innerHTML = `
          <div class="player-main">
            <div class="player-name">${player.player_name || player.name || 'Jugador'}</div>
            <div class="player-pos">${normalizePlayerPosition(player.position)}</div>
          </div>
          <div class="rating">${formatRating(player.rating)}</div>
        `;

        oldContainer.appendChild(row);
      });
    }
  }

  renderFormationPitch(list);
}

function normalizeOddsChoices(odds){
  const choices = odds?.choices || [];

  if(!Array.isArray(choices)) return [];

  return choices;
}

function findOddChoice(choices, possibleNames, fallbackIndex){
  const normalizedNames = possibleNames.map(normalizeName);

  const found = choices.find(choice => {
    const name = normalizeName(choice.name);
    return normalizedNames.includes(name);
  });

  return found || choices[fallbackIndex] || null;
}

function renderOdds(odds){
  const oldContainer = document.getElementById('odds');
  const choices = normalizeOddsChoices(odds);

  const homeChoice = findOddChoice(choices, ['1', 'local', 'home'], 0);
  const drawChoice = findOddChoice(choices, ['x', 'empate', 'draw'], 1);
  const awayChoice = findOddChoice(choices, ['2', 'visitante', 'away'], 2);

  // Old fallback container, if still present
  if(oldContainer){
    oldContainer.innerHTML = '';

    if(!choices.length){
      oldContainer.innerHTML = '<div class="muted">No hay cuotas disponibles todavía.</div>';
    } else {
      choices.forEach(choice => {
        const div = document.createElement('div');
        div.className = 'odd';

        div.innerHTML = `
          <div>
            <div class="odd-label">${choice.name || '-'}</div>
          </div>
          <div class="odd-value">${choice.odd || '-'}</div>
        `;

        oldContainer.appendChild(div);
      });
    }
  }

  setText('odd-home', homeChoice?.odd || '-');
  setText('odd-draw', drawChoice?.odd || '-');
  setText('odd-away', awayChoice?.odd || '-');
}

function spanishStatus(status){
  const normalized = normalizeName(status);

  if(normalized.includes('not started')) return;
  if(normalized.includes('scheduled')) return 'Programado';
  if(normalized.includes('ended')) return 'Finalizado';
  if(normalized.includes('full')) return 'Finalizado';

  return status || 'Previa';
}

function renderMatchHeader(match){
  const home = match.home_team || 'Local';
  const away = match.away_team || 'Visitante';
  const date = match.date || '--/--/----';
  const time = match.time || '--:--';
  const tournament = match.tournament_name || 'Primera A, Apertura';
  const stadium = match.stadium || 'Estadio por confirmar';
  const status = spanishStatus(match.status);

  // Old IDs
  setText('match-title', `${home} vs ${away}`);
  setText('match-meta', `${date} · ${time} · ${tournament}`);
  setText('home-team', home);
  setText('away-team', away);

  // New IDs
  setText('nm-tournament', tournament);
  setText('nm-date', date);
  setText('nm-time', time);
  setText('nm-stadium', stadium);

  setText('match-time-main', time);
  setText('match-date-small', date);
  setText('match-status', status);

  setText('preview-title', `${home} recibe a ${away}`);
  setText('preview-text', `Previa del partido ${home} vs ${away} por ${tournament}.`);

  setText('info-stadium', stadium);
  setText('info-tournament', tournament);
  setText('info-date', `${date} · ${time}`);

  const nacionalIsAway = normalizeName(away).includes('atletico nacional');
  const nacionalIsHome = normalizeName(home).includes('atletico nacional');

  if(nacionalIsAway){
    setText('match-insight', `Atlético Nacional visita a ${home} en su próximo compromiso de Liga BetPlay.`);
  } else if(nacionalIsHome){
    setText('match-insight', `Atlético Nacional recibe a ${away} en su próximo compromiso de Liga BetPlay.`);
  } else {
    setText('match-insight', 'Próximo compromiso de Liga BetPlay.');
  }

  setLogo('home-logo', home);
  setLogo('away-logo', away);
  setLogo('odds-home-logo', home);
  setLogo('odds-away-logo', away);

  setLeagueLogo('league-logo', tournament);
  setLeagueLogo('hero-league-logo', tournament);
  setLeagueLogo('info-league-logo', tournament);
}

function initTabs(){
  const buttons = document.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll('[data-panel]');

  if(!buttons.length || !panels.length) return;

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;

      buttons.forEach(btn => btn.classList.remove('active'));
      panels.forEach(panel => panel.classList.remove('active'));

      button.classList.add('active');

      const panel = document.querySelector(`[data-panel="${target}"]`);
      if(panel){
        panel.classList.add('active');
      }
    });
  });
}

async function initNextMatch(){
  try{
    const data = await fetchJSON('/api/next-match/detail');

    const match = data.match || data.next_match || {};
    const odds = data.odds || data.main_odds_market || {};
    const nacionalLastXi = data.nacional_last_xi || data.last_lineup || data.nacional_last_lineup || [];

    renderMatchHeader(match);
    renderNacionalLineup(nacionalLastXi);
    renderOdds(odds);

    setText('formation-pill', getFormationFromPlayers(nacionalLastXi));
  } catch(err){
    console.error(err);

    setText('match-title', 'No se pudo cargar la previa.');
    setText('preview-title', 'No se pudo cargar la previa.');
    setText('preview-text', 'Revisá la consola o el endpoint /api/next-match/detail.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initNextMatch();
});