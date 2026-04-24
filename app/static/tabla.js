const TABLA_ENDPOINT = '/api/tabla';

const ESCUDOS = {
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

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('HTTP ' + res.status + ' al llamar ' + url);
  return res.json();
}

function getTeamBadge(teamName){
  return ESCUDOS[teamName] || null;
}

function formatDG(gf, ga){
  if(gf == null || ga == null) return '-';
  const d = gf - ga;
  if(d > 0) return '+' + d;
  return String(d);
}

function renderStats(row){
  const statsRow = document.getElementById('stats-row');
  if(!statsRow) return;

  if(!row){
    statsRow.style.display = 'none';
    return;
  }

  document.getElementById('s-pos').textContent = (row.position ?? '-') + '°';
  document.getElementById('s-pts').textContent = row.points ?? '-';
  document.getElementById('s-pj').textContent = row.played ?? '-';
  document.getElementById('s-dg').textContent = formatDG(row.goals_for, row.goals_against);

  statsRow.style.display = 'flex';
}

function renderTable(rows){
  const tableBody = document.getElementById('table-body');
  const updatedEl = document.getElementById('table-updated');
  const dateEl = document.getElementById('table-date');

  if(!tableBody) return;

  tableBody.innerHTML = '';

  if(!rows || !rows.length){
    tableBody.innerHTML = '<div class="state-msg">Sin tabla disponible.</div>';
    if(updatedEl) updatedEl.textContent = 'Sin datos';
    if(dateEl) dateEl.textContent = '';
    renderStats(null);
    return;
  }

  if(updatedEl){
    updatedEl.textContent = `${rows.length} equipos · actualizado a la fecha más reciente`;
  }

  if(dateEl){
    dateEl.textContent = '';
  }

  const nacional = rows.find(r =>
    r.team && r.team.toLowerCase().includes('atlético nacional')
  );

  renderStats(nacional || null);

  rows.forEach((row, i) => {
    const isNacional =
      row.team &&
      row.team.toLowerCase().includes('atlético nacional');

    const pos = row.position ?? (i + 1);
    const isTop3 = pos <= 3;

    let posBadgeClass = 'pos-badge';
    if(isNacional) posBadgeClass += ' nacional';
    else if(isTop3) posBadgeClass += ' top3';

    let zoneBorder = '';
    if(pos <= 4) zoneBorder = 'border-left:3px solid #00c26a;';
    else if(pos <= 8) zoneBorder = 'border-left:3px solid #2196f3;';
    else if(pos >= rows.length - 1) zoneBorder = 'border-left:3px solid #e74c3c;';
    else zoneBorder = 'border-left:3px solid transparent;';

    const dg = formatDG(row.goals_for, row.goals_against);
    const badgeUrl = getTeamBadge(row.team);

    const div = document.createElement('div');
    div.className = 'team-row' + (isNacional ? ' highlight' : '');
    div.style.cssText = zoneBorder;
    div.style.animationDelay = (i * 30) + 'ms';

    div.innerHTML = `
      <div class="${posBadgeClass}">${pos}</div>

      <div class="team-name-cell">
        ${
          badgeUrl
            ? `<img class="team-badge" src="${badgeUrl}" alt="${row.team}" onerror="this.style.display='none'">`
            : `<span class="team-badge-fallback">${String(row.team || '?').slice(0,2).toUpperCase()}</span>`
        }
        <span class="name${isNacional ? ' highlight-name' : ''}">${row.team}</span>
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

async function initTabla(){
  const tableBody = document.getElementById('table-body');
  const updatedEl = document.getElementById('table-updated');

  if(!tableBody) return;

  try{
    const data = await fetchJSON(TABLA_ENDPOINT);
    renderTable(data.table || []);
  } catch(e){
    console.error('Error cargando tabla:', e);
    tableBody.innerHTML =
      '<div class="state-msg">Error al cargar la tabla. Revisá la consola.</div>';

    if(updatedEl) updatedEl.textContent = 'Error de conexión';
  }
}

document.addEventListener('DOMContentLoaded', initTabla);