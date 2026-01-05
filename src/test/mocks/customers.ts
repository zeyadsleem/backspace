/**
 * Customer Mock Data
 *
 * Realistic Egyptian customer data for testing
 */

import type { Customer, CreateCustomer } from "@/lib/tauri-api";

/**
 * Valid Egyptian phone numbers for testing
 */
export const VALID_PHONES = {
  vodafone: "01012345678",
  etisalat: "01112345678",
  orange: "01212345678",
  we: "01512345678",
  withCountryCode: "+201012345678",
  withSpaces: "010 1234 5678",
};

/**
 * Invalid phone numbers for testing
 */
export const INVALID_PHONES = {
  tooShort: "0101234567",
  tooLong: "010123456789",
  wrongPrefix: "01312345678",
  nonEgyptian: "+1234567890",
  letters: "010abc45678",
  empty: "",
};

/**
 * Valid Egyptian National IDs for testing
 * Format: C YYMMDD GG SSSS D
 * - C: Century (2=1900s, 3=2000s)
 * - YYMMDD: Birth date
 * - GG: Governorate code
 * - SSSS: Sequence (odd=male, even=female)
 * - D: Check digit
 */
export const VALID_NATIONAL_IDS = {
  maleCairo1990: "29001150100011", // Male (odd: 0001), Jan 15, 1990, Cairo (01)
  femaleAlex1985: "28503200200020", // Female (even: 0002), Mar 20, 1985, Alexandria (02)
  maleGiza2000: "30006152100031", // Male (odd: 0003), Jun 15, 2000, Giza (21)
};

/**
 * Invalid National IDs for testing
 */
export const INVALID_NATIONAL_IDS = {
  tooShort: "2900115010000",
  tooLong: "290011501000011",
  wrongCentury: "19001150100001",
  invalidMonth: "29013150100001",
  invalidDay: "29001320100001",
  invalidGovernorate: "29001159900001",
  empty: "",
};

/**
 * Valid emails for testing
 */
export const VALID_EMAILS = {
  simple: "test@example.com",
  withSubdomain: "test@mail.example.com",
  withPlus: "test+tag@example.com",
  arabic: "مستخدم@example.com", // Note: May not be supported everywhere
};

/**
 * Invalid emails for testing
 */
export const INVALID_EMAILS = {
  noAt: "testexample.com",
  noDomain: "test@",
  noTld: "test@example",
  consecutiveDots: "test..user@example.com",
  tooLong: "a".repeat(255) + "@example.com",
};

/**
 * Sample customer data
 */
export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    humanId: "C0001",
    name: "أحمد محمد علي",
    phone: "+201012345678",
    email: "ahmed@example.com",
    customerType: "member",
    notes: "عميل مميز",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    humanId: "C0002",
    name: "فاطمة أحمد حسن",
    phone: "+201112345678",
    email: "fatma@example.com",
    customerType: "visitor",
    notes: undefined,
    createdAt: "2024-02-20T14:45:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    humanId: "C0003",
    name: "محمود سعيد إبراهيم",
    phone: "+201212345678",
    email: undefined,
    customerType: "member",
    notes: "يفضل المكتب رقم 5",
    createdAt: "2024-03-10T09:15:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    humanId: "C0004",
    name: "نورا عبدالله محمد",
    phone: "+201512345678",
    email: "noura@example.com",
    customerType: "visitor",
    notes: undefined,
    createdAt: "2024-04-05T16:20:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    humanId: "C0005",
    name: "يوسف حسين أحمد",
    phone: "+201023456789",
    email: "youssef@example.com",
    customerType: "member",
    notes: "اشتراك شهري",
    createdAt: "2024-05-12T11:00:00Z",
  },
];

/**
 * Valid create customer inputs
 */
export const VALID_CREATE_INPUTS: CreateCustomer[] = [
  {
    name: "عميل جديد",
    phone: "01012345678",
    email: "new@example.com",
    customerType: "visitor",
    notes: "ملاحظات اختبارية",
  },
  {
    name: "مشترك جديد",
    phone: "+201112345678",
    email: undefined,
    customerType: "member",
    notes: undefined,
  },
];

/**
 * Invalid create customer inputs (for error testing)
 */
export const INVALID_CREATE_INPUTS = [
  {
    input: { name: "أ", phone: "01012345678", customerType: "visitor" },
    expectedError: "name",
    description: "Name too short",
  },
  {
    input: { name: "عميل", phone: "0101234567", customerType: "visitor" },
    expectedError: "phone",
    description: "Phone too short",
  },
  {
    input: { name: "عميل", phone: "01312345678", customerType: "visitor" },
    expectedError: "phone",
    description: "Invalid phone prefix",
  },
  {
    input: { name: "عميل", phone: "01012345678", email: "invalid", customerType: "visitor" },
    expectedError: "email",
    description: "Invalid email format",
  },
  {
    input: { name: "عميل", phone: "01012345678", customerType: "invalid" as any },
    expectedError: "customerType",
    description: "Invalid customer type",
  },
];

/**
 * Generate random valid customer
 */
export function generateRandomCustomer(): CreateCustomer {
  const names = [
    "أحمد محمد",
    "فاطمة علي",
    "محمود حسن",
    "نورا سعيد",
    "يوسف إبراهيم",
    "سارة أحمد",
    "عمر خالد",
    "مريم محمود",
  ];

  const prefixes = ["010", "011", "012", "015"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");

  return {
    name: names[Math.floor(Math.random() * names.length)],
    phone: prefix + number,
    email: Math.random() > 0.5 ? `test${Date.now()}@example.com` : undefined,
    customerType: Math.random() > 0.5 ? "member" : "visitor",
    notes: Math.random() > 0.7 ? "ملاحظات عشوائية" : undefined,
  };
}
