import { useUser } from '@/contexts/UserContext';
import { Onboarding } from '@/components/Onboarding';
import { Dashboard } from '@/components/Dashboard';
import Landing from '@/components/Landing';

const Index = () => {
  const { isAuthenticated, isOnboarded } = useUser();

  if (!isAuthenticated) {
    return <Landing />;
  }

  return isOnboarded ? <Dashboard /> : <Onboarding />;
};

export default Index;
