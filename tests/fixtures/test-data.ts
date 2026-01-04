import { test as base } from "@playwright/test";

type CustomerData = {
  name: string;
  phone: string;
  email?: string;
  customerType: string;
  notes?: string;
};

type TestFixtures = {
  customerData: CustomerData;
};

export const test = base.extend<TestFixtures>({
  customerData: async ({}, use) => {
    const timestamp = Date.now();
    const data: CustomerData = {
      name: `Test Customer ${timestamp}`,
      phone: `+1234567${timestamp.toString().slice(-4)}`,
      email: `test${timestamp}@example.com`,
      customerType: "visitor",
      notes: `Test note created at ${new Date().toISOString()}`,
    };
    await use(data);
  },
});

export const expect = test.expect;
