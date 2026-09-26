import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export default function ConfirmDialog({ aberto, titulo, mensagem, rotuloConfirmar = 'Excluir', carregando, onConfirmar, onCancelar }) {
  return (
    <Dialog open={aberto} onClose={onCancelar} maxWidth="xs" fullWidth>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <DialogContentText>{mensagem}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelar}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onConfirmar} disabled={carregando}>
          {carregando ? 'Aguarde...' : rotuloConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
