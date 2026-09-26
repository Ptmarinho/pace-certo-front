import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import LocaisPage from './pages/LocaisPage';
import PlanejarPage from './pages/PlanejarPage';
import TreinosPage from './pages/TreinosPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/treinos" element={<TreinosPage />} />
        <Route path="/planejar" element={<PlanejarPage />} />
        <Route path="/locais" element={<LocaisPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </Layout>
  );
}
