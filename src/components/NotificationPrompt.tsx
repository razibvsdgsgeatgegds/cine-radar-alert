import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/sonner';
import { useUser } from '@/contexts/UserContext';
import { BellRing } from 'lucide-react';
import { NotificationService } from '@/utils/notifications';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ open, onOpenChange, onDismiss }) => {
  const { user, setUser, authUser } = useUser();

  const handleEnableNotifications = async () => {
    const success = await NotificationService.requestPermissionAndWelcome();
    
    if (success) {
      if (user) {
        setUser({ ...user, notifications_enabled: true });
      }

      // Save subscriber to database
      try {
        let supaUserId: string | null = null;
        try {
          const { data: { user: supaUser } } = await supabase.auth.getUser();
          supaUserId = supaUser?.id || null;
        } catch {}
        
        const email = authUser?.email || user?.email || '';
        const name = authUser?.name || user?.name || '';
        
        if (email) {
          const { error: upsertError } = await supabase.from('notification_subscribers').upsert({
            email,
            name,
            user_id: supaUserId,
            is_active: true,
            notification_type: 'all',
          }, { onConflict: 'email' });
          if (upsertError) console.error('Upsert error:', upsertError);
        }
      } catch (err) {
        console.error('Failed to save notification subscription:', err);
      }

      toast.success('Notifications enabled!', {
        description: 'You\'ll get alerts even when the app is closed.',
      });
    } else {
      toast.error('Permission denied', {
        description: 'You can enable notifications later in settings.',
      });
    }
    onDismiss();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <BellRing className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">Stay in the Loop!</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Enable browser notifications to get instant alerts when movies and series you're tracking are released. Don't miss out!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel onClick={onDismiss}>Maybe Later</AlertDialogCancel>
          <AlertDialogAction onClick={handleEnableNotifications}>
            Enable Notifications
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
