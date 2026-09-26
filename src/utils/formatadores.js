/** 5.5 -> "5:30" */
export function formatarPace(pace) {
  if (pace === null || pace === undefined || Number.isNaN(pace)) return '—';
  const total = Math.round(pace * 60);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** 65.5 -> "1:05:30" · 45.25 -> "45:15" */
export function formatarDuracao(minutos) {
  if (!minutos) return '—';
  const total = Math.round(minutos * 60);
  const horas = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const segs = String(total % 60).padStart(2, '0');
  return horas ? `${horas}:${String(mins).padStart(2, '0')}:${segs}` : `${mins}:${segs}`;
}

/** "45:30" -> 45.5 · "1:05:00" -> 65 · "40" -> 40 · inválido -> null */
export function interpretarDuracao(texto) {
  const partes = String(texto).trim().split(':').map(Number);
  if (partes.some((n) => Number.isNaN(n) || n < 0)) return null;

  let minutos = null;
  if (partes.length === 1) minutos = partes[0];
  if (partes.length === 2 && partes[1] < 60) minutos = partes[0] + partes[1] / 60;
  if (partes.length === 3 && partes[1] < 60 && partes[2] < 60) {
    minutos = partes[0] * 60 + partes[1] + partes[2] / 60;
  }
  return minutos ? Math.round(minutos * 100) / 100 : null;
}

export function formatarKm(km) {
  return `${Number(km).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
}

/** "2026-09-26" -> "26/09/2026" */
export function formatarData(iso) {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** "2026-09-26" -> "26/09" */
export function formatarDataCurta(iso) {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

/** "2026-09-26" -> "sáb., 26/09" */
export function formatarDiaSemana(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

/** Data local no formato AAAA-MM-DD, deslocada em N dias a partir de hoje. */
export function dataISO(deslocamentoDias = 0) {
  const data = new Date();
  data.setDate(data.getDate() + deslocamentoDias);
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}
