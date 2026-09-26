import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';
import { useFeedback } from '../context/FeedbackContext';
import { api } from '../services/api';
import { TIPOS_LOCAL } from '../utils/constantes';

const VAZIO = { nome: '', cidade: '', estado: '', tipo: 'parque', latitude: null, longitude: null };

/**
 * Cadastro (POST /locais) e edição (PUT /locais/{id}) de locais de corrida.
 * A busca de cidade usa GET /locais/buscar-cidade, que consulta a Open-Meteo Geocoding via API.
 */
export default function LocalFormDialog({ aberto, local, onFechar, onSalvo }) {
  const feedback = useFeedback();
  const [form, setForm] = useState(VAZIO);
  const [cidades, setCidades] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!aberto) return;
    setForm(
      local
        ? {
            nome: local.nome,
            cidade: local.cidade,
            estado: local.estado ?? '',
            tipo: local.tipo,
            latitude: local.latitude,
            longitude: local.longitude,
          }
        : VAZIO,
    );
    setCidades([]);
    setErro('');
  }, [aberto, local]);

  const alterar = (campo) => (evento) => {
    const valor = evento.target.value;
    const mudouCidade = campo === 'cidade' || campo === 'estado';
    setForm((atual) => ({ ...atual, [campo]: valor, ...(mudouCidade ? { latitude: null, longitude: null } : {}) }));
  };

  async function buscarCidades() {
    if (form.cidade.trim().length < 2) {
      setErro('Digite ao menos 2 letras do nome da cidade.');
      return;
    }
    setBuscando(true);
    setErro('');
    try {
      const encontradas = await api.buscarCidades(form.cidade.trim());
      setCidades(encontradas);
      if (!encontradas.length) setErro('Nenhuma cidade encontrada na Open-Meteo com esse nome.');
    } catch (e) {
      setErro(e.message);
    } finally {
      setBuscando(false);
    }
  }

  function escolherCidade(cidade) {
    setForm((atual) => ({
      ...atual,
      cidade: cidade.nome,
      estado: cidade.estado ?? '',
      latitude: cidade.latitude,
      longitude: cidade.longitude,
    }));
    setCidades([]);
  }

  async function salvar(evento) {
    evento.preventDefault();
    const corpo = {
      nome: form.nome.trim(),
      cidade: form.cidade.trim(),
      estado: form.estado.trim() || null,
      tipo: form.tipo,
      latitude: form.latitude,
      longitude: form.longitude,
    };
    setSalvando(true);
    setErro('');
    try {
      if (local) {
        await api.atualizarLocal(local.id, corpo);
        feedback.sucesso('Local atualizado!');
      } else {
        await api.criarLocal(corpo);
        feedback.sucesso('Local cadastrado! 📍');
      }
      onSalvo();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  const temCoordenadas = form.latitude !== null && form.longitude !== null;

  return (
    <Dialog open={aberto} onClose={onFechar} fullWidth maxWidth="sm">
      <DialogTitle>{local ? 'Editar local' : 'Novo local de corrida'}</DialogTitle>
      <DialogContent dividers>
        <Box component="form" id="form-local" onSubmit={salvar}>
          <Stack spacing={2}>
            {erro && <Alert severity="error">{erro}</Alert>}

            <TextField
              required
              label="Nome do local"
              placeholder="Ex.: Parque Ibirapuera"
              value={form.nome}
              onChange={alterar('nome')}
              slotProps={{ htmlInput: { minLength: 2, maxLength: 100 } }}
            />
            <TextField select label="Tipo" value={form.tipo} onChange={alterar('tipo')}>
              {Object.entries(TIPOS_LOCAL).map(([valor, rotulo]) => (
                <MenuItem key={valor} value={valor}>
                  {rotulo}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
              <TextField
                required
                fullWidth
                label="Cidade"
                value={form.cidade}
                onChange={alterar('cidade')}
                slotProps={{ htmlInput: { minLength: 2, maxLength: 100 } }}
              />
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={buscarCidades}
                disabled={buscando}
                sx={{ height: 56, flexShrink: 0 }}
              >
                {buscando ? 'Buscando...' : 'Buscar'}
              </Button>
            </Stack>

            {cidades.length > 0 && (
              <Paper variant="outlined">
                <Typography variant="caption" color="text.secondary" sx={{ px: 2, pt: 1, display: 'block' }}>
                  Resultados da Open-Meteo Geocoding. Escolha a cidade correta:
                </Typography>
                <List dense>
                  {cidades.map((cidade) => (
                    <ListItemButton key={`${cidade.latitude},${cidade.longitude}`} onClick={() => escolherCidade(cidade)}>
                      <ListItemIcon>
                        <PlaceIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={cidade.nome}
                        secondary={`${[cidade.estado, cidade.pais].filter(Boolean).join(' · ')} (${cidade.latitude.toFixed(2)}, ${cidade.longitude.toFixed(2)})`}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}

            <TextField label="Estado" value={form.estado} onChange={alterar('estado')} />

            {temCoordenadas ? (
              <Chip
                color="success"
                variant="outlined"
                icon={<PlaceIcon />}
                label={`Coordenadas: ${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}`}
                sx={{ alignSelf: 'flex-start' }}
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                Se nenhuma cidade da lista for escolhida, a API buscará as coordenadas automaticamente.
              </Typography>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onFechar}>Cancelar</Button>
        <Button type="submit" form="form-local" variant="contained" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
