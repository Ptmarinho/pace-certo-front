import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { formatarData, formatarKm } from '../utils/formatadores';

export default function MetaSemanalCard({ semana, onSalvarMeta }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const atingida = semana.percentual_meta >= 100;
  const faltam = Math.max(0, semana.meta_km - semana.km);

  function abrir() {
    setValor(String(semana.meta_km));
    setErro('');
    setEditando(true);
  }

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    try {
      await onSalvarMeta(Number(valor));
      setEditando(false);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: atingida ? 'success.main' : 'primary.main' }}>
            <FlagIcon />
          </Avatar>
        }
        title="Meta da semana"
        subheader={`Semana iniciada em ${formatarData(semana.inicio)}`}
        action={<Button onClick={abrir}>Alterar meta</Button>}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h4">{formatarKm(semana.km)}</Typography>
          <Typography color="text.secondary">de {formatarKm(semana.meta_km)}</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, semana.percentual_meta)}
          color={atingida ? 'success' : 'primary'}
          sx={{ height: 14, borderRadius: 7 }}
        />
        <Typography sx={{ mt: 1.5 }} color={atingida ? 'success.main' : 'text.secondary'} fontWeight={600}>
          {atingida
            ? `🎉 Meta batida! Você chegou a ${semana.percentual_meta}% da meta.`
            : `${semana.percentual_meta}% concluído · faltam ${formatarKm(faltam)}`}
        </Typography>
      </CardContent>

      <Dialog open={editando} onClose={() => setEditando(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Meta semanal</DialogTitle>
        <DialogContent>
          <Box component="form" id="form-meta" onSubmit={salvar} sx={{ pt: 1 }}>
            {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
            <TextField
              autoFocus
              fullWidth
              required
              type="number"
              label="Quilômetros por semana"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              slotProps={{ htmlInput: { min: 1, max: 500, step: 0.5 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditando(false)}>Cancelar</Button>
          <Button type="submit" form="form-meta" variant="contained" disabled={salvando}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
