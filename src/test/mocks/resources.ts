/**
 * Resource Mock Data
 */

import type { Resource, CreateResource } from "@/lib/tauri-api";

/**
 * Sample resources
 */
export const SAMPLE_RESOURCES: Resource[] = [
  {
    id: "660e8400-e29b-41d4-a716-446655440001",
    name: "مقعد 1",
    resourceType: "seat",
    isAvailable: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440002",
    name: "مقعد 2",
    resourceType: "seat",
    isAvailable: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440003",
    name: "مكتب خاص 1",
    resourceType: "desk",
    isAvailable: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440004",
    name: "غرفة اجتماعات A",
    resourceType: "room",
    isAvailable: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440005",
    name: "غرفة اجتماعات B",
    resourceType: "room",
    isAvailable: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

/**
 * Valid create resource inputs
 */
export const VALID_CREATE_INPUTS: CreateResource[] = [
  { name: "مقعد جديد", resourceType: "seat" },
  { name: "مكتب جديد", resourceType: "desk" },
  { name: "غرفة جديدة", resourceType: "room" },
];

/**
 * Invalid create resource inputs
 */
export const INVALID_CREATE_INPUTS = [
  {
    input: { name: "أ", resourceType: "seat" },
    expectedError: "name",
    description: "Name too short",
  },
  {
    input: { name: "مورد", resourceType: "invalid" as any },
    expectedError: "resourceType",
    description: "Invalid resource type",
  },
];

/**
 * Get available resources
 */
export function getAvailableResources(): Resource[] {
  return SAMPLE_RESOURCES.filter((r) => r.isAvailable);
}

/**
 * Get resources by type
 */
export function getResourcesByType(type: "seat" | "desk" | "room"): Resource[] {
  return SAMPLE_RESOURCES.filter((r) => r.resourceType === type);
}
