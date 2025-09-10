import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const showWelcomeNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🎬 You are ready to start!', {
      body: 'Start adding movies & series to your list to get notified about new releases.',
      icon: '/favicon.ico',
      tag: 'welcome-notification',
    });
  }
};
