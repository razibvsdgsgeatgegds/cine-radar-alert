import { useUser } from '@/contexts/UserContext';
import { Onboarding } from '@/components/Onboarding';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const { isOnboarded } = useUser();

  return isOnboarded ? <Dashboard /> : <Onboarding />;
};

export default Index;
