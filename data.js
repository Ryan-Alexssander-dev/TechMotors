// ===================== CAMPOS DE INSPEÇÃO =====================
const CAMPOS = {
  mecanica: [
    'Tampa Dianteira',
    'Tampa Traseira',
    'Sistema de Ventilação',
    'Vedação',
    'Rolamento'
  ],
  usinagem: [
    'Metrologia dos Colos do Eixo',
    'Metrologia do Assento da Polia/Acoplamento',
    'Teste de Batimento Radial',
    'Inspeção Visual do Rotor',
    'Anéis Coletores / Comutador (Se houver)'
  ],
  eletrica: [
    'Inspeção Visual do Bobinado',
    'Inspeção do Núcleo Estatórico',
    'Megonagem (Resistência de Isolamento)',
    'Resistência Ôhmica',
    'Inspeção de Sensores'
  ]
};

// ===================== BANCO DE DADOS (localStorage) =====================
function getData() {
  try {
    return JSON.parse(localStorage.getItem('techMotors_data') || '[]');
  } catch (e) {
    return [];
  }
}

function saveData(data) {
  localStorage.setItem('techMotors_data', JSON.stringify(data));
}

function getNextOS() {
  const data = getData();
  const nums = data
    .map(m => parseInt(m.os.replace('OS-', '')))
    .filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return 'OS-' + String(next).padStart(4, '0');
}

function getTimestamp() {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
