import { describe, it, expect } from 'vitest';
import {
  customerSchema,
  resourceSchema,
  inventorySchema,
  subscriptionSchema,
  paymentSchema,
  validatePhoneNumber,
  validateEmail,
} from '../lib/validations';

describe('Validation Schemas', () => {
  describe('customerSchema', () => {
    it('accepts valid customer data', () => {
      const validCustomer = {
        name: 'Ahmed Ali',
        phone: '01012345678',
        email: 'test@example.com',
        customerType: 'visitor',
        notes: 'Some notes',
      };

      const result = customerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const invalidCustomer = {
        name: '',
        phone: '01012345678',
        customerType: 'visitor',
      };

      const result = customerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });

    it('rejects name less than 2 characters', () => {
      const invalidCustomer = {
        name: 'A',
        phone: '01012345678',
        customerType: 'visitor',
      };

      const result = customerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });

    it('rejects invalid Egyptian phone number', () => {
      const invalidCustomer = {
        name: 'Ahmed Ali',
        phone: '1234567890', // Invalid format
        customerType: 'visitor',
      };

      const result = customerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });

    it('accepts valid Egyptian phone numbers', () => {
      const validPhones = [
        '01012345678',
        '01112345678',
        '01212345678',
        '01512345678',
      ];

      validPhones.forEach(phone => {
        const customer = {
          name: 'Test Customer',
          phone,
          customerType: 'visitor',
        };

        const result = customerSchema.safeParse(customer);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid email', () => {
      const invalidCustomer = {
        name: 'Ahmed Ali',
        phone: '01012345678',
        email: 'invalid-email',
        customerType: 'visitor',
      };

      const result = customerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });

    it('accepts empty email', () => {
      const validCustomer = {
        name: 'Ahmed Ali',
        phone: '01012345678',
        email: '',
        customerType: 'visitor',
      };

      const result = customerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
    });
  });

  describe('resourceSchema', () => {
    it('accepts valid resource data', () => {
      const validResource = {
        name: 'Desk A1',
        resourceType: 'desk',
        ratePerHour: 50,
      };

      const result = resourceSchema.safeParse(validResource);
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const invalidResource = {
        name: '',
        resourceType: 'desk',
        ratePerHour: 50,
      };

      const result = resourceSchema.safeParse(invalidResource);
      expect(result.success).toBe(false);
    });

    it('rejects negative rate', () => {
      const invalidResource = {
        name: 'Desk A1',
        resourceType: 'desk',
        ratePerHour: -10,
      };

      const result = resourceSchema.safeParse(invalidResource);
      expect(result.success).toBe(false);
    });

    it('rejects rate that is too high', () => {
      const invalidResource = {
        name: 'Desk A1',
        resourceType: 'desk',
        ratePerHour: 100000, // Too high
      };

      const result = resourceSchema.safeParse(invalidResource);
      expect(result.success).toBe(false);
    });

    it('accepts all valid resource types', () => {
      const types = ['seat', 'room', 'desk'];

      types.forEach(type => {
        const resource = {
          name: 'Test Resource',
          resourceType: type,
          ratePerHour: 50,
        };

        const result = resourceSchema.safeParse(resource);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid resource type', () => {
      const invalidResource = {
        name: 'Test Resource',
        resourceType: 'invalid',
        ratePerHour: 50,
      };

      const result = resourceSchema.safeParse(invalidResource);
      expect(result.success).toBe(false);
    });
  });

  describe('inventorySchema', () => {
    it('accepts valid inventory data', () => {
      const validItem = {
        name: 'Coffee',
        category: 'beverage',
        price: 30,
        quantity: 100,
        minStock: 20,
      };

      const result = inventorySchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('rejects negative price', () => {
      const invalidItem = {
        name: 'Coffee',
        category: 'beverage',
        price: -10,
        quantity: 100,
        minStock: 20,
      };

      const result = inventorySchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('rejects negative quantity', () => {
      const invalidItem = {
        name: 'Coffee',
        category: 'beverage',
        price: 30,
        quantity: -5,
        minStock: 20,
      };

      const result = inventorySchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('rejects negative minStock', () => {
      const invalidItem = {
        name: 'Coffee',
        category: 'beverage',
        price: 30,
        quantity: 100,
        minStock: -10,
      };

      const result = inventorySchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('rejects non-integer quantity', () => {
      const invalidItem = {
        name: 'Coffee',
        category: 'beverage',
        price: 30,
        quantity: 10.5, // Not an integer
        minStock: 20,
      };

      const result = inventorySchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });
  });

  describe('subscriptionSchema', () => {
    it('accepts valid subscription data', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const validSubscription = {
        customerId: 'customer-123',
        planType: 'monthly',
        startDate: futureDate.toISOString(),
      };

      const result = subscriptionSchema.safeParse(validSubscription);
      expect(result.success).toBe(true);
    });

    it('rejects past start date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const invalidSubscription = {
        customerId: 'customer-123',
        planType: 'monthly',
        startDate: pastDate.toISOString(),
      };

      const result = subscriptionSchema.safeParse(invalidSubscription);
      expect(result.success).toBe(false);
    });

    it('rejects invalid plan type', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidSubscription = {
        customerId: 'customer-123',
        planType: 'yearly', // Invalid
        startDate: futureDate.toISOString(),
      };

      const result = subscriptionSchema.safeParse(invalidSubscription);
      expect(result.success).toBe(false);
    });

    it('accepts all valid plan types', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const types = ['weekly', 'half-monthly', 'monthly'];

      types.forEach(type => {
        const subscription = {
          customerId: 'customer-123',
          planType: type,
          startDate: futureDate.toISOString(),
        };

        const result = subscriptionSchema.safeParse(subscription);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('paymentSchema', () => {
    it('accepts valid payment data', () => {
      const validPayment = {
        amount: 100,
        method: 'cash',
        date: '2024-01-01',
        notes: 'Test payment',
      };

      const result = paymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('rejects zero amount', () => {
      const invalidPayment = {
        amount: 0,
        method: 'cash',
        date: '2024-01-01',
      };

      const result = paymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });

    it('rejects negative amount', () => {
      const invalidPayment = {
        amount: -50,
        method: 'cash',
        date: '2024-01-01',
      };

      const result = paymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });

    it('accepts all valid payment methods', () => {
      const methods = ['cash', 'card', 'transfer'];

      methods.forEach(method => {
        const payment = {
          amount: 100,
          method,
          date: '2024-01-01',
        };

        const result = paymentSchema.safeParse(payment);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid payment method', () => {
      const invalidPayment = {
        amount: 100,
        method: 'bitcoin',
        date: '2024-01-01',
      };

      const result = paymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });

    it('accepts empty notes', () => {
      const validPayment = {
        amount: 100,
        method: 'cash',
        date: '2024-01-01',
        notes: '',
      };

      const result = paymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });
  });

  describe('validatePhoneNumber', () => {
    it('returns true for valid Egyptian phone numbers', () => {
      const validPhones = [
        '01012345678',
        '01112345678',
        '01212345678',
        '01512345678',
        '201012345678', // With country code
      ];

      validPhones.forEach(phone => {
        expect(validatePhoneNumber(phone)).toBe(true);
      });
    });

    it('returns false for invalid phone numbers', () => {
      const invalidPhones = [
        '1234567890',
        '0101234567', // Too short
        '010123456789', // Too long
        '0101234567a', // Contains letter
      ];

      invalidPhones.forEach(phone => {
        expect(validatePhoneNumber(phone)).toBe(false);
      });
    });

    it('handles phone numbers with spaces and dashes', () => {
      expect(validatePhoneNumber('010-1234-5678')).toBe(true);
      expect(validatePhoneNumber('010 1234 5678')).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('returns true for valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('returns true for empty email', () => {
      expect(validateEmail('')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });
});
