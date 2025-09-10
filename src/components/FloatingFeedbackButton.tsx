import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Send, X } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const FloatingFeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { authUser } = useUser();

  // Auto-fill user data if available
  React.useEffect(() => {
    if (authUser && isOpen) {
      setFeedback(prev => ({
        ...prev,
        name: prev.name || authUser.name || '',
        email: prev.email || authUser.email || ''
      }));
    }
  }, [authUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.name.trim() || !feedback.email.trim() || !feedback.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{
          name: feedback.name.trim(),
          email: feedback.email.trim(),
          message: feedback.message.trim()
        }]);

      if (error) throw error;

      toast.success('Feedback sent successfully!', {
        description: 'Thank you for your feedback. We\'ll review it soon!'
      });
      
      setFeedback({ name: '', email: '', message: '' });
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to send feedback', {
        description: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-110 shadow-xl"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Feedback Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-primary to-neon-pink bg-clip-text text-transparent flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Send Feedback
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-name">Name</Label>
              <Input
                id="feedback-name"
                type="text"
                placeholder="Your name"
                value={feedback.name}
                onChange={(e) => setFeedback(prev => ({ ...prev, name: e.target.value }))}
                className="bg-input/50 border-primary/20 focus:border-primary/50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback-email">Email</Label>
              <Input
                id="feedback-email"
                type="email"
                placeholder="your@email.com"
                value={feedback.email}
                onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                className="bg-input/50 border-primary/20 focus:border-primary/50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback-message">Message</Label>
              <Textarea
                id="feedback-message"
                placeholder="Tell us what you think about RadarApp..."
                className="min-h-[100px] bg-input/50 border-primary/20 focus:border-primary/50 resize-none"
                value={feedback.message}
                onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                required
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-primary hover:shadow-glow"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Feedback'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};