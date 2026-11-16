import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Bell, Calendar, Search, Star, Gamepad2, Film, Tv, Mail, User, Sparkles, Zap, Heart, Chrome, Eye, Users, TrendingUp, Globe, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { toast as sonnerToast } from '@/components/ui/sonner';
import cinemaImage from '@/assets/watchverse-cinema.jpg';
import watchverseLogo from '@/assets/watchverse-logo.png';
import { SignupPopup } from '@/components/SignupPopup';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UpcomingSpotlight } from '@/components/UpcomingSpotlight';

const GameNotifyForm = () => {
  const [gameEmail, setGameEmail] = useState('');
  const [gameSubmitting, setGameSubmitting] = useState(false);
  const [gameSubmitted, setGameSubmitted] = useState(false);

  const handleGameNotify = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gameEmail.trim())) { sonnerToast.error('Enter a valid email address.'); return; }
    setGameSubmitting(true);
    try {
      const { error } = await supabase.from('notification_subscribers').insert({
        email: gameEmail.trim().toLowerCase(),
        name: null,
        is_active: true,
        notification_type: 'games',
      });
      if (error && error.code !== '23505') throw error;
      setGameSubmitted(true);
      sonnerToast.success('You\'ll be notified when games launch! 🎮');
    } catch {
      sonnerToast.error('Something went wrong, try again.');
    } finally {
      setGameSubmitting(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">Be the first to know when we launch</p>
      {gameSubmitted ? (
        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-success/10 border border-success/30">
          <CheckCircle className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">You're on the list! 🎉</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full max-w-sm">
          <Input
            type="email"
            placeholder="your@email.com"
            value={gameEmail}
            onChange={(e) => setGameEmail(e.target.value)}
            className="bg-background/50 border-golden/30 focus:border-golden/60"
          />
          <Button
            onClick={handleGameNotify}
            disabled={gameSubmitting || !gameEmail}
            className="bg-gradient-to-r from-golden to-neon-pink hover:shadow-glow whitespace-nowrap"
          >
            <Bell className="h-4 w-4 mr-1" />
            {gameSubmitting ? '...' : 'Notify Me'}
          </Button>
        </div>
      )}
    </div>
  );
};

