import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const showWelcomeNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Welcome to RadarApp!', {
      body: 'You will now receive updates for your favorite content.',
      icon: '/favicon.ico',
      tag: 'welcome-notification',
    });
  }
};
