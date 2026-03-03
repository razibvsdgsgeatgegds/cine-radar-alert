import emailjs from '@emailjs/browser';

// EmailJS public keys - safe to store in code (these are publishable)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export const EmailService = {
  /**
   * Send a welcome email after onboarding
   */
  sendWelcomeEmail: async (toEmail: string, toName: string) => {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS not configured. Skipping welcome email.');
      return false;
    }
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: toEmail,
        to_name: toName || 'Friend',
        subject: '🎬 Welcome to WatchVerse!',
        message: `Hey ${toName || 'there'}! Welcome to WatchVerse — your personal entertainment universe. Start exploring upcoming movies, series, and soon games! Visit: https://watchversea.lovable.app`,
      });
      return true;
    } catch (error) {
      console.error('EmailJS send failed:', error);
      return false;
    }
  },

  /**
   * Send a notification email (game launch, promo, etc.)
   */
  sendNotificationEmail: async (toEmail: string, toName: string, subject: string, message: string) => {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS not configured. Skipping notification email.');
      return false;
    }
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: toEmail,
        to_name: toName || 'Friend',
        subject,
        message,
      });
      return true;
    } catch (error) {
      console.error('EmailJS send failed:', error);
      return false;
    }
  },
};
