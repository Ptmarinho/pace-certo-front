import { NavLink, useLocation } from 'react-router-dom';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PlaceIcon from '@mui/icons-material/Place';
import SpeedIcon from '@mui/icons-material/Speed';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const ITENS_MENU = [
  { rota: '/', rotulo: 'Dashboard', icone: <DashboardIcon /> },
  { rota: '/treinos', rotulo: 'Treinos', icone: <DirectionsRunIcon /> },
  { rota: '/planejar', rotulo: 'Planejar', icone: <WbSunnyIcon /> },
  { rota: '/locais', rotulo: 'Locais', icone: <PlaceIcon /> },
];

export default function Layout({ children }) {
  const { pathname } = useLocation();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: { xs: 0.5, sm: 1 } }}>
          <SpeedIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1, whiteSpace: 'nowrap' }}>
            Pace Certo
          </Typography>
          {ITENS_MENU.map((item) => {
            const ativo = pathname === item.rota;
            return (
              <Button
                key={item.rota}
                component={NavLink}
                to={item.rota}
                color="inherit"
                startIcon={item.icone}
                aria-label={item.rotulo}
                sx={{
                  minWidth: 0,
                  borderRadius: 0,
                  opacity: ativo ? 1 : 0.8,
                  borderBottom: '3px solid',
                  borderColor: ativo ? '#fff' : 'transparent',
                  '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: -0.5 } },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {item.rotulo}
                </Box>
              </Button>
            );
          })}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3, flexGrow: 1 }}>
        {children}
      </Container>

      <Box component="footer" sx={{ py: 2, px: 2, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>
        Pace Certo · MVP de Arquitetura de Software · Dados meteorológicos: Open-Meteo.com (CC BY 4.0)
      </Box>
    </Box>
  );
}