const Landing = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const { setAuthUser, setUser, clearUser } = useUser();
  const { toast } = useToast();

  // Track visit and fetch stats
  useEffect(() => {
    const trackVisit = async () => {
      let visitorId = localStorage.getItem('watchverse-visitor-id');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('watchverse-visitor-id', visitorId);
      }
      await supabase.from('site_visits').insert({
        visitor_id: visitorId,
        page: '/'
      });
    };

    void trackVisit();
  }, []);

  useEffect(() => {
    if (window.location.hash === '#auth-section') window.setTimeout(scrollToSignup, 100);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData.email || !authData.password || (!isLogin && !authData.name)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "Successfully logged in. Let's get started!"
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.password,
          options: {
            data: {
              full_name: authData.name,
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account."
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: true
        }
      });
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Google Sign In Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const scrollToSignup = () => {
    setIsLogin(false);
    const authSection = document.querySelector('#auth-section');
    if (authSection) {
      authSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Signup Popup */}
      <SignupPopup onSignup={scrollToSignup} />
      {/* Navbar - Fixed mobile overlap */}
      <nav className="relative z-20 border-b border-primary/10 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src={watchverseLogo} alt="WatchVerse Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex-shrink-0" />
            <span className="text-base sm:text-xl font-bold text-foreground truncate">
              WatchVerse
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 hover:bg-primary/10">
              <Link to="/releases">
                <Film className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Releases</span>
              </Link>
            </Button>
            <Button onClick={scrollToSignup} size="sm" className="bg-primary hover:bg-primary/90 transition-all text-xs sm:text-sm px-3 sm:px-4">
              <ArrowRight className="h-4 w-4 mr-1 sm:hidden" />
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Join</span>
            </Button>
          </div>
        </div>
      </nav>

      <section className="cinema-hero">
        <img src={cinemaImage} alt="Red velvet seats in a modern cinema" width={1600} height={912} />
        <div className="container mx-auto px-5 sm:px-8 cinema-copy">
          <p className="section-eyebrow mb-5 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />THE GOOD PART IS STILL AHEAD</p>
          <h1>WatchVerse<span className="text-primary">.</span></h1>
          <h2 className="mt-4 text-3xl sm:text-4xl font-semibold leading-tight">Find your next<br /><span className="text-neon-pink">can't-wait-to-watch.</span></h2>
          <p className="mt-5 text-base text-cinema-foreground/80">Big-screen moments. One-more-episode nights. Get ahead of the movies and series coming next.</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button asChild size="lg"><Link to="/releases">Explore releases <ArrowRight /></Link></Button>
            <Button size="lg" variant="outline" onClick={scrollToSignup} className="border-cinema-foreground/30 bg-cinema-background/40 text-cinema-foreground hover:bg-cinema-foreground/10 hover:text-cinema-foreground">Get Started Free</Button>
          </div>
          <div className="flex flex-wrap gap-5 mt-9 text-sm text-cinema-foreground/70"><span className="flex items-center gap-2"><Film className="w-4 h-4 text-primary" />Movies</span><span className="flex items-center gap-2"><Tv className="w-4 h-4 text-neon-cyan" />Series</span><span className="flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-golden" />Games · coming soon</span></div>
        </div>
      </section>
      <UpcomingSpotlight />
      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-5 sm:px-8">
          <p className="section-eyebrow mb-3">FOR THE ONES WHO LOVE THE WAIT</p><h2 className="text-3xl font-semibold mb-10">A little less scrolling.<br />A lot more looking forward.</h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
            {[{icon: Film, title: 'A calendar, not a catalogue', body: 'Fresh movie and series dates, without the already-released clutter.'}, {icon: Heart, title: 'Your own shortlist', body: 'Save the titles you care about, with your preferences kept in your account.'}, {icon: Search, title: 'Find your kind of story', body: 'Discover upcoming releases by genre, language, and country.'}].map(({icon: Icon, title, body}) => <div key={title} className="border-t border-border pt-6"><Icon className="h-6 w-6 text-neon-cyan mb-5" /><h3 className="font-semibold text-lg mb-2">{title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{body}</p></div>)}
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="container mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-8 items-center">
          <div><p className="section-eyebrow mb-3">NEXT CHAPTER</p><h2 className="text-3xl font-semibold flex items-center gap-3"><Gamepad2 className="text-golden" />Games are joining the verse.</h2><p className="mt-3 text-muted-foreground">PC, console, and indie releases. Join the launch list.</p></div>
          <GameNotifyForm />
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="py-12 sm:py-20 relative scroll-mt-20 auth-band">

        <div className="container mx-auto px-5 sm:px-8 relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="auth-intro"><p className="section-eyebrow mb-5">YOUR PERSONAL FRONT ROW</p><h2 className="text-4xl sm:text-5xl font-semibold leading-tight">Good stories.<br /><span className="text-neon-cyan">Great anticipation.</span><br />All yours.</h2><p className="text-muted-foreground text-lg leading-relaxed mt-6 max-w-md">Your next obsession deserves a place on your list. Make it your WatchVerse.</p><div className="mt-8 space-y-4"><p className="flex items-center gap-3"><Heart className="text-neon-pink w-5 h-5" />A shortlist that follows you</p><p className="flex items-center gap-3"><Calendar className="text-neon-cyan w-5 h-5" />Upcoming stories, not endless scrolling</p><p className="flex items-center gap-3"><Shield className="text-primary w-5 h-5" />Your tastes. Your account.</p></div></div>
          <div className="w-full max-w-md mx-auto">
            <Card className="auth-panel bg-card border-border">
              <CardHeader className="text-left pb-5 p-6 sm:p-8">
                <div className="mb-3 flex items-center gap-3">
                  <img src={watchverseLogo} alt="WatchVerse" className="h-10 w-10 rounded-lg" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl text-foreground">
                  {isLogin ? 'Welcome Back' : 'Join WatchVerse'}
                </CardTitle>
                <CardDescription className="text-sm sm:text-lg">
                  {isLogin ? 'The next chapter is waiting for you.' : 'A shortlist that follows you. Free to join.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-6 pt-0 sm:p-8 sm:pt-0">
                <Button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  variant="outline" className="w-full"
                  size="lg"
                >
                  <Chrome className="h-5 w-5 mr-3" />
                  Continue with Google
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          className="h-12 pl-10 bg-background border-border focus:border-primary"
                          value={authData.name}
                          onChange={(e) => setAuthData({...authData, name: e.target.value})}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="h-12 pl-10 bg-background border-border focus:border-primary"
                        value={authData.email}
                        onChange={(e) => setAuthData({...authData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 bg-background border-border focus:border-primary"
                      value={authData.password}
                      onChange={(e) => setAuthData({...authData, password: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 transition-all duration-300" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {isLogin ? 'Signing In...' : 'Creating Account...'}
                      </div>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        {isLogin ? 'Sign In' : 'Create Account'}
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="text-center border-t border-border pt-4">
                  <Button
                    variant="link"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-primary hover:text-primary/80"
                    disabled={loading}
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-primary/20 bg-background backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Brand */}
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <img src={watchverseLogo} alt="WatchVerse" className="h-8 w-8 rounded-lg" />
                <h3 className="text-lg font-bold text-foreground">
                  WatchVerse
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Upcoming stories. One personal shortlist.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="text-center">
              <h4 className="font-semibold text-foreground mb-3 text-sm">Quick Links</h4>
              <div className="space-y-2">
                <Button variant="link" onClick={scrollToSignup} className="text-muted-foreground">
                  Sign Up / Login
                </Button>
                <a href="mailto:watchverse@trynoryvex.com" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
            
            {/* Legal */}
            <div className="text-center sm:text-right">
              <h4 className="font-semibold text-foreground mb-3 text-sm">About the creator</h4>
              <Button asChild variant="link" className="px-0 text-neon-cyan"><a href="https://www.linkedin.com/in/mrazi-dev/" target="_blank" rel="noopener noreferrer">Muhammad Razi Khoja <ArrowRight className="h-4 w-4" /></a></Button>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-end gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Your account, your preferences
                </p>
                <p className="text-sm text-muted-foreground">
                  Saved preferences are private to your account.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary/10 pt-4 sm:pt-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              Built with <Heart className="inline h-3.5 w-3.5 text-neon-pink" /> for entertainment enthusiasts
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              © {new Date().getFullYear()} WatchVerse · A product of Trynoryvex.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
