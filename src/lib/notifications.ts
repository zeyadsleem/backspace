import { toast } from "react-hot-toast";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationOptions {
  duration?: number;
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
  icon?: string;
}

class NotificationService {
  private readonly defaultOptions: NotificationOptions = {
    duration: 4000,
    position: "top-right",
  };

  success(message: string, options?: NotificationOptions) {
    return toast.success(message, {
      ...this.defaultOptions,
      ...options,
      icon: options?.icon || "✅",
    });
  }

  error(message: string, options?: NotificationOptions) {
    return toast.error(message, {
      ...this.defaultOptions,
      ...options,
      duration: options?.duration || 6000,
      icon: options?.icon || "❌",
    });
  }

  warning(message: string, options?: NotificationOptions) {
    return toast(message, {
      ...this.defaultOptions,
      ...options,
      icon: options?.icon || "⚠️",
      style: {
        background: "#f59e0b",
        color: "#ffffff",
      },
    });
  }

  info(message: string, options?: NotificationOptions) {
    return toast(message, {
      ...this.defaultOptions,
      ...options,
      icon: options?.icon || "ℹ️",
      style: {
        background: "#3b82f6",
        color: "#ffffff",
      },
    });
  }

  loading(message: string) {
    return toast.loading(message, {
      ...this.defaultOptions,
    });
  }

  dismiss(toastId?: string) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  // Business-specific notifications
  customerCreated(customerName: string) {
    return this.success(`Customer "${customerName}" created successfully`);
  }

  customerUpdated(customerName: string) {
    return this.success(`Customer "${customerName}" updated successfully`);
  }

  customerDeleted(customerName: string) {
    return this.success(`Customer "${customerName}" deleted successfully`);
  }

  sessionStarted(customerName: string, resourceName: string) {
    return this.success(`Session started for ${customerName} on ${resourceName}`);
  }

  sessionEnded(customerName: string, amount: number) {
    return this.success(`Session ended for ${customerName}. Total: ${amount} EGP`);
  }

  paymentRecorded(amount: number) {
    return this.success(`Payment of ${amount} EGP recorded successfully`);
  }

  inventoryLow(itemName: string, quantity: number) {
    return this.warning(`Low stock alert: ${itemName} (${quantity} remaining)`);
  }

  subscriptionCreated(customerName: string, planType: string) {
    return this.success(`${planType} subscription created for ${customerName}`);
  }

  validationError(message: string) {
    return this.error(`Validation Error: ${message}`);
  }

  networkError() {
    return this.error("Network error. Please check your connection.");
  }

  unexpectedError() {
    return this.error("An unexpected error occurred. Please try again.");
  }
}

export const notifications = new NotificationService();

// React Hook for notifications
export function useNotifications() {
  return notifications;
}
