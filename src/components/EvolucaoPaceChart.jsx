import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TIPOS_TREINO } from '../utils/constantes';
import { formatarDataCurta, formatarPace } from '../utils/formatadores';

export default function EvolucaoPaceChart({ dados }) {
  const pontos = dados.map((ponto) => ({ ...ponto, rotulo: formatarDataCurta(ponto.data) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={pontos} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="rotulo" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
        {/* Eixo invertido: pace menor (mais rápido) aparece mais alto. */}
        <YAxis
          reversed
          domain={['dataMin - 0.2', 'dataMax + 0.2']}
          tickFormatter={formatarPace}
          tick={{ fontSize: 12 }}
          width={60}
        />
        <Tooltip
          formatter={(valor, _nome, item) => [
            `${formatarPace(valor)} /km · ${item.payload.distancia_km} km (${TIPOS_TREINO[item.payload.tipo].rotulo})`,
            'Pace',
          ]}
        />
        <Line type="monotone" dataKey="pace_min_km" stroke="#ff5722" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
