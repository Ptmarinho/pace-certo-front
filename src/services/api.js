// Comunicação com a API Pace Certo (componente secundário).
// Todas as chamadas à Open-Meteo passam pela API: o front nunca acessa o serviço externo.

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function extrairMensagemErro(dados, status) {
  const detalhe = dados?.detail;
  if (typeof detalhe === 'string') return detalhe;
  if (Array.isArray(detalhe)) {
    return detalhe.map((erro) => String(erro.msg).replace(/^Value error, /, '')).join(' • ');
  }
  return `Erro ${status} ao comunicar com a API.`;
}

async function requisitar(caminho, { metodo = 'GET', corpo, parametros } = {}) {
  const url = new URL(`${API_URL}${caminho}`);
  Object.entries(parametros ?? {}).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(chave, valor);
  });

  let resposta;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error(`Não foi possível conectar à API (${API_URL}). Verifique se ela está em execução.`);
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new Error(extrairMensagemErro(dados, resposta.status));
  return dados;
}

export const api = {
  // Treinos
  listarTreinos: (parametros) => requisitar('/treinos', { parametros }),
  criarTreino: (treino) => requisitar('/treinos', { metodo: 'POST', corpo: treino }),
  atualizarTreino: (id, treino) => requisitar(`/treinos/${id}`, { metodo: 'PUT', corpo: treino }),
  excluirTreino: (id) => requisitar(`/treinos/${id}`, { metodo: 'DELETE' }),

  // Locais
  listarLocais: (parametros) => requisitar('/locais', { parametros }),
  criarLocal: (local) => requisitar('/locais', { metodo: 'POST', corpo: local }),
  atualizarLocal: (id, local) => requisitar(`/locais/${id}`, { metodo: 'PUT', corpo: local }),
  excluirLocal: (id) => requisitar(`/locais/${id}`, { metodo: 'DELETE' }),
  buscarCidades: (nome) => requisitar('/locais/buscar-cidade', { parametros: { nome } }),
  melhorHorario: (id, parametros) => requisitar(`/locais/${id}/melhor-horario`, { parametros }),

  // Meta e estatísticas
  obterMeta: () => requisitar('/meta'),
  atualizarMeta: (kmSemanal) => requisitar('/meta', { metodo: 'PUT', corpo: { km_semanal: kmSemanal } }),
  obterEstatisticas: (semanas = 8) => requisitar('/estatisticas', { parametros: { semanas } }),
};
