import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CarregandoConteudo from '../components/CarregandoConteudo';
import ConfirmDialog from '../components/ConfirmDialog';
import LocalFormDialog from '../components/LocalFormDialog';
import { useFeedback } from '../context/FeedbackContext';
import { api } from '../services/api';
import { TIPOS_LOCAL } from '../utils/constantes';
import { formatarKm } from '../utils/formatadores';

const LOCAIS_POR_PAGINA = 6;

export default function LocaisPage() {
  const feedback = useFeedback();
  const navegar = useNavigate();
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [tipo, setTipo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState(null);
  const [dialogo, setDialogo] = useState({ aberto: false, local: null });
  const [excluindo, setExcluindo] = useState(null);
  const [processando, setProcessando] = useState(false);

  // Aguarda o usuário parar de digitar antes de consultar a API.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBuscaAplicada(busca);
      setPagina(1);
    }, 400);
    return () => clearTimeout(temporizador);
  }, [busca]);

  const carregar = useCallback(async () => {
    try {
      setResultado(await api.listarLocais({ busca: buscaAplicada, tipo, pagina, tamanho: LOCAIS_POR_PAGINA }));
    } catch (e) {
      feedback.erro(e.message);
      setResultado({ itens: [], total: 0, total_paginas: 1 });
    }
  }, [buscaAplicada, tipo, pagina, feedback]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function aoSalvar() {
    setDialogo({ aberto: false, local: null });
    carregar();
  }

  async function confirmarExclusao() {
    setProcessando(true);
    try {
      await api.excluirLocal(excluindo.id);
      feedback.sucesso('Local excluído.');
      setExcluindo(null);
      carregar();
    } catch (e) {
      feedback.erro(e.message);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h5">Locais de corrida</Typography>
          <Typography color="text.secondary">Onde você corre. As coordenadas são usadas para a previsão do tempo.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogo({ aberto: true, local: null })}>
          Novo local
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          size="small"
          label="Buscar por nome ou cidade"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ flexGrow: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Tipo"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            setPagina(1);
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(TIPOS_LOCAL).map(([valor, rotulo]) => (
            <MenuItem key={valor} value={valor}>
              {rotulo}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {!resultado ? (
        <CarregandoConteudo />
      ) : resultado.itens.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          Nenhum local encontrado.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' } }}>
          {resultado.itens.map((local) => (
            <Card key={local.id} sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Typography variant="h6" fontWeight={700}>
                    {local.nome}
                  </Typography>
                  <Chip size="small" label={TIPOS_LOCAL[local.tipo]} color="primary" variant="outlined" />
                </Stack>
                <Typography color="text.secondary">
                  📍 {local.cidade}
                  {local.estado && ` · ${local.estado}`}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip size="small" label={`${local.total_treinos} treino(s)`} />
                  <Chip size="small" label={`${formatarKm(local.km_realizados)} corridos`} />
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
                  {local.latitude.toFixed(4)}, {local.longitude.toFixed(4)}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button size="small" startIcon={<WbSunnyIcon />} onClick={() => navegar(`/planejar?local=${local.id}`)}>
                  Melhor horário
                </Button>
                <Box>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => setDialogo({ aberto: true, local })}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton color="error" onClick={() => setExcluindo(local)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {resultado && resultado.total_paginas > 1 && (
        <Pagination
          sx={{ alignSelf: 'center' }}
          color="primary"
          count={resultado.total_paginas}
          page={pagina}
          onChange={(_evento, novaPagina) => setPagina(novaPagina)}
        />
      )}

      <LocalFormDialog
        aberto={dialogo.aberto}
        local={dialogo.local}
        onFechar={() => setDialogo({ aberto: false, local: null })}
        onSalvo={aoSalvar}
      />

      <ConfirmDialog
        aberto={Boolean(excluindo)}
        titulo="Excluir local"
        mensagem={
          excluindo
            ? `Excluir "${excluindo.nome}" também removerá ${excluindo.total_treinos} treino(s) registrados nele. Deseja continuar?`
            : ''
        }
        carregando={processando}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluindo(null)}
      />
    </Stack>
  );
}
