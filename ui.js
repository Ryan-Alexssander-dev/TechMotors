// ===================== NAVEGAÇÃO =====================
function showPage(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  document.getElementById('page-' + p).classList.add('active');

  // Ativa o botão correto
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const map = {
      recebimento: 'recebimento',
      mecanica: 'mecânica',
      usinagem: 'usinagem',
      eletrica: 'elétrica',
      painel: 'painel'
    };
    if (btn.textContent.toLowerCase().includes(map[p])) {
      btn.classList.add('active');
    }
  });

  if (p === 'painel') renderPainel();
}

// ===================== ALERTAS =====================
function showAlert(setor, msg, type) {
  const el = document.getElementById('alert-' + setor);
  if (!el) return;
  if (!msg) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  if (type === 'success') setTimeout(() => el.innerHTML = '', 4000);
}

// ===================== CAMPOS DE INSPEÇÃO =====================
function buildFields(setor) {
  const container = document.getElementById(setor + '-fields');
  container.innerHTML = '';

  CAMPOS[setor].forEach((campo, i) => {
    container.innerHTML += `
      <div class="insp-field">
        <div class="insp-field-name">${campo}</div>
        <div class="status-btns">
          <button class="status-btn" id="btn-ok-${setor}-${i}"      onclick="setStatus('${setor}', ${i}, 'OK')">✓ OK</button>
          <button class="status-btn" id="btn-defeito-${setor}-${i}" onclick="setStatus('${setor}', ${i}, 'Defeito')">✗ Com Defeito</button>
          <button class="status-btn" id="btn-na-${setor}-${i}"      onclick="setStatus('${setor}', ${i}, 'N/A')">— N/A</button>
        </div>
        <textarea class="insp-obs" id="obs-${setor}-${i}" placeholder="Observação sobre este item..."></textarea>
      </div>
    `;
  });
}

// ===================== STATUS DOS BOTÕES =====================
function setStatus(setor, idx, val) {
  statusState[setor][idx] = val;

  const map = { 'OK': 'ok', 'Defeito': 'defeito', 'N/A': 'na' };

  ['OK', 'Defeito', 'N/A'].forEach(s => {
    const btnKey = s === 'OK' ? 'ok' : s === 'Defeito' ? 'defeito' : 'na';
    const btn = document.getElementById(`btn-${btnKey}-${setor}-${idx}`);
    if (btn) {
      btn.className = 'status-btn' + (s === val ? ' selected-' + map[s] : '');
    }
  });
}

// ===================== PAINEL =====================
function renderPainel() {
  const busca = (document.getElementById('painel-busca').value || '').toLowerCase();
  const data = getData().filter(m =>
    !busca ||
    m.os.toLowerCase().includes(busca) ||
    m.nome.toLowerCase().includes(busca) ||
    m.modelo.toLowerCase().includes(busca)
  );

  const tbody = document.getElementById('painel-body');

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:var(--muted); padding:2rem;">
          Nenhuma OS encontrada.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.slice().reverse().map(m => `
    <tr>
      <td>
        <span style="font-family:'IBM Plex Mono',monospace; font-weight:600; color:var(--accent)">
          ${m.os}
        </span>
      </td>
      <td>
        ${m.nome}<br>
        <span style="color:var(--muted); font-size:0.75rem">${m.celular}</span>
      </td>
      <td>
        ${m.modelo}<br>
        <span style="color:var(--muted); font-size:0.75rem">${m.serie || '—'}</span>
      </td>
      <td><span class="timestamp">${m.timestamp_recebimento}</span></td>
      <td>${statusBadge(m.mecanica)}</td>
      <td>${statusBadge(m.usinagem)}</td>
      <td>${statusBadge(m.eletrica)}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="abrirModal('${m.os}')">Ver</button>
      </td>
    </tr>
  `).join('');
}

function statusBadge(setor) {
  if (!setor) return `<span class="badge badge-nao">Pendente</span>`;

  const temDefeito = setor.campos.some(c => c.status === 'Defeito');
  const todosPreenchidos = setor.campos.every(c => c.status && c.status !== '—');

  if (temDefeito)       return `<span class="badge badge-pendente">Com Defeito</span>`;
  if (todosPreenchidos) return `<span class="badge badge-ok">Concluído</span>`;
  return `<span class="badge badge-pendente">Em andamento</span>`;
}

// ===================== MODAL =====================
function abrirModal(os) {
  const data = getData();
  const m = data.find(x => x.os === os);
  if (!m) return;

  const setorHTML = (nome, cor, dados) => {
    if (!dados) return `
      <div class="detail-section">
        <div class="detail-section-title" style="border-color:${cor}">${nome}</div>
        <p style="color:var(--muted); font-size:0.85rem;">Inspeção ainda não realizada.</p>
      </div>`;

    return `
      <div class="detail-section">
        <div class="detail-section-title" style="border-color:${cor}">
          ${nome} · <span class="timestamp">${dados.timestamp}</span>
        </div>
        <div class="detail-insp">
          ${dados.campos.map(c => `
            <div class="detail-insp-row">
              <div class="detail-insp-name">${c.nome}</div>
              <div class="detail-insp-right">
                ${badgeStatus(c.status)}
                ${c.obs ? `<div class="detail-insp-obs">${c.obs}</div>` : ''}
              </div>
            </div>
          `).join('')}
          ${dados.obs_geral ? `
            <div style="margin-top:0.5rem; padding:0.75rem; background:var(--surface2);
                        border-radius:4px; font-size:0.82rem; color:var(--muted)">
              <strong style="color:var(--text)">Obs. gerais:</strong> ${dados.obs_geral}
            </div>` : ''}
        </div>
      </div>`;
  };

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-title">
      <span style="color:var(--accent); font-family:'IBM Plex Mono',monospace">${m.os}</span>
      — ${m.nome}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Dados do Cliente e Motor</div>
      <div class="detail-grid">
        <div class="detail-item"><label>Cliente</label><span>${m.nome}</span></div>
        <div class="detail-item"><label>Celular</label><span>${m.celular}</span></div>
        <div class="detail-item"><label>Modelo</label><span>${m.modelo}</span></div>
        <div class="detail-item"><label>Nº de Série</label><span>${m.serie || '—'}</span></div>
        <div class="detail-item" style="grid-column:1/-1">
          <label>Entrada</label>
          <span class="timestamp">${m.timestamp_recebimento}</span>
        </div>
        ${m.obs ? `
          <div class="detail-item" style="grid-column:1/-1">
            <label>Observações de entrada</label><span>${m.obs}</span>
          </div>` : ''}
      </div>
    </div>

    ${setorHTML('Mecânica',           'var(--mecanica)', m.mecanica)}
    ${setorHTML('Usinagem — Rotor',   'var(--usinagem)', m.usinagem)}
    ${setorHTML('Elétrica',           'var(--eletrica)', m.eletrica)}
  `;

  document.getElementById('modal-overlay').classList.add('open');
}

function badgeStatus(status) {
  if (status === 'OK')      return `<span class="badge badge-ok">OK</span>`;
  if (status === 'Defeito') return `<span class="badge" style="background:rgba(231,76,60,0.15);color:var(--defeito)">Defeito</span>`;
  if (status === 'N/A')     return `<span class="badge badge-nao">N/A</span>`;
  return `<span class="badge badge-nao">—</span>`;
}

function fecharModal(e) {
  if (!e || e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.remove('open');
  }
}
