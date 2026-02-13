import { lazy, Suspense } from 'react';
import { useUser } from '@/contexts/UserContext';
import { PageLoader } from '@/components/PageLoader';

const Landing = lazy(() => import('@/components/Landing'));
const Onboarding = lazy(() => import('@/components/Onboarding').then(m => ({ default: m.Onboarding })));
const Dashboard = lazy(() => import('@/components/Dashboard').then(m => ({ default: m.Dashboard })));

const Index = () => {
  const { isAuthenticated, isOnboarded, authUser } = useUser();

  // Check if onboarding was explicitly completed
  const onboardingCompleted = typeof window !== 'undefined' && authUser?.email
    ? localStorage.getItem(`watchverse-onboarded-${authUser.email}`) === 'true'
    : false;

  const hasStoredPrefs = typeof window !== 'undefined' && (
    !!localStorage.getItem('radar-user') ||
    (authUser?.email && !!localStorage.getItem(`radar-user-${authUser.email}`))
  );
  
  const onboarded = (isOnboarded || hasStoredPrefs) && onboardingCompleted;

  return (
    <Suspense fallback={<PageLoader />}>
      {!isAuthenticated ? (
        <Landing />
      ) : onboarded ? (
        <Dashboard />
      ) : (
        <Onboarding />
      )}
    </Suspense>
  );
};

export default Index;
