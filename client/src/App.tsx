import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OnboardingModal } from './components/OnboardingModal';
import { HomePage } from './pages/HomePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { PaidGamesPage } from './pages/PaidGamesPage';
import { FreeGamesPage } from './pages/FreeGamesPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <PreferencesProvider>
      <Router>
        <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col selection:bg-emerald-500/30 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/game/:id" element={<GameDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/paid-games" element={<PaidGamesPage />} />
              <Route path="/free-games" element={<FreeGamesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <OnboardingModal />
        </div>
      </Router>
    </PreferencesProvider>
  );
}

export default App;
