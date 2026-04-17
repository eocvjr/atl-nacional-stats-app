const TABLA_ENDPOINT = '/api/tabla';

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('HTTP ' + res.status + ' al llamar ' + url);
  return res.json();
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

  const posEl = document.getElementById('s-pos');
  const ptsEl = document.getElementById('s-pts');
  const pjEl = document.getElementById('s-pj');
  const dgEl = document.getElementById('s-dg');

  if (posEl) posEl.textContent = (row.position ?? '-') + '°';
  if (ptsEl) ptsEl.textContent = row.points ?? '-';
  if (pjEl) pjEl.textContent = row.played ?? '-';
  if (dgEl) dgEl.textContent = formatDG(row.goals_for, row.goals_against);

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
    if (updatedEl) updatedEl.textContent = 'Sin datos';
    if (dateEl) dateEl.textContent = '';
    renderStats(null);
    return;
  }

  if (updatedEl) {
    updatedEl.textContent = `${rows.length} equipos · actualizado a la fecha más reciente`;
  }

  if (dateEl) {
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

    const div = document.createElement('div');
    div.className = 'team-row' + (isNacional ? ' highlight' : '');
    div.style.cssText = zoneBorder;
    div.style.animationDelay = (i * 30) + 'ms';

    div.innerHTML = `
      <div class="${posBadgeClass}">${pos}</div>

      <div class="team-name-cell">
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

  try {
    const data = await fetchJSON(TABLA_ENDPOINT);
    renderTable(data.table || []);
  } catch(e) {
    console.error('Error cargando tabla:', e);
    tableBody.innerHTML =
      '<div class="state-msg">Error al cargar la tabla. Revisá la consola.</div>';

    if (updatedEl) updatedEl.textContent = 'Error de conexión';
  }
}

document.addEventListener('DOMContentLoaded', initTabla);