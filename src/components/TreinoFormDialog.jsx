import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import { useFeedback } from '../context/FeedbackContext';
import { api } from '../services/api';
import { STATUS_TREINO, TIPOS_TREINO } from '../utils/constantes';
import { dataISO, formatarDuracao, formatarPace, interpretarDuracao } from '../utils/formatadores';

const ESCALA_ESFORCO = Array.from({ length: 10 }, (_, i) => i + 1);

function formularioVazio(locais) {
  return {
    local_id: locais[0]?.id ?? '',
    data: dataISO(),
    horario: '',
    distancia_km: '',
    duracao: '',
    tipo: 'leve',
    status: 'planejado',
    esforco: '',
    observacoes: '',
  };
}

function formularioDoTreino(treino) {
  return {
    local_id: treino.local_id,
    data: treino.data,
    horario: treino.horario ? treino.horario.slice(0, 5) : '',
    distancia_km: String(treino.distancia_km),
    duracao: treino.duracao_min ? formatarDuracao(treino.duracao_min) : '',
    tipo: treino.tipo,
    status: treino.status,
    esforco: treino.esforco ?? '',
    observacoes: treino.observacoes ?? '',
  };
}

/**
 * Formulário para criar (POST /treinos) ou editar (PUT /treinos/{id}) um treino.
 * `valoresIniciais` permite pré-preencher campos, por exemplo a partir do planejamento.
 */
export default function TreinoFormDialog({ aberto, treino, valoresIniciais, locais, onFechar, onSalvo }) {
  const feedback = useFeedback();
  const [form, setForm] = useState(() => formularioVazio(locais));
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const base = treino ? formularioDoTreino(treino) : formularioVazio(locais);
    setForm({ ...base, ...valoresIniciais });
    setErro('');
    // Reinicia o formulário apenas ao abrir o diálogo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, treino]);

  const alterar = (campo) => (evento) => setForm((atual) => ({ ...atual, [campo]: evento.target.value }));

  const duracaoMin = form.duracao ? interpretarDuracao(form.duracao) : null;
  const duracaoInvalida = Boolean(form.duracao) && duracaoMin === null;
  const distancia = Number(form.distancia_km);
  const paceCalculado = duracaoMin && distancia > 0 ? duracaoMin / distancia : null;

  async function salvar(evento) {
    evento.preventDefault();
    if (duracaoInvalida) {
      setErro('Duração inválida. Use mm:ss ou h:mm:ss (ex.: 45:30).');
      return;
    }
    if (form.status === 'realizado' && !duracaoMin) {
      setErro('Informe a duração para registrar um treino realizado.');
      return;
    }

    const corpo = {
      local_id: Number(form.local_id),
      data: form.data,
      horario: form.horario || null,
      distancia_km: distancia,
      duracao_min: duracaoMin,
      tipo: form.tipo,
      status: form.status,
      esforco: form.esforco === '' ? null : Number(form.esforco),
      observacoes: form.observacoes.trim() || null,
    };

    setSalvando(true);
    setErro('');
    try {
      if (treino) {
        await api.atualizarTreino(treino.id, corpo);
        feedback.sucesso('Treino atualizado!');
      } else {
        await api.criarTreino(corpo);
        feedback.sucesso(corpo.status === 'realizado' ? 'Treino registrado! 💪' : 'Treino planejado! 📅');
      }
      onSalvo();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberto} onClose={onFechar} fullWidth maxWidth="sm">
      <DialogTitle>{treino ? 'Editar treino' : 'Novo treino'}</DialogTitle>
      <DialogContent dividers>
        <Box component="form" id="form-treino" onSubmit={salvar}>
          <Stack spacing={2}>
            {erro && <Alert severity="error">{erro}</Alert>}

            <TextField select required label="Local" value={form.local_id} onChange={alterar('local_id')}>
              {locais.map((local) => (
                <MenuItem key={local.id} value={local.id}>
                  {local.nome} — {local.cidade}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select fullWidth label="Status" value={form.status} onChange={alterar('status')}>
                {Object.entries(STATUS_TREINO).map(([valor, { rotulo }]) => (
                  <MenuItem key={valor} value={valor}>
                    {rotulo}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select fullWidth label="Tipo de treino" value={form.tipo} onChange={alterar('tipo')}>
                {Object.entries(TIPOS_TREINO).map(([valor, { rotulo }]) => (
                  <MenuItem key={valor} value={valor}>
                    {rotulo}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                required
                type="date"
                label="Data"
                value={form.data}
                onChange={alterar('data')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                type="time"
                label="Horário"
                value={form.horario}
                onChange={alterar('horario')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                required
                type="number"
                label="Distância (km)"
                value={form.distancia_km}
                onChange={alterar('distancia_km')}
                slotProps={{ htmlInput: { min: 0.1, max: 300, step: 0.1 } }}
              />
              <TextField
                fullWidth
                label="Duração"
                placeholder="mm:ss ou h:mm:ss"
                value={form.duracao}
                onChange={alterar('duracao')}
                error={duracaoInvalida}
                helperText={
                  duracaoInvalida
                    ? 'Formato inválido'
                    : form.status === 'realizado'
                      ? 'Obrigatória para treinos realizados'
                      : 'Opcional para treinos planejados'
                }
              />
            </Stack>

            {paceCalculado && (
              <Alert severity="info" icon={<SpeedIcon />}>
                Pace calculado: <strong>{formatarPace(paceCalculado)} /km</strong>
              </Alert>
            )}

            <TextField select label="Esforço percebido (1 a 10)" value={form.esforco} onChange={alterar('esforco')}>
              <MenuItem value="">Não informado</MenuItem>
              {ESCALA_ESFORCO.map((nivel) => (
                <MenuItem key={nivel} value={nivel}>
                  {nivel}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              multiline
              minRows={2}
              label="Observações"
              value={form.observacoes}
              onChange={alterar('observacoes')}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onFechar}>Cancelar</Button>
        <Button type="submit" form="form-treino" variant="contained" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
