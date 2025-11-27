import { useTranslations } from '@/contexts/translation-context';

// Common translations hook
export const useCommonTranslations = () => {
  return useTranslations('common');
};

// Navigation translations hook
export const useNavigationTranslations = () => {
  // Use the 'navigation' namespace so keys resolve correctly
  const tNav = useTranslations('navigation');
  return {
    t: (key: string) => tNav(key),
    // Add specific methods for common navigation keys
    header: {
      logo: () => tNav('header.logo'),
      tagline: () => tNav('header.tagline'),
      switchToHosting: () => tNav('header.switchToHosting'),
      switchToTravelling: () => tNav('header.switchToTravelling'),
      adminLogin: () => tNav('header.adminLogin'),
      adminDashboard: () => tNav('header.adminDashboard'),
      goToAdmin: () => tNav('header.goToAdmin'),
    },
    menu: {
      userInformation: () => tNav('menu.userInformation'),
      notifications: () => tNav('menu.notifications'),
      wishlists: () => tNav('menu.wishlists'),
      yourTrips: () => tNav('menu.yourTrips'),
      messages: () => tNav('menu.messages'),
      logIn: () => tNav('menu.logIn'),
      signUp: () => tNav('menu.signUp'),
      logOut: () => tNav('menu.logOut'),
    },
    footer: {
      support: {
        title: () => tNav('footer.support.title'),
        helpCenter: () => tNav('footer.support.helpCenter'),
        airCover: () => tNav('footer.support.airCover'),
        antiDiscrimination: () => tNav('footer.support.antiDiscrimination'),
        disabilitySupport: () => tNav('footer.support.disabilitySupport'),
        cancellationOptions: () => tNav('footer.support.cancellationOptions'),
        reportConcern: () => tNav('footer.support.reportConcern'),
      },
      hosting: {
        title: () => tNav('footer.hosting.title'),
        airbnbYourHome: () => tNav('footer.hosting.airbnbYourHome'),
        airCoverForHosts: () => tNav('footer.hosting.airCoverForHosts'),
        hostingResources: () => tNav('footer.hosting.hostingResources'),
        communityForum: () => tNav('footer.hosting.communityForum'),
        hostingResponsibly: () => tNav('footer.hosting.hostingResponsibly'),
        joinHostingClass: () => tNav('footer.hosting.joinHostingClass'),
      },
      company: {
        title: () => tNav('footer.company.title'),
        newsroom: () => tNav('footer.company.newsroom'),
        newFeatures: () => tNav('footer.company.newFeatures'),
        careers: () => tNav('footer.company.careers'),
        investors: () => tNav('footer.company.investors'),
        giftCards: () => tNav('footer.company.giftCards'),
        emergencyStays: () => tNav('footer.company.emergencyStays'),
      },
      copyright: () => tNav('footer.copyright'),
      language: () => tNav('footer.language'),
      currency: () => tNav('footer.currency'),
    }
  };
};

// Authentication translations hook
export const useAuthTranslations = () => {
  return useTranslations('auth');
};

// Payment translations hook
export const usePaymentTranslations = () => {
  return useTranslations('payment');
};

// Property translations hook
export const usePropertyTranslations = () => {
  return useTranslations('property');
};

// Auction translations hook
export const useAuctionTranslations = () => {
  return useTranslations('auction');
};

// Dashboard translations hook
export const useDashboardTranslations = () => {
  return useTranslations('dashboard');
};

// Host translations hook
export const useHostTranslations = () => {
  return useTranslations('host');
};

// Admin translations hook
export const useAdminTranslations = () => {
  return useTranslations('admin');
};

// Utility hook for formatting messages with parameters
export const useFormattedTranslation = () => {
  const t = useTranslations();
  
  return (key: string, params?: Record<string, string | number>) => {
    // Simple parameter replacement for now
    let result = t(key);
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }
    return result;
  };
};

// Hook for pluralization
export const usePluralTranslation = () => {
  const t = useTranslations();
  
  return (key: string, count: number, params?: Record<string, string | number>) => {
    const pluralKey = count === 1 ? key : `${key}_plural`;
    let result = t(pluralKey);
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }
    return result;
  };
};