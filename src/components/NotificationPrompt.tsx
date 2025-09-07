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
import { showWelcomeNotification } from '@/lib/utils';

interface NotificationPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ open, onOpenChange, onDismiss }) => {
  const { user, setUser } = useUser();

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        if (user) {
          setUser({ ...user, notifications_enabled: true });
        }
        toast.success('Notifications enabled!', {
          description: 'You\'ll now get alerts for new releases.',
        });
        showWelcomeNotification();
      } else {
        toast.error('Permission denied', {
          description: 'You can enable notifications later in settings.',
        });
      }
    }
    onDismiss(); // Dismiss after handling
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
