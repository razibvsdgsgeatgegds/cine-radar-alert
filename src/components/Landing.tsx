import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Calendar, Search, Star, Gamepad2, Film, Tv, Mail, User, Sparkles, Zap, Heart, Chrome, Eye, Users, TrendingUp, Globe } from 'lucide-react';
import heroRadar from '@/assets/hero-radar.jpg';
import watchverseLogo from '@/assets/watchverse-logo.png';

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
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
      // Generate or retrieve a visitor ID
      let visitorId = localStorage.getItem('watchverse-visitor-id');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('watchverse-visitor-id', visitorId);
      }

      // Log this visit
      await supabase.from('site_visits').insert({
        visitor_id: visitorId,
        page: '/'
      });
    };

    const fetchStats = async () => {
      // Get visitors in the last 5 minutes (live visitors)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: liveCount } = await supabase
        .from('site_visits')
        .select('visitor_id', { count: 'exact', head: true })
        .gte('visited_at', fiveMinutesAgo);
      
      // Get unique total visitors
      const { data: uniqueVisitors } = await supabase
        .from('site_visits')
        .select('visitor_id')
        .limit(1000);
      
      const uniqueSet = new Set(uniqueVisitors?.map(v => v.visitor_id) || []);
      
      // Get total visits
      const { count: totalCount } = await supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true });

      setLiveVisitors(Math.max(liveCount || 1, 1));
      setTotalUsers(uniqueSet.size || 1);
      setTotalVisits(totalCount || 1);
    };

    trackVisit();
    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearUser();
      } else if (session) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
        
        const lastLoginKey = `radar-last-login-${email}`;
        const previousLogin = localStorage.getItem(lastLoginKey);
        const hasPrefs = localStorage.getItem(`radar-user-${email}`) || localStorage.getItem('radar-user');
        
        setAuthUser({
          name,
          email,
          isAuthenticated: true
        });
        
        // If user has logged in before and has prefs, show welcome back
        if (previousLogin && hasPrefs) {
          const lastDate = new Date(previousLogin);
          const formattedDate = lastDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          toast({
            title: `Welcome back, ${name}! 👋`,
            description: `Last login: ${formattedDate}`,
          });
        }
        
        // If returning user (has previous login) but no local prefs (e.g. new device/browser),
        // auto-create minimal prefs so they skip onboarding
        if (previousLogin && !hasPrefs) {
          const minimalPrefs = {
            name,
            email,
            gender: '',
            age: 0,
            location: { country: '' },
            interests: { movies: [], series: [], games: [] },
            notifications_enabled: false,
            languages: [],
            industries: [],
            platforms: [],
            notification_list: [],
          };
          localStorage.setItem(`radar-user-${email}`, JSON.stringify(minimalPrefs));
          // Force a re-render by setting user in context
          setUser(minimalPrefs as any);
          toast({
            title: `Welcome back, ${name}! 👋`,
            description: "Your preferences were restored.",
          });
        }
        
        // Save current login time for next session
        localStorage.setItem(lastLoginKey, new Date().toISOString());
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
        const lastLoginKey = `radar-last-login-${email}`;
        const previousLogin = localStorage.getItem(lastLoginKey);
        const hasPrefs = localStorage.getItem(`radar-user-${email}`) || localStorage.getItem('radar-user');
        
        setAuthUser({
          name,
          email,
          isAuthenticated: true
        });
        
        // Same logic: if returning user without local prefs, auto-create them
        if (previousLogin && !hasPrefs) {
          const minimalPrefs = {
            name,
            email,
            gender: '',
            age: 0,
            location: { country: '' },
            interests: { movies: [], series: [], games: [] },
            notifications_enabled: false,
            languages: [],
            industries: [],
            platforms: [],
            notification_list: [],
          };
          localStorage.setItem(`radar-user-${email}`, JSON.stringify(minimalPrefs));
          setUser(minimalPrefs as any);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuthUser, setUser, toast]);

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
      // Bypass auth-bridge to prevent localhost:3000 redirect
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

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    toast({
      title: "Feedback Sent!",
      description: "Thank you for your feedback. We'll review it soon!"
    });
    setFeedback('');
  };

  const scrollToSignup = () => {
    const authSection = document.querySelector('#auth-section');
    if (authSection) {
      authSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const features = [
    {
      icon: <Bell className="h-8 w-8 text-neon-purple drop-shadow-lg" />,
      title: "Smart Notifications",
      description: "Get personalized alerts for upcoming releases based on your interests",
      gradient: "from-neon-purple to-neon-pink"
    },
    {
      icon: <Search className="h-8 w-8 text-electric-blue drop-shadow-lg" />,
      title: "Advanced Search",
      description: "Find exactly what you're looking for with our powerful search filters",
      gradient: "from-electric-blue to-neon-cyan"
    },
    {
      icon: <Calendar className="h-8 w-8 text-golden drop-shadow-lg" />,
      title: "Release Tracking",
      description: "Never miss a release date with our comprehensive tracking system",
      gradient: "from-golden to-accent"
    },
    {
      icon: <Star className="h-8 w-8 text-neon-pink drop-shadow-lg" />,
      title: "Personalized Feed",
      description: "Content curated specifically for your tastes and preferences",
      gradient: "from-neon-pink to-neon-purple"
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-electric-blue/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 border-b border-primary/10 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={watchverseLogo} alt="WatchVerse Logo" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-electric-blue bg-clip-text text-transparent">
              WatchVerse
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-card/50 rounded-full px-3 py-1.5 border border-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>{liveVisitors} online</span>
            </div>
            <Button onClick={scrollToSignup} size="sm" className="bg-gradient-primary hover:shadow-glow transition-all">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-transparent to-electric-blue/10" />
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
              <div className="space-y-6">
                <Badge variant="secondary" 
                       className="w-fit bg-gradient-primary text-primary-foreground border-0 shadow-glow">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Never Miss Another Release
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
                  <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-electric-blue bg-clip-text text-transparent">
                    Watch
                  </span>
                  <span className="bg-gradient-to-r from-electric-blue to-neon-cyan bg-clip-text text-transparent">
                    Verse
                  </span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  Your personal entertainment universe. Track upcoming movies, TV series, and games with 
                  <span className="text-neon-cyan font-semibold"> AI-powered recommendations</span> and 
                  <span className="text-neon-pink font-semibold"> smart notifications</span>.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6">
                <div className="flex items-center gap-2 sm:gap-3 bg-card/50 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 border border-primary/30">
                  <Film className="h-4 sm:h-5 w-4 sm:w-5 text-neon-purple" />
                  <span className="text-xs sm:text-sm font-medium">Movies</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-card/50 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 border border-electric-blue/30">
                  <Tv className="h-4 sm:h-5 w-4 sm:w-5 text-electric-blue" />
                  <span className="text-xs sm:text-sm font-medium">TV Series</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-card/50 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 border border-golden/30">
                  <Gamepad2 className="h-4 sm:h-5 w-4 sm:w-5 text-golden" />
                  <span className="text-xs sm:text-sm font-medium">Games (Soon)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={scrollToSignup}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={scrollToSignup}
                  className="border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  Start Your Journey
                </Button>
              </div>
            </div>
            
            <div className="relative group order-1 lg:order-2">
              <div className="absolute -inset-1 bg-gradient-primary rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src={heroRadar} 
                alt="WatchVerse Dashboard Preview" 
                className="relative rounded-lg shadow-card border border-primary/20 w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-12 sm:py-16 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-neon-cyan to-electric-blue bg-clip-text text-transparent">
                Join Our Growing Community
              </span>
            </h2>
            <p className="text-muted-foreground">Real-time platform stats</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <Card className="text-center bg-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow">
              <CardContent className="pt-6 pb-4">
                <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-xl flex items-center justify-center border border-green-500/30">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatNumber(liveVisitors)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Live Visitors</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow">
              <CardContent className="pt-6 pb-4">
                <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-neon-purple/20 to-neon-pink/10 rounded-xl flex items-center justify-center border border-neon-purple/30">
                  <Users className="h-5 w-5 text-neon-purple" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatNumber(totalUsers)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Unique Visitors</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow">
              <CardContent className="pt-6 pb-4">
                <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/10 rounded-xl flex items-center justify-center border border-electric-blue/30">
                  <Eye className="h-5 w-5 text-electric-blue" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatNumber(totalVisits)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total Visits</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow">
              <CardContent className="pt-6 pb-4">
                <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-golden/20 to-accent/10 rounded-xl flex items-center justify-center border border-golden/30">
                  <Globe className="h-5 w-5 text-golden" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">24/7</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Always Online</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">
              <span className="bg-gradient-to-r from-neon-purple to-electric-blue bg-clip-text text-transparent">
                Why Choose WatchVerse?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Discover the cutting-edge features that make tracking your entertainment 
              <span className="text-neon-cyan"> effortless</span> and 
              <span className="text-neon-pink"> exciting</span>
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} 
                    className="text-center group hover:shadow-glow transition-all duration-500 bg-card/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/60 transform hover:scale-105">
                <CardHeader className="pb-4">
                  <div className={`mx-auto mb-4 p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl w-fit shadow-neon group-hover:shadow-glow transition-all duration-300 border-2 border-primary/30`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Games Coming Soon Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-golden/5 to-neon-pink/5 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-4 mb-8 bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 border border-golden/30">
              <Gamepad2 className="h-8 w-8 text-golden animate-pulse" />
              <Badge variant="outline" 
                     className="text-lg px-6 py-2 bg-gradient-to-r from-golden to-neon-pink text-transparent bg-clip-text border-golden/50">
                Coming Soon
              </Badge>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-golden via-neon-pink to-neon-purple bg-clip-text text-transparent">
                Games Tracking Is Almost Here!
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
              We're crafting the ultimate gaming experience tracker. Soon you'll discover, track, and get notified about 
              <span className="text-golden font-semibold"> every game release</span> that matches your taste.
            </p>
            <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-2xl p-8 border border-golden/20 shadow-glow">
              <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                <span className="px-4 py-2 bg-gradient-to-r from-golden/20 to-golden/10 rounded-full border border-golden/30 text-golden">
                  <Gamepad2 className="h-4 w-4 inline mr-2" />
                  PC Games
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-electric-blue/20 to-electric-blue/10 rounded-full border border-electric-blue/30 text-electric-blue">
                  🎮 Console Games
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-neon-pink/20 to-neon-pink/10 rounded-full border border-neon-pink/30 text-neon-pink">
                  📱 Mobile Games
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-neon-purple/20 to-neon-purple/10 rounded-full border border-neon-purple/30 text-neon-purple">
                  💎 Indie Games
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="py-20 relative scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-electric-blue/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-md mx-auto">
            <Card className="shadow-glow bg-card/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <img src={watchverseLogo} alt="WatchVerse" className="h-16 w-16 mx-auto rounded-xl" />
                </div>
                <CardTitle className="text-3xl bg-gradient-to-r from-neon-purple to-electric-blue bg-clip-text text-transparent">
                  {isLogin ? 'Welcome Back' : 'Join WatchVerse'}
                </CardTitle>
                <CardDescription className="text-lg">
                  {isLogin ? 'Sign in to continue your entertainment journey' : 'Start tracking your favorite content today'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 shadow-sm"
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

                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          className="pl-10 bg-input/50 border-primary/20 focus:border-primary/50"
                          value={authData.name}
                          onChange={(e) => setAuthData({...authData, name: e.target.value})}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 bg-input/50 border-primary/20 focus:border-primary/50"
                        value={authData.email}
                        onChange={(e) => setAuthData({...authData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-input/50 border-primary/20 focus:border-primary/50"
                      value={authData.password}
                      onChange={(e) => setAuthData({...authData, password: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                
                <div className="text-center">
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
      <footer className="py-12 border-t border-primary/20 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={watchverseLogo} alt="WatchVerse" className="h-8 w-8 rounded-lg" />
            <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-electric-blue bg-clip-text text-transparent">
              WatchVerse
            </h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Built with <Heart className="inline h-4 w-4 text-neon-pink mx-1" /> for entertainment enthusiasts worldwide
          </p>
          <p className="text-sm text-muted-foreground/70">
            © 2025 WatchVerse. Your entertainment universe is always expanding.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
