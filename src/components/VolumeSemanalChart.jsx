import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatarDataCurta } from '../utils/formatadores';

export default function VolumeSemanalChart({ dados, metaKm }) {
  const pontos = dados.map((semana) => ({ ...semana, rotulo: formatarDataCurta(semana.semana_inicio) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={pontos} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="rotulo" tick={{ fontSize: 12 }} />
        <YAxis unit=" km" tick={{ fontSize: 12 }} width={60} />
        <Tooltip
          formatter={(valor, _nome, item) => [`${valor} km em ${item.payload.treinos} treino(s)`, 'Volume']}
          labelFormatter={(rotulo) => `Semana de ${rotulo}`}
        />
        <ReferenceLine
          y={metaKm}
          stroke="#1e88e5"
          strokeDasharray="6 4"
          label={{ value: `Meta ${metaKm} km`, position: 'insideTopRight', fill: '#1e88e5', fontSize: 12 }}
        />
        <Bar dataKey="km" radius={[6, 6, 0, 0]}>
          {pontos.map((semana) => (
            <Cell key={semana.semana_inicio} fill={semana.km >= metaKm ? '#43a047' : '#ff7043'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
