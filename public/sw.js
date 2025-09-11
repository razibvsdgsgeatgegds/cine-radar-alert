// Service Worker for background notifications
const CACHE_NAME = 'cine-radar-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Background notification handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open or focus the app when notification is clicked
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clients) {
        if (client.url === self.registration.scope && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab with the target URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(self.registration.scope);
      }
    })
  );
});

// Listen for messages from the main thread to show notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag } = event.data.payload;
    
    self.registration.showNotification(title, {
      body,
      icon: icon || '/favicon.ico',
      tag,
      badge: '/favicon.ico',
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        }
      ]
    });
  }
});

// Handle push events for future server-sent notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'release-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});