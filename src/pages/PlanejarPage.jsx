import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Link,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CarregandoConteudo from '../components/CarregandoConteudo';
import PrevisaoHorariaChart from '../components/PrevisaoHorariaChart';
import TreinoFormDialog from '../components/TreinoFormDialog';
import { useFeedback } from '../context/FeedbackContext';
import { api } from '../services/api';
import { CLASSIFICACOES } from '../utils/constantes';
import { dataISO, formatarDiaSemana } from '../utils/formatadores';

const DIAS_PREVISAO = 8;
const OPCOES_DURACAO = [1, 2, 3];

const arredondar = (valor) => (valor === null || valor === undefined ? '—' : Math.round(valor));

function rotuloDia(iso, indice) {
  if (indice === 0) return 'Hoje';
  if (indice === 1) return 'Amanhã';
  return formatarDiaSemana(iso);
}

function TabelaHoras({ horas }) {
  return (
    <TableContainer>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell>Hora</TableCell>
            <TableCell>Nota</TableCell>
            <TableCell>Sensação</TableCell>
            <TableCell>Chuva</TableCell>
            <TableCell>UV</TableCell>
            <TableCell>Vento</TableCell>
            <TableCell>AQI</TableCell>
            <TableCell>Observações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {horas.map((hora) => (
            <TableRow key={hora.hora} sx={{ opacity: hora.passou ? 0.45 : 1 }}>
              <TableCell>{hora.hora}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={`${hora.score} · ${CLASSIFICACOES[hora.classificacao].rotulo}`}
                  sx={{ bgcolor: CLASSIFICACOES[hora.classificacao].cor, color: '#fff', fontWeight: 600 }}
                />
              </TableCell>
              <TableCell>{arredondar(hora.sensacao_termica)} °C</TableCell>
              <TableCell>{arredondar(hora.prob_chuva)}%</TableCell>
              <TableCell>{arredondar(hora.uv)}</TableCell>
              <TableCell>{arredondar(hora.vento_kmh)} km/h</TableCell>
              <TableCell>{arredondar(hora.aqi)}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                {hora.passou ? 'Já passou' : hora.motivos.join(' · ') || 'Condições ótimas'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ResultadoPrevisao({ previsao, onAgendar }) {
  const { janela_ideal: janela, alertas, horas, resumo } = previsao;
  const classificacao = janela ? CLASSIFICACOES[janela.classificacao] : null;

  return (
    <Stack spacing={2}>
      <Card sx={{ borderLeft: 6, borderLeftColor: classificacao?.cor ?? 'grey.400' }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ md: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                Melhor janela · {previsao.local.nome} · {formatarDiaSemana(previsao.data)}
              </Typography>
              <Typography variant="h4">{janela ? `${janela.inicio} – ${janela.fim}` : 'Sem horários disponíveis'}</Typography>
              {janela && (
                <Chip
                  label={`${classificacao.rotulo} · nota ${janela.score_medio}/100`}
                  sx={{ bgcolor: classificacao.cor, color: '#fff', fontWeight: 700, mt: 1 }}
                />
              )}
              <Typography sx={{ mt: 1.5 }} color="text.secondary">
                {resumo}
              </Typography>
            </Box>
            {janela && (
              <Button variant="contained" size="large" startIcon={<EventAvailableIcon />} onClick={onAgendar} sx={{ flexShrink: 0 }}>
                Agendar treino às {janela.inicio}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {alertas.map((alerta) => (
        <Alert key={alerta.inicio} severity="warning" icon={<WarningAmberIcon />}>
          Evite correr das <strong>{alerta.inicio} às {alerta.fim}</strong>: {alerta.motivo.toLowerCase()}.
        </Alert>
      ))}

      <Card>
        <CardHeader
          title="Condições hora a hora"
          subheader="Barras: nota para correr (a janela ideal tem contorno) · Linhas: sensação térmica e chance de chuva"
        />
        <CardContent>
          <PrevisaoHorariaChart horas={horas} janela={janela} />
        </CardContent>
      </Card>

      <Accordion disableGutters elevation={0} sx={{ border: '1px solid #e6e8ef', borderRadius: 3, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Detalhes por hora</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TabelaHoras horas={horas} />
        </AccordionDetails>
      </Accordion>

      <Typography variant="caption" color="text.secondary">
        Fonte: {previsao.fonte}
        {!previsao.qualidade_ar_disponivel && ' · qualidade do ar indisponível no momento'}
      </Typography>
    </Stack>
  );
}

export default function PlanejarPage() {
  const feedback = useFeedback();
  const [parametros, setParametros] = useSearchParams();
  const [locais, setLocais] = useState(null);
  const [previsao, setPrevisao] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [agendando, setAgendando] = useState(false);

  const dias = useMemo(() => Array.from({ length: DIAS_PREVISAO }, (_, i) => dataISO(i)), []);
  const localId = parametros.get('local') ?? '';
  const data = parametros.get('data') ?? dias[0];
  const duracao = Number(parametros.get('duracao') ?? 1);

  function atualizarParametro(nome, valor) {
    setParametros(
      (atuais) => {
        const novos = new URLSearchParams(atuais);
        novos.set(nome, valor);
        return novos;
      },
      { replace: true },
    );
  }

  // Carrega os locais e, se nenhum estiver selecionado, escolhe o primeiro ao ar livre.
  useEffect(() => {
    api
      .listarLocais({ tamanho: 100 })
      .then((resposta) => {
        setLocais(resposta.itens);
        if (!parametros.get('local') && resposta.itens.length) {
          const preferido = resposta.itens.find((local) => local.tipo !== 'esteira') ?? resposta.itens[0];
          atualizarParametro('local', preferido.id);
        }
      })
      .catch((e) => {
        setLocais([]);
        feedback.erro(e.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Consulta GET /locais/{id}/melhor-horario sempre que local, dia ou duração mudam.
  useEffect(() => {
    if (!localId) return undefined;
    let cancelado = false;
    setCarregando(true);
    setErro('');
    api
      .melhorHorario(localId, { data, duracao_h: duracao })
      .then((resposta) => !cancelado && setPrevisao(resposta))
      .catch((e) => {
        if (cancelado) return;
        setErro(e.message);
        setPrevisao(null);
      })
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [localId, data, duracao]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5">Planejar treino</Typography>
        <Typography color="text.secondary">
          Descubra o melhor horário para correr com base na previsão do tempo e na qualidade do ar.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Local"
                value={locais?.length ? localId : ''}
                onChange={(e) => atualizarParametro('local', e.target.value)}
                sx={{ minWidth: 280 }}
              >
                {(locais ?? []).map((local) => (
                  <MenuItem key={local.id} value={String(local.id)}>
                    {local.nome} — {local.cidade}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Duração do treino"
                value={duracao}
                onChange={(e) => atualizarParametro('duracao', e.target.value)}
                sx={{ minWidth: 180 }}
              >
                {OPCOES_DURACAO.map((horas) => (
                  <MenuItem key={horas} value={horas}>
                    {horas} hora{horas > 1 ? 's' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                color="primary"
                value={data}
                onChange={(_evento, valor) => valor && atualizarParametro('data', valor)}
              >
                {dias.map((dia, indice) => (
                  <ToggleButton key={dia} value={dia} sx={{ px: 2, whiteSpace: 'nowrap' }}>
                    {rotuloDia(dia, indice)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {locais?.length === 0 && (
        <Alert severity="info">
          Cadastre um local em{' '}
          <Link component={RouterLink} to="/locais">
            Locais
          </Link>{' '}
          para ver a previsão.
        </Alert>
      )}
      {erro && <Alert severity="error">{erro}</Alert>}
      {carregando && <CarregandoConteudo texto="Consultando a previsão do tempo..." />}
      {!carregando && previsao && <ResultadoPrevisao previsao={previsao} onAgendar={() => setAgendando(true)} />}

      {previsao && (
        <TreinoFormDialog
          aberto={agendando}
          locais={locais ?? []}
          valoresIniciais={{
            local_id: previsao.local.id,
            data: previsao.data,
            horario: previsao.janela_ideal?.inicio ?? '',
            status: 'planejado',
          }}
          onFechar={() => setAgendando(false)}
          onSalvo={() => setAgendando(false)}
        />
      )}
    </Stack>
  );
}
