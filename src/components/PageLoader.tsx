import { useEffect, useState } from 'react';
import watchverseLogo from '@/assets/watchverse-logo.png';

export const PageLoader = () => {
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 25 + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setHiding(true), 300);
      const timer2 = setTimeout(() => setHidden(true), 800);
      return () => { clearTimeout(timer); clearTimeout(timer2); };
    }
  }, [progress]);

  if (hidden) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${hiding ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-neon-pink/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-golden/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-neon-pink to-golden blur-xl opacity-50 animate-pulse" />
          <img
            src={watchverseLogo}
            alt="WatchVerse"
            className="relative h-20 w-20 rounded-2xl animate-scale-in"
          />
        </div>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-neon-pink to-golden bg-clip-text text-transparent animate-fade-in">
          WatchVerse
        </h1>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden animate-fade-in">
          <div
            className="h-full bg-gradient-to-r from-primary via-neon-pink to-golden rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground animate-fade-in">
          Loading your universe...
        </p>
      </div>
    </div>
  );
};
