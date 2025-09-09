import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Bell, Calendar, Search, Star, Gamepad2, Film, Tv, Mail, User } from 'lucide-react';
import heroRadar from '@/assets/hero-radar.jpg';

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [feedback, setFeedback] = useState('');
  const { setAuthUser } = useUser();
  const { toast } = useToast();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData.email || !authData.password || (!isLogin && !authData.name)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Simulate authentication
    setAuthUser({
      name: authData.name || 'User',
      email: authData.email,
      isAuthenticated: true
    });

    toast({
      title: isLogin ? "Welcome back!" : "Account created!",
      description: `Successfully ${isLogin ? 'logged in' : 'registered'}. Let's set up your preferences.`
    });
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

  const features = [
    {
      icon: <Bell className="h-8 w-8 text-primary" />,
      title: "Smart Notifications",
      description: "Get personalized alerts for upcoming releases based on your interests"
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Advanced Search",
      description: "Find exactly what you're looking for with our powerful search filters"
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Release Tracking",
      description: "Never miss a release date with our comprehensive tracking system"
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "Personalized Feed",
      description: "Content curated specifically for your tastes and preferences"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  🎬 Never Miss Another Release
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  RadarApp
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Track upcoming movies, TV series, and games based on your interests. 
                  Get personalized notifications and never miss a release.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Movies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tv className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">TV Series</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-medium">Games (Coming Soon)</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroRadar} 
                alt="RadarApp Dashboard Preview" 
                className="rounded-lg shadow-2xl border"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose RadarApp?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the features that make tracking your entertainment effortless
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Games Coming Soon Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <Gamepad2 className="h-8 w-8 text-secondary" />
              <Badge variant="outline" className="text-lg px-4 py-2">
                Coming Soon
              </Badge>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Games Tracking Is Almost Here!
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              We're working hard to bring you comprehensive game release tracking. 
              Soon you'll be able to track upcoming game releases just like movies and TV series.
            </p>
            <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg p-8 border">
              <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                <span className="px-3 py-1 bg-secondary/20 rounded-full">PC Games</span>
                <span className="px-3 py-1 bg-secondary/20 rounded-full">Console Games</span>
                <span className="px-3 py-1 bg-secondary/20 rounded-full">Mobile Games</span>
                <span className="px-3 py-1 bg-secondary/20 rounded-full">Indie Games</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth & Feedback Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Authentication */}
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </CardTitle>
                <CardDescription>
                  {isLogin ? 'Sign in to your account' : 'Create your account to start tracking'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your name"
                          className="pl-10"
                          value={authData.name}
                          onChange={(e) => setAuthData({...authData, name: e.target.value})}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={authData.email}
                        onChange={(e) => setAuthData({...authData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={authData.password}
                      onChange={(e) => setAuthData({...authData, password: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Send Feedback</CardTitle>
                <CardDescription>
                  Help us improve RadarApp with your suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedback} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Your Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Tell us what you think, suggest features, or report issues..."
                      className="min-h-[120px]"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    Send Feedback
                  </Button>
                </form>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Pro tip:</strong> The more specific your feedback, the better we can help you!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 RadarApp. Built with ❤️ for entertainment lovers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;