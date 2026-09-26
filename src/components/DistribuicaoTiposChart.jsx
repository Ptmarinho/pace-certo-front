import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TIPOS_TREINO } from '../utils/constantes';

export default function DistribuicaoTiposChart({ dados }) {
  const pontos = dados.map((item) => ({ ...item, rotulo: TIPOS_TREINO[item.tipo].rotulo }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={pontos} dataKey="km" nameKey="rotulo" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {pontos.map((item) => (
            <Cell key={item.tipo} fill={TIPOS_TREINO[item.tipo].cor} />
          ))}
        </Pie>
        <Tooltip formatter={(valor, nome, item) => [`${valor} km · ${item.payload.quantidade} treino(s)`, nome]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
