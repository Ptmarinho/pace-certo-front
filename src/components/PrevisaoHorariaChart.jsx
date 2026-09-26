import { Paper, Typography } from '@mui/material';
import { Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CLASSIFICACOES } from '../utils/constantes';

const arredondar = (valor) => (valor === null || valor === undefined ? '—' : Math.round(valor));

function estaNaJanela(hora, janela) {
  return Boolean(janela) && hora >= janela.inicio && hora < janela.fim;
}

function TooltipHora({ active, payload }) {
  if (!active || !payload?.length) return null;
  const hora = payload[0].payload;
  const classificacao = CLASSIFICACOES[hora.classificacao];

  return (
    <Paper elevation={3} sx={{ p: 1.5, maxWidth: 280 }}>
      <Typography fontWeight={700}>
        {hora.hora} · <span style={{ color: classificacao.cor }}>{classificacao.rotulo} ({hora.score}/100)</span>
      </Typography>
      <Typography variant="body2">
        🌡️ {arredondar(hora.temperatura)} °C (sensação {arredondar(hora.sensacao_termica)} °C)
      </Typography>
      <Typography variant="body2">
        🌧️ {arredondar(hora.prob_chuva)}% · ☀️ UV {arredondar(hora.uv)} · 💨 {arredondar(hora.vento_kmh)} km/h
      </Typography>
      {hora.aqi !== null && <Typography variant="body2">🏭 Qualidade do ar: AQI {arredondar(hora.aqi)}</Typography>}
      {hora.motivos.length > 0 && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          {hora.motivos.join(' · ')}
        </Typography>
      )}
      {hora.passou && (
        <Typography variant="caption" color="text.secondary" display="block">
          Este horário já passou.
        </Typography>
      )}
    </Paper>
  );
}

export default function PrevisaoHorariaChart({ horas, janela }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={horas} margin={{ top: 10, right: 0, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="hora" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="nota" domain={[0, 100]} tick={{ fontSize: 12 }} />
        <YAxis yAxisId="temperatura" orientation="right" unit="°" tick={{ fontSize: 12 }} />
        <Tooltip content={<TooltipHora />} />
        <Legend />
        <Bar yAxisId="nota" dataKey="score" name="Nota para correr" fill="#7cb342" radius={[4, 4, 0, 0]}>
          {horas.map((hora) => {
            const naJanela = estaNaJanela(hora.hora, janela);
            return (
              <Cell
                key={hora.hora}
                fill={CLASSIFICACOES[hora.classificacao].cor}
                fillOpacity={hora.passou ? 0.25 : naJanela ? 1 : 0.65}
                stroke={naJanela ? '#1b5e20' : 'none'}
                strokeWidth={naJanela ? 2 : 0}
              />
            );
          })}
        </Bar>
        <Line
          yAxisId="temperatura"
          type="monotone"
          dataKey="sensacao_termica"
          name="Sensação térmica (°C)"
          stroke="#e53935"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="nota"
          type="monotone"
          dataKey="prob_chuva"
          name="Chance de chuva (%)"
          stroke="#1e88e5"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
