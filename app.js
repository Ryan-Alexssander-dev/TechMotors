// ===================== ESTADO DOS STATUS DE INSPEÇÃO =====================
const statusState = {
  mecanica: {},
  usinagem: {},
  eletrica: {}
};

// ===================== RECEBIMENTO =====================
let osAtual = null;

function registrarOS() {
  const nome    = document.getElementById('r-nome').value.trim();
  const celular = document.getElementById('r-celular').value.trim();
  const modelo  = document.getElementById('r-modelo').value.trim();
  const serie   = document.getElementById('r-serie').value.trim();
  const obs     = document.getElementById('r-obs').value.trim();

  if (!nome || !celular || !modelo) {
    showAlert('recebimento', 'Preencha ao menos nome, celular e modelo do motor.', 'error');
    return;
  }

  const os = getNextOS();
  const registro = {
    os,
    nome,
    celular,
    modelo,
    serie,
    obs,
    timestamp_recebimento: getTimestamp(),
    mecanica: null,
    usinagem: null,
    eletrica: null
  };

  const data = getData();
  data.push(registro);
  saveData(data);
  osAtual = os;

  // Exibe OS gerada
  document.getElementById('os-numero-display').textContent = os;
  document.getElementById('os-timestamp').textContent = registro.timestamp_recebimento;
  document.getElementById('os-gerada').style.display = 'block';

  // Gera QR Code
  document.getElementById('qrcode').innerHTML = '';
  const url = window.location.href.split('?')[0] + '?os=' + os + '&setor=mecanica';
  new QRCode(document.getElementById('qrcode'), {
    text: url,
    width: 160,
    height: 160,
    colorDark: '#e8eaf0',
    colorLight: '#181c27'
  });

  showAlert('recebimento', `OS ${os} registrada com sucesso!`, 'success');
}

function novaOS() {
  ['r-nome', 'r-celular', 'r-modelo', 'r-serie', 'r-obs'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('os-gerada').style.display = 'none';
  document.getElementById('alert-recebimento').innerHTML = '';
  osAtual = null;
}

function imprimirEtiqueta() {
  if (!osAtual) return;

  const data = getData();
  const m = data.find(x => x.os === osAtual);
  if (!m) return;

  document.getElementById('print-area').innerHTML = `
    <div class="etiqueta">
      <div class="etiqueta-label">Tech Motors — Ordem de Serviço</div>
      <div class="etiqueta-os">${m.os}</div>
      <div id="qr-print"></div>
      <div class="etiqueta-info"><span class="etiqueta-label">Cliente: </span>${m.nome}</div>
      <div class="etiqueta-info"><span class="etiqueta-label">Motor: </span>${m.modelo}</div>
      <div class="etiqueta-info"><span class="etiqueta-label">Série: </span>${m.serie || '—'}</div>
      <div class="etiqueta-info"><span class="etiqueta-label">Entrada: </span>${m.timestamp_recebimento}</div>
    </div>
  `;

  const url = window.location.href.split('?')[0] + '?os=' + m.os + '&setor=mecanica';
  new QRCode(document.getElementById('qr-print'), {
    text: url,
    width: 80,
    height: 80
  });

  setTimeout(() => window.print(), 400);
}

// ===================== SETORES =====================
function buscarOS(setor) {
  const input = document.getElementById(setor + '-os-input').value.trim().toUpperCase();
  const data  = getData();
  const m     = data.find(x => x.os === input);

  if (!m) {
    showAlert(setor, `OS "${input}" não encontrada. Verifique o número.`, 'error');
    document.getElementById(setor + '-form').style.display = 'none';
    return;
  }

  // Exibe info da OS
  document.getElementById(setor + '-os-display').textContent = m.os;
  document.getElementById(setor + '-cliente-info').innerHTML =
    `<strong>${m.nome}</strong> · ${m.modelo}`;
  document.getElementById(setor + '-form').style.display = 'block';

  // Constrói campos e limpa estado
  buildFields(setor);
  statusState[setor] = {};

  // Preenche dados já salvos (se houver)
  if (m[setor]) {
    m[setor].campos.forEach((c, i) => {
      setStatus(setor, i, c.status);
      const obsEl = document.getElementById(`obs-${setor}-${i}`);
      if (obsEl) obsEl.value = c.obs || '';
    });
    document.getElementById(setor + '-obs').value = m[setor].obs_geral || '';
  }

  showAlert(setor, '', '');
}

function salvarSetor(setor) {
  const input = document.getElementById(setor + '-os-input').value.trim().toUpperCase();
  const data  = getData();
  const idx   = data.findIndex(x => x.os === input);
  if (idx === -1) return;

  const campos = CAMPOS[setor].map((nome, i) => ({
    nome,
    status: statusState[setor][i] || '—',
    obs: (document.getElementById(`obs-${setor}-${i}`) || {}).value || ''
  }));

  data[idx][setor] = {
    campos,
    obs_geral: document.getElementById(setor + '-obs').value,
    timestamp: getTimestamp()
  };

  saveData(data);
  showAlert(setor, `Inspeção salva com sucesso em ${data[idx][setor].timestamp}`, 'success');
}

// ===================== REDIRECIONAMENTO POR QR CODE =====================
(function () {
  const params = new URLSearchParams(window.location.search);
  const os     = params.get('os');
  const setor  = params.get('setor');

  if (os && setor && ['mecanica', 'usinagem', 'eletrica'].includes(setor)) {
    showPage(setor);
    setTimeout(() => {
      const input = document.getElementById(setor + '-os-input');
      if (input) {
        input.value = os.toUpperCase();
        buscarOS(setor);
      }
    }, 100);
  }
})();
