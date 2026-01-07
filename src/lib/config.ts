// Application Configuration
export const APP_CONFIG = {
  // Domain and URLs
  domain: 'aurelia-market.com',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://aurelia-market.com',
  
  // Contact Information
  supportEmail: 'info@aurelia-market.com',
  adminEmail: 'ngabulokana75@gmail.com',
  
  // Business Information
  companyName: 'Aurelia Market',
  companyDescription: 'Din destination för exklusiva produkter av högsta kvalitet',
  
  // Support Hours
  supportHours: 'Mån-Fre 09:00-17:00',
  
  // Social Media (update with real links when available)
  socialMedia: {
    facebook: 'https://facebook.com/aureliamarket',
    instagram: 'https://instagram.com/aureliamarket',
    twitter: 'https://twitter.com/aureliamarket',
    linkedin: 'https://linkedin.com/company/aureliamarket',
  },
  
  // Admin Configuration
  admin: {
    allowedEmail: 'ngabulokana75@gmail.com',
    loginPath: '/admin/login',
  },
} as const;

// Helper function to check if email is admin
export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === APP_CONFIG.admin.allowedEmail.toLowerCase();
}

// Helper function to get support email
export function getSupportEmail(): string {
  return APP_CONFIG.supportEmail;
}

// Helper function to get domain
export function getDomain(): string {
  return APP_CONFIG.domain;
}
