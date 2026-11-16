import { lazy, Suspense } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/PageLoader';

const Landing = lazy(() => import('@/components/Landing'));
const Onboarding = lazy(() => import('@/components/Onboarding').then(m => ({ default: m.Onboarding })));
const Dashboard = lazy(() => import('@/components/Dashboard').then(m => ({ default: m.Dashboard })));

const Index = () => {
  const { isAuthenticated, onboardingCompleted, isProfileLoading, profileError, retryProfile } = useUser();

  // Wait for the account check before deciding to show setup again
  if (isProfileLoading) {
    return <PageLoader />;
  }

  if (profileError) return <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"><h1 className="text-2xl font-semibold">We couldn't load your account</h1><p className="text-muted-foreground">Your saved setup hasn't been changed.</p><Button onClick={retryProfile}>Try again</Button></main>;

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
