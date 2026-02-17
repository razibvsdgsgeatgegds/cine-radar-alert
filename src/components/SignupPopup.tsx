import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Film, Tv, Gamepad2, X, Zap, Bell, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import watchverseLogo from '@/assets/watchverse-logo.png';

interface SignupPopupProps {
  onSignup: () => void;
}

export const SignupPopup: React.FC<SignupPopupProps> = ({ onSignup }) => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('signup-popup-dismissed');
    if (wasDismissed) return;

    const timer = setTimeout(() => {
      if (!dismissed) setOpen(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleDismiss = () => {
    setOpen(false);
    setDismissed(true);
    sessionStorage.setItem('signup-popup-dismissed', 'true');
  };

  const handleSignup = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('notification_subscribers').upsert({
        email,
        name: name || null,
        is_active: true,
        notification_type: 'all',
      }, { onConflict: 'email' });

      if (error) throw error;
      toast.success('You\'re in! 🎉', { description: 'You\'ll receive exclusive updates.' });
      setOpen(false);
      sessionStorage.setItem('signup-popup-dismissed', 'true');
      onSignup();
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Something went wrong, try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-card/95 backdrop-blur-xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Join WatchVerse</DialogTitle>
        {/* Gradient top bar */}
        <div className="h-1.5 bg-gradient-to-r from-neon-purple via-neon-pink to-electric-blue" />
        
        <div className="p-6 pt-5 space-y-5">
          {/* Logo + sparkle animation */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img src={watchverseLogo} alt="WatchVerse" className="h-14 w-14 rounded-xl" />
              <div className="absolute -top-1 -right-1 animate-pulse">
                <Sparkles className="h-5 w-5 text-golden" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-neon-purple via-neon-pink to-electric-blue bg-clip-text text-transparent">
              Don't Miss Out! 🎬
            </h2>
          </div>

          {/* Value props */}
          <div className="space-y-3">
            {[
              { icon: <Bell className="h-4 w-4 text-neon-purple" />, text: "Get notified before anyone else" },
              { icon: <Star className="h-4 w-4 text-golden" />, text: "Personalized recommendations just for you" },
              { icon: <Zap className="h-4 w-4 text-electric-blue" />, text: "Track movies, series & games in one place" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-primary/5 rounded-lg px-3 py-2.5 border border-primary/10">
                {item.icon}
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Content type chips */}
          <div className="flex justify-center gap-3">
            <div className="flex items-center gap-1.5 bg-neon-purple/10 rounded-full px-3 py-1 border border-neon-purple/20">
              <Film className="h-3.5 w-3.5 text-neon-purple" />
              <span className="text-xs text-neon-purple font-medium">Movies</span>
            </div>
            <div className="flex items-center gap-1.5 bg-electric-blue/10 rounded-full px-3 py-1 border border-electric-blue/20">
              <Tv className="h-3.5 w-3.5 text-electric-blue" />
              <span className="text-xs text-electric-blue font-medium">Series</span>
            </div>
            <div className="flex items-center gap-1.5 bg-golden/10 rounded-full px-3 py-1 border border-golden/20">
              <Gamepad2 className="h-3.5 w-3.5 text-golden" />
              <span className="text-xs text-golden font-medium">Games</span>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/50 border-primary/20"
            />
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 border-primary/20"
              required
            />
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button 
              onClick={handleSignup}
              disabled={submitting}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {submitting ? 'Joining...' : 'Join Free — Get Updates!'}
            </Button>
            <button 
              onClick={handleDismiss}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              I'll explore first
            </button>
          </div>

          {/* Social proof */}
          <p className="text-center text-xs text-muted-foreground">
            ⚡ Trusted by entertainment lovers worldwide
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
