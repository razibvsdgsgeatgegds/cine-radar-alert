import { lazy, Suspense } from 'react';
import { useUser } from '@/contexts/UserContext';
import { PageLoader } from '@/components/PageLoader';

const Landing = lazy(() => import('@/components/Landing'));
const Onboarding = lazy(() => import('@/components/Onboarding').then(m => ({ default: m.Onboarding })));
const Dashboard = lazy(() => import('@/components/Dashboard').then(m => ({ default: m.Dashboard })));

const Index = () => {
  const { isAuthenticated, onboardingCompleted, isProfileLoading } = useUser();

  // Wait for the account check before deciding to show setup again
  if (isAuthenticated && isProfileLoading && !onboardingCompleted) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      {!isAuthenticated ? (
        <Landing />
      ) : onboardingCompleted ? (
        <Dashboard />
      ) : (
        <Onboarding />
      )}
    </Suspense>
  );
};

export default Index;
