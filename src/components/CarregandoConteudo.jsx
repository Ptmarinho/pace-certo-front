import { Box, CircularProgress, Typography } from '@mui/material';

export default function CarregandoConteudo({ texto = 'Carregando...' }) {
  return (
    <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <CircularProgress />
      <Typography color="text.secondary">{texto}</Typography>
    </Box>
  );
}
