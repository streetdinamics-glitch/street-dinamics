import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
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
import EnhancedUserProfile from './pages/EnhancedUserProfile';
import Web3Page from './pages/Web3';
import { Navigate } from 'react-router-dom';

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
      <Route path="/Admin" element={<Admin />} />
      <Route path="/CreateEvent" element={<CreateEvent />} />
      <Route path="/AthleteProfile" element={<AthleteProfile />} />
      <Route path="/AthleteProfilePage/:athleteEmail" element={<AthleteProfilePage />} />
      <Route path="/Analytics" element={<Analytics />} />
      <Route path="/NFTDashboard" element={<NFTDashboard />} />
      <Route path="/UserProfile" element={<UserProfile />} />
      <Route path="/VotingHub" element={<VotingHub />} />
      <Route path="/EnhancedUserProfile" element={<EnhancedUserProfile />} />
      <Route path="/Web3" element={<Web3Page />} />
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