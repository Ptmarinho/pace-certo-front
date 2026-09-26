import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RouteIcon from '@mui/icons-material/Route';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import TodayIcon from '@mui/icons-material/Today';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CarregandoConteudo from '../components/CarregandoConteudo';
import DistribuicaoTiposChart from '../components/DistribuicaoTiposChart';
import EvolucaoPaceChart from '../components/EvolucaoPaceChart';
import MetaSemanalCard from '../components/MetaSemanalCard';
import StatCard from '../components/StatCard';
import VolumeSemanalChart from '../components/VolumeSemanalChart';
import { useFeedback } from '../context/FeedbackContext';
import { api } from '../services/api';
import { TIPOS_TREINO } from '../utils/constantes';
import { formatarData, formatarDiaSemana, formatarKm } from '../utils/formatadores';

function SemDados({ texto }) {
  return (
    <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
      {texto}
    </Typography>
  );
}

function ProximoTreinoCard({ treino, onVerHorario }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <CalendarMonthIcon />
          </Avatar>
        }
        title="Próximo treino"
      />
      <CardContent sx={{ pt: 0 }}>
        {treino ? (
          <Stack spacing={1}>
            <Typography variant="h6">
              {TIPOS_TREINO[treino.tipo].rotulo} · {formatarKm(treino.distancia_km)}
            </Typography>
            <Typography color="text.secondary">
              {formatarDiaSemana(treino.data)}
              {treino.horario && ` às ${treino.horario.slice(0, 5)}`}
            </Typography>
            <Typography color="text.secondary">
              📍 {treino.local.nome} — {treino.local.cidade}
            </Typography>
            <Button variant="outlined" startIcon={<WbSunnyIcon />} onClick={() => onVerHorario(treino)}>
              Ver melhor horário
            </Button>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            Nenhum treino planejado.{' '}
            <Link component={RouterLink} to="/planejar">
              Planeje o próximo!
            </Link>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const feedback = useFeedback();
  const navegar = useNavigate();
  const [estatisticas, setEstatisticas] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      setEstatisticas(await api.obterEstatisticas(8));
      setErro('');
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarMeta(km) {
    await api.atualizarMeta(km);
    feedback.sucesso('Meta semanal atualizada!');
    carregar();
  }

  if (erro) {
    return (
      <Alert severity="error" action={<Button onClick={carregar}>Tentar de novo</Button>}>
        {erro}
      </Alert>
    );
  }
  if (!estatisticas) return <CarregandoConteudo />;

  const { totais, semana_atual: semana, volume_semanal, evolucao_pace, recordes, por_tipo, proximo_treino } = estatisticas;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5">Olá, corredor! 👟</Typography>
        <Typography color="text.secondary">Acompanhe sua evolução e planeje o próximo treino.</Typography>
      </Box>

      {totais.treinos_realizados === 0 && (
        <Alert severity="info">
          Você ainda não registrou treinos. Cadastre um <Link component={RouterLink} to="/locais">local</Link> e
          registre seu primeiro <Link component={RouterLink} to="/treinos">treino</Link>.
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
        <StatCard titulo="Km na semana" valor={formatarKm(semana.km)} detalhe={`${semana.treinos} treino(s)`} icone={<TodayIcon />} />
        <StatCard
          titulo="Km total"
          valor={formatarKm(totais.km_total)}
          detalhe={`${totais.treinos_realizados} treinos realizados`}
          icone={<RouteIcon />}
          cor="secondary.main"
        />
        <StatCard
          titulo="Pace médio"
          valor={totais.pace_medio_formatado ? `${totais.pace_medio_formatado} /km` : '—'}
          detalhe="Todos os treinos realizados"
          icone={<SpeedIcon />}
          cor="#7b1fa2"
        />
        <StatCard
          titulo="Tempo correndo"
          valor={totais.tempo_total_formatado ?? '—'}
          detalhe="h:mm:ss"
          icone={<TimerIcon />}
          cor="#00897b"
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
        <MetaSemanalCard semana={semana} onSalvarMeta={salvarMeta} />
        <ProximoTreinoCard
          treino={proximo_treino}
          onVerHorario={(treino) => navegar(`/planejar?local=${treino.local_id}&data=${treino.data}`)}
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card>
          <CardHeader title="Volume semanal" subheader="Km realizados nas últimas 8 semanas (verde = meta batida)" />
          <CardContent>
            <VolumeSemanalChart dados={volume_semanal} metaKm={semana.meta_km} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Evolução do pace" subheader="Quanto mais alto no gráfico, mais rápido" />
          <CardContent>
            {evolucao_pace.length ? <EvolucaoPaceChart dados={evolucao_pace} /> : <SemDados texto="Sem treinos realizados ainda." />}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card>
          <CardHeader title="Recordes pessoais" />
          <CardContent sx={{ pt: 0 }}>
            {recordes.length ? (
              <List dense>
                {recordes.map((recorde) => (
                  <ListItem key={recorde.titulo} disableGutters>
                    <ListItemIcon>
                      <EmojiEventsIcon sx={{ color: '#f9a825' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={recorde.titulo}
                      secondary={`${recorde.valor} · ${formatarData(recorde.data)}`}
                      slotProps={{ primary: { fontWeight: 600 } }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <SemDados texto="Seus recordes aparecerão aqui." />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Km por tipo de treino" />
          <CardContent sx={{ pt: 0 }}>
            {por_tipo.length ? <DistribuicaoTiposChart dados={por_tipo} /> : <SemDados texto="Sem treinos realizados ainda." />}
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
