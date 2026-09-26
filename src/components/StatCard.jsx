import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';

export default function StatCard({ titulo, valor, detalhe, icone, cor = 'primary.main' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: cor, width: 48, height: 48 }}>{icone}</Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {titulo}
          </Typography>
          <Typography variant="h5" noWrap>
            {valor}
          </Typography>
          {detalhe && (
            <Typography variant="caption" color="text.secondary">
              {detalhe}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
