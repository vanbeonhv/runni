import { toast as sonnerToast } from 'sonner';

// Re-export toast with custom defaults
export const toast = {
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => {
    return sonnerToast.success(message, {
      duration: 3000,
      position: 'top-center',
      ...options,
    });
  },

  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => {
    return sonnerToast.error(message, {
      duration: 4000,
      position: 'top-center',
      ...options,
    });
  },

  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
    return sonnerToast.info(message, {
      duration: 3000,
      position: 'top-center',
      ...options,
    });
  },

  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => {
    return sonnerToast.warning(message, {
      duration: 3000,
      position: 'top-center',
      ...options,
    });
  },

  loading: (message: string, options?: Parameters<typeof sonnerToast.loading>[1]) => {
    return sonnerToast.loading(message, {
      position: 'top-center',
      ...options,
    });
  },

  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
};
