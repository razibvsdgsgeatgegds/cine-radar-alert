import { useUser } from '@/contexts/UserContext';
import { Onboarding } from '@/components/Onboarding';
import { Dashboard } from '@/components/Dashboard';
import Landing from '@/components/Landing';

const Index = () => {
  const { isAuthenticated, isOnboarded, authUser } = useUser();

  if (!isAuthenticated) {
    return <Landing />;
  }

  // Check both context state and localStorage for preferences
  const hasStoredPrefs = typeof window !== 'undefined' && (
    !!localStorage.getItem('radar-user') ||
    (authUser?.email && !!localStorage.getItem(`radar-user-${authUser.email}`))
  );
  
  const onboarded = isOnboarded || hasStoredPrefs;

  return onboarded ? <Dashboard /> : <Onboarding />;
};

export default Index;
