import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ConfirmDialog from '../components/ConfirmDialog';
import TreinoFormDialog from '../components/TreinoFormDialog';
import { useFeedback } from '../context/FeedbackContext';
import { api } from '../services/api';
import { STATUS_TREINO, TIPOS_TREINO } from '../utils/constantes';
import { formatarData, formatarDuracao, formatarKm } from '../utils/formatadores';

const FILTROS_INICIAIS = { status: '', tipo: '', local_id: '', data_inicio: '', data_fim: '' };

function CabecalhoOrdenavel({ coluna, rotulo, ordenacao, onOrdenar }) {
  const ativo = ordenacao.ordenar_por === coluna;
  return (
    <TableCell sortDirection={ativo ? ordenacao.ordem : false}>
      <TableSortLabel active={ativo} direction={ativo ? ordenacao.ordem : 'desc'} onClick={() => onOrdenar(coluna)}>
        {rotulo}
      </TableSortLabel>
    </TableCell>
  );
}

export default function TreinosPage() {
  const feedback = useFeedback();
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [ordenacao, setOrdenacao] = useState({ ordenar_por: 'data', ordem: 'desc' });
  const [pagina, setPagina] = useState(0);
  const [tamanho, setTamanho] = useState(10);
  const [resultado, setResultado] = useState({ itens: [], total: 0 });
  const [carregando, setCarregando] = useState(true);
  const [locais, setLocais] = useState(null);
  const [dialogo, setDialogo] = useState({ aberto: false, treino: null, valoresIniciais: undefined });
  const [excluindo, setExcluindo] = useState(null);
  const [processando, setProcessando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setResultado(await api.listarTreinos({ ...filtros, ...ordenacao, pagina: pagina + 1, tamanho }));
    } catch (e) {
      feedback.erro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [filtros, ordenacao, pagina, tamanho, feedback]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    api
      .listarLocais({ tamanho: 100 })
      .then((resposta) => setLocais(resposta.itens))
      .catch((e) => {
        setLocais([]);
        feedback.erro(e.message);
      });
  }, [feedback]);

  const alterarFiltro = (campo) => (evento) => {
    setFiltros((atual) => ({ ...atual, [campo]: evento.target.value }));
    setPagina(0);
  };

  function ordenarPor(coluna) {
    setOrdenacao((atual) => ({
      ordenar_por: coluna,
      ordem: atual.ordenar_por === coluna && atual.ordem === 'desc' ? 'asc' : 'desc',
    }));
    setPagina(0);
  }

  function abrirDialogo(treino = null, valoresIniciais = undefined) {
    setDialogo({ aberto: true, treino, valoresIniciais });
  }

  function aoSalvar() {
    setDialogo({ aberto: false, treino: null, valoresIniciais: undefined });
    carregar();
  }

  async function confirmarExclusao() {
    setProcessando(true);
    try {
      await api.excluirTreino(excluindo.id);
      feedback.sucesso('Treino excluído.');
      setExcluindo(null);
      carregar();
    } catch (e) {
      feedback.erro(e.message);
    } finally {
      setProcessando(false);
    }
  }

  const filtrosAtivos = Object.values(filtros).some(Boolean);
  const semLocais = locais !== null && locais.length === 0;

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h5">Treinos</Typography>
          <Typography color="text.secondary">{resultado.total} treino(s) encontrado(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => abrirDialogo()} disabled={!locais?.length}>
          Novo treino
        </Button>
      </Stack>

      {semLocais && <Alert severity="info">Cadastre um local na aba "Locais" antes de registrar treinos.</Alert>}

      <Card>
        <CardContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' } }}>
            <TextField select size="small" label="Status" value={filtros.status} onChange={alterarFiltro('status')}>
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(STATUS_TREINO).map(([valor, { rotulo }]) => (
                <MenuItem key={valor} value={valor}>
                  {rotulo}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Tipo" value={filtros.tipo} onChange={alterarFiltro('tipo')}>
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(TIPOS_TREINO).map(([valor, { rotulo }]) => (
                <MenuItem key={valor} value={valor}>
                  {rotulo}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Local" value={filtros.local_id} onChange={alterarFiltro('local_id')}>
              <MenuItem value="">Todos</MenuItem>
              {(locais ?? []).map((local) => (
                <MenuItem key={local.id} value={local.id}>
                  {local.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="date"
              label="De"
              value={filtros.data_inicio}
              onChange={alterarFiltro('data_inicio')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              type="date"
              label="Até"
              value={filtros.data_fim}
              onChange={alterarFiltro('data_fim')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          {filtrosAtivos && (
            <Button
              size="small"
              sx={{ mt: 1 }}
              onClick={() => {
                setFiltros(FILTROS_INICIAIS);
                setPagina(0);
              }}
            >
              Limpar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        {carregando && <LinearProgress />}
        <TableContainer>
          <Table size="small" sx={{ minWidth: 860 }}>
            <TableHead>
              <TableRow>
                <CabecalhoOrdenavel coluna="data" rotulo="Data" ordenacao={ordenacao} onOrdenar={ordenarPor} />
                <TableCell>Local</TableCell>
                <TableCell>Tipo</TableCell>
                <CabecalhoOrdenavel coluna="distancia_km" rotulo="Distância" ordenacao={ordenacao} onOrdenar={ordenarPor} />
                <CabecalhoOrdenavel coluna="duracao_min" rotulo="Duração" ordenacao={ordenacao} onOrdenar={ordenarPor} />
                <CabecalhoOrdenavel coluna="pace" rotulo="Pace" ordenacao={ordenacao} onOrdenar={ordenarPor} />
                <CabecalhoOrdenavel coluna="esforco" rotulo="Esforço" ordenacao={ordenacao} onOrdenar={ordenarPor} />
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultado.itens.map((treino) => (
                <TableRow key={treino.id} hover>
                  <TableCell>
                    {formatarData(treino.data)}
                    {treino.horario && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {treino.horario.slice(0, 5)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{treino.local.nome}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={TIPOS_TREINO[treino.tipo].rotulo}
                      sx={{ bgcolor: TIPOS_TREINO[treino.tipo].cor, color: '#fff', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>{formatarKm(treino.distancia_km)}</TableCell>
                  <TableCell>{formatarDuracao(treino.duracao_min)}</TableCell>
                  <TableCell>{treino.pace_formatado ? `${treino.pace_formatado} /km` : '—'}</TableCell>
                  <TableCell>{treino.esforco ?? '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={STATUS_TREINO[treino.status].cor}
                      label={STATUS_TREINO[treino.status].rotulo}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {treino.status === 'planejado' && (
                      <Tooltip title="Registrar como realizado">
                        <IconButton color="success" onClick={() => abrirDialogo(treino, { status: 'realizado' })}>
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Editar">
                      <IconButton onClick={() => abrirDialogo(treino)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton color="error" onClick={() => setExcluindo(treino)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!carregando && resultado.itens.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Nenhum treino encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={resultado.total}
          page={pagina}
          onPageChange={(_evento, novaPagina) => setPagina(novaPagina)}
          rowsPerPage={tamanho}
          onRowsPerPageChange={(evento) => {
            setTamanho(Number(evento.target.value));
            setPagina(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
          labelRowsPerPage="Por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Card>

      <TreinoFormDialog
        aberto={dialogo.aberto}
        treino={dialogo.treino}
        valoresIniciais={dialogo.valoresIniciais}
        locais={locais ?? []}
        onFechar={() => setDialogo({ aberto: false, treino: null, valoresIniciais: undefined })}
        onSalvo={aoSalvar}
      />

      <ConfirmDialog
        aberto={Boolean(excluindo)}
        titulo="Excluir treino"
        mensagem={excluindo ? `Deseja excluir o treino de ${formatarData(excluindo.data)} (${formatarKm(excluindo.distancia_km)})?` : ''}
        carregando={processando}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluindo(null)}
      />
    </Stack>
  );
}
