/**
 * Session Mock Data
 */

import type { SessionWithDetails, CreateSession } from "@/lib/tauri-api";
import { SAMPLE_CUSTOMERS } from "./customers";
import { SAMPLE_RESOURCES } from "./resources";

/**
 * Sample active sessions
 */
export const SAMPLE_ACTIVE_SESSIONS: SessionWithDetails[] = [
  {
    id: "770e8400-e29b-41d4-a716-446655440001",
    customerId: SAMPLE_CUSTOMERS[0].id,
    customerName: SAMPLE_CUSTOMERS[0].name,
    customerHumanId: SAMPLE_CUSTOMERS[0].humanId,
    resourceId: SAMPLE_RESOURCES[2].id,
    resourceName: SAMPLE_RESOURCES[2].name,
    resourceType: SAMPLE_RESOURCES[2].resourceType,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    endedAt: null,
    durationMinutes: null,
    amount: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440002",
    customerId: SAMPLE_CUSTOMERS[2].id,
    customerName: SAMPLE_CUSTOMERS[2].name,
    customerHumanId: SAMPLE_CUSTOMERS[2].humanId,
    resourceId: SAMPLE_RESOURCES[4].id,
    resourceName: SAMPLE_RESOURCES[4].name,
    resourceType: SAMPLE_RESOURCES[4].resourceType,
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    endedAt: null,
    durationMinutes: null,
    amount: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

/**
 * Sample completed sessions
 */
export const SAMPLE_COMPLETED_SESSIONS: SessionWithDetails[] = [
  {
    id: "770e8400-e29b-41d4-a716-446655440003",
    customerId: SAMPLE_CUSTOMERS[1].id,
    customerName: SAMPLE_CUSTOMERS[1].name,
    customerHumanId: SAMPLE_CUSTOMERS[1].humanId,
    resourceId: SAMPLE_RESOURCES[0].id,
    resourceName: SAMPLE_RESOURCES[0].name,
    resourceType: SAMPLE_RESOURCES[0].resourceType,
    startedAt: "2024-12-01T10:00:00Z",
    endedAt: "2024-12-01T13:00:00Z",
    durationMinutes: 180,
    amount: 150,
    createdAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440004",
    customerId: SAMPLE_CUSTOMERS[3].id,
    customerName: SAMPLE_CUSTOMERS[3].name,
    customerHumanId: SAMPLE_CUSTOMERS[3].humanId,
    resourceId: SAMPLE_RESOURCES[3].id,
    resourceName: SAMPLE_RESOURCES[3].name,
    resourceType: SAMPLE_RESOURCES[3].resourceType,
    startedAt: "2024-12-02T14:00:00Z",
    endedAt: "2024-12-02T16:30:00Z",
    durationMinutes: 150,
    amount: 375,
    createdAt: "2024-12-02T14:00:00Z",
  },
];

/**
 * All sample sessions
 */
export const SAMPLE_SESSIONS: SessionWithDetails[] = [
  ...SAMPLE_ACTIVE_SESSIONS,
  ...SAMPLE_COMPLETED_SESSIONS,
];

/**
 * Valid create session inputs
 */
export const VALID_CREATE_INPUTS: CreateSession[] = [
  {
    customerId: SAMPLE_CUSTOMERS[1].id,
    resourceId: SAMPLE_RESOURCES[0].id,
  },
  {
    customerId: SAMPLE_CUSTOMERS[3].id,
    resourceId: SAMPLE_RESOURCES[1].id,
  },
];

/**
 * Invalid create session inputs
 */
export const INVALID_CREATE_INPUTS = [
  {
    input: { customerId: "", resourceId: SAMPLE_RESOURCES[0].id },
    expectedError: "customerId",
    description: "Empty customer ID",
  },
  {
    input: { customerId: SAMPLE_CUSTOMERS[0].id, resourceId: "" },
    expectedError: "resourceId",
    description: "Empty resource ID",
  },
  {
    input: { customerId: "invalid-uuid", resourceId: SAMPLE_RESOURCES[0].id },
    expectedError: "customerId",
    description: "Invalid customer UUID",
  },
];

/**
 * Calculate session amount
 */
export function calculateSessionAmount(
  startedAt: string,
  endedAt: string,
  ratePerHour: number,
): number {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  const hours = (end - start) / (1000 * 60 * 60);
  return Math.ceil(hours * ratePerHour);
}
