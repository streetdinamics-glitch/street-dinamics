import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client'
import { queryClientInstance } from '@/lib/query-client'
import WalletProvider from './components/web3/WalletProvider.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import Admin from './pages/Admin';
import CreateEvent from './pages/CreateEvent';
import AthleteProfile from './pages/AthleteProfile';
import AthleteProfilePage from './pages/AthleteProfilePage';
import Analytics from './pages/Analytics';
import NFTDashboard from './pages/NFTDashboard';
import UserProfile from './pages/UserProfile';
import VotingHub from './pages/VotingHub';
import Web3Page from './pages/Web3';
import ComeFunziona from './pages/ComeFunziona';
import Discipline from './pages/Discipline';
import FormatoEvento from './pages/FormatoEvento';
import WindowChallengePage from './pages/WindowChallenge';
import Scarsita from './pages/Scarsita';
import DashboardFan from './pages/DashboardFan';
import DashboardAtleta from './pages/DashboardAtleta';
import DashboardAdmin from './pages/DashboardAdmin';
import { Navigate } from 'react-router-dom';

const AdminGuard = ({ children }) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });
  if (isLoading) return null;
  return user?.role === 'admin' ? children : <Navigate to="/Home" replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Admin" element={<AdminGuard><Admin /></AdminGuard>} />
      <Route path="/CreateEvent" element={<CreateEvent />} />
      <Route path="/AthleteProfile" element={<AthleteProfile />} />
      <Route path="/AthleteProfilePage/:athleteEmail" element={<AthleteProfilePage />} />
      <Route path="/Analytics" element={<Analytics />} />
      <Route path="/NFTDashboard" element={<NFTDashboard />} />
      <Route path="/UserProfile" element={<UserProfile />} />
      <Route path="/VotingHub" element={<VotingHub />} />
      <Route path="/EnhancedUserProfile" element={<Navigate to="/UserProfile" replace />} />
      <Route path="/Web3" element={<Web3Page />} />
      <Route path="/come-funziona" element={<ComeFunziona />} />
      <Route path="/discipline" element={<Discipline />} />
      <Route path="/formato-evento" element={<FormatoEvento />} />
      <Route path="/window-challenge" element={<WindowChallengePage />} />
      <Route path="/scarsita" element={<Scarsita />} />
      <Route path="/dashboard-fan" element={<DashboardFan />} />
      <Route path="/dashboard-atleta" element={<DashboardAtleta />} />
      <Route path="/dashboard-admin" element={<AdminGuard><DashboardAdmin /></AdminGuard>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <WalletProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </WalletProvider>
    </AuthProvider>
  )
}

export default App