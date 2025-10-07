import { useUser } from '@/contexts/UserContext';
import { Onboarding } from '@/components/Onboarding';
import { Dashboard } from '@/components/Dashboard';
import Landing from '@/components/Landing';

const Index = () => {
  const { isAuthenticated, isOnboarded } = useUser();

  if (!isAuthenticated) {
    return <Landing />;
  }

  const hasStoredPrefs = typeof window !== 'undefined' && !!localStorage.getItem('radar-user');
  const onboarded = isOnboarded || hasStoredPrefs;

  return onboarded ? <Dashboard /> : <Onboarding />;
};

export default Index;
