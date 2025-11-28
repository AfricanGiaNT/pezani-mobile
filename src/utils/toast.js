import { toast as sonnerToast } from 'sonner';
/**
 * Toast notification utilities for user feedback
 * Uses Sonner for beautiful, accessible toast notifications
 */
export const toast = {
    success: (message, description) => {
        sonnerToast.success(message, {
            description,
            duration: 4000,
        });
    },
    error: (message, description) => {
        sonnerToast.error(message, {
            description,
            duration: 5000,
        });
    },
    warning: (message, description) => {
        sonnerToast.warning(message, {
            description,
            duration: 4000,
        });
    },
    info: (message, description) => {
        sonnerToast.info(message, {
            description,
            duration: 3000,
        });
    },
    loading: (message) => {
        return sonnerToast.loading(message);
    },
    promise: (promise, { loading, success, error, }) => {
        return sonnerToast.promise(promise, {
            loading,
            success,
            error,
        });
    },
};
// Export individual methods for direct import
export const { success, error, warning, info, loading, promise } = toast;
