// Enhanced notification utilities with service worker support

export class NotificationService {
  private static serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  // Register service worker for background notifications
  static async registerServiceWorker() {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.serviceWorkerRegistration = registration;
        console.log('Service Worker registered successfully');
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  // Request notification permission and show welcome notification
  static async requestPermissionAndWelcome() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Show immediate welcome notification
        await this.showWelcomeNotification();
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Show welcome notification when permission is granted
  static async showWelcomeNotification() {
    const title = '🎬 Ready to Go!';
    const body = 'You\'ll now receive notifications for new movie and series releases. Welcome aboard!';
    const options = {
      icon: '/favicon.ico',
      tag: 'welcome-notification',
      badge: '/favicon.ico',
      requireInteraction: false,
      silent: false
    };

    // Try to use service worker first for better reliability
    if (this.serviceWorkerRegistration && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: { title, body, icon: options.icon, tag: options.tag }
      });
    } else {
      // Fallback to direct notification
      new Notification(title, {
        body,
        icon: options.icon,
        tag: options.tag,
        badge: options.badge
      });
    }
  }

  // Send notification for content releases (works even when site is closed)
  static async sendReleaseNotification(contentTitle: string, contentType: 'movie' | 'series' | 'game', releaseDate?: string) {
    if (Notification.permission !== 'granted') {
      return false;
    }

    const title = `🎬 New ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Released!`;
    const body = `${contentTitle}${releaseDate ? ` is now available (Released: ${releaseDate})` : ' is now available!'}`;
    const options = {
      icon: '/favicon.ico',
      tag: `release-${contentType}-${Date.now()}`,
      badge: '/favicon.ico',
      requireInteraction: true, // Keep notification visible until user interacts
      actions: [
        {
          action: 'view',
          title: 'View Details'
        }
      ]
    };

    // Use service worker for background notifications
    if (this.serviceWorkerRegistration && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: { title, body, icon: options.icon, tag: options.tag }
      });
    } else {
      // Fallback to direct notification
      new Notification(title, {
        body,
        icon: options.icon,
        tag: options.tag,
        badge: options.badge,
        requireInteraction: options.requireInteraction
      });
    }

    return true;
  }

  // Check if notifications are supported and enabled
  static isNotificationSupported() {
    return 'Notification' in window;
  }

  static isNotificationEnabled() {
    return Notification.permission === 'granted';
  }

  // Initialize the notification service
  static async initialize() {
    // Register service worker
    await this.registerServiceWorker();
    
    // Set up notification click handler
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          // Handle notification click - could navigate to specific content
          console.log('Notification clicked:', event.data);
        }
      });
    }
  }
}

// Legacy function for backward compatibility
export const showWelcomeNotification = () => {
  NotificationService.showWelcomeNotification();
};