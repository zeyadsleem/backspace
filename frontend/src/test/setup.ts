import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Wails runtime
vi.mock('../../wailsjs/runtime', () => ({
  EventsOn: vi.fn(),
  EventsOff: vi.fn(),
  EventsEmit: vi.fn(),
}));

// Mock Wails Go bindings
vi.mock('../../wailsjs/go/main/App', () => ({
  GetCustomers: vi.fn(),
  AddCustomer: vi.fn(),
  UpdateCustomer: vi.fn(),
  DeleteCustomer: vi.fn(),
  GetResources: vi.fn(),
  AddResource: vi.fn(),
  GetInventory: vi.fn(),
  AddInventory: vi.fn(),
  GetActiveSessions: vi.fn(),
  StartSession: vi.fn(),
  EndSession: vi.fn(),
  GetSubscriptions: vi.fn(),
  AddSubscription: vi.fn(),
  GetInvoices: vi.fn(),
  ProcessPayment: vi.fn(),
  GetDashboardMetrics: vi.fn(),
  GetSettings: vi.fn(),
  UpdateSettings: vi.fn(),
}));
