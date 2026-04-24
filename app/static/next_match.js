async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function renderNacionalLineup(players){
  const container = document.getElementById('nacional-lineup');
  container.innerHTML = '';

  if(!players || !players.length){
    container.innerHTML = `
      <div class="muted">
        No hay última alineación disponible en la base de datos.
      </div>
    `;
    return;
  }

  players.forEach(player => {
    const row = document.createElement('div');
    row.className = 'player-row';

    row.innerHTML = `
      <div class="player-main">
        <div class="player-name">${player.player_name || player.name || 'Jugador'}</div>
        <div class="player-pos">${player.position || ''}</div>
      </div>
      <div class="rating">${player.rating ?? ''}</div>
    `;

    container.appendChild(row);
  });
}

function renderOdds(odds){
  const container = document.getElementById('odds');
  container.innerHTML = '';

  const choices = odds?.choices || [];

  if(!choices.length){
    container.innerHTML = '<div class="muted">No hay cuotas disponibles todavía.</div>';
    return;
  }

  choices.forEach(choice => {
    const div = document.createElement('div');
    div.className = 'odd';

    div.innerHTML = `
      <div>
        <div class="odd-label">${choice.name || '-'}</div>
      </div>
      <div class="odd-value">${choice.odd || '-'}</div>
    `;

    container.appendChild(div);
  });
}

async function initNextMatch(){
  try {
    const data = await fetchJSON('/api/next-match/detail');

    const match = data.match || {};
    const odds = data.odds || {};
    const nacionalLastXi = data.nacional_last_xi || [];

    document.getElementById('match-title').textContent =
      `${match.home_team || '-'} vs ${match.away_team || '-'}`;

    document.getElementById('match-meta').textContent =
      `${match.date || '--/--/----'} · ${match.time || '--:--'} · ${match.tournament_name || ''}`;

    document.getElementById('home-team').textContent = match.home_team || '-';
    document.getElementById('away-team').textContent = match.away_team || '-';

    renderNacionalLineup(nacionalLastXi);
    renderOdds(odds);
  } catch (err) {
    console.error(err);
    document.getElementById('match-title').textContent = 'No se pudo cargar la previa.';
  }
}

document.addEventListener('DOMContentLoaded', initNextMatch);