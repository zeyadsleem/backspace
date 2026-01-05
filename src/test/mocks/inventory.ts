/**
 * Inventory Mock Data
 */

import type { Inventory, CreateInventory } from "@/lib/tauri-api";

/**
 * Sample inventory items
 */
export const SAMPLE_INVENTORY: Inventory[] = [
  {
    id: "880e8400-e29b-41d4-a716-446655440001",
    name: "قهوة",
    quantity: 50,
    minStock: 10,
    price: 25,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440002",
    name: "شاي",
    quantity: 100,
    minStock: 20,
    price: 15,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440003",
    name: "مياه معدنية",
    quantity: 200,
    minStock: 50,
    price: 10,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440004",
    name: "بسكويت",
    quantity: 5, // Low stock!
    minStock: 15,
    price: 20,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440005",
    name: "عصير",
    quantity: 30,
    minStock: 10,
    price: 30,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

/**
 * Valid create inventory inputs
 */
export const VALID_CREATE_INPUTS: CreateInventory[] = [
  { name: "منتج جديد", quantity: 100, minStock: 20, price: 50 },
  { name: "شيبس", quantity: 50, minStock: 10, price: 15 },
];

/**
 * Invalid create inventory inputs
 */
export const INVALID_CREATE_INPUTS = [
  {
    input: { name: "أ", quantity: 10, minStock: 5, price: 10 },
    expectedError: "name",
    description: "Name too short",
  },
  {
    input: { name: "منتج", quantity: -5, minStock: 5, price: 10 },
    expectedError: "quantity",
    description: "Negative quantity",
  },
  {
    input: { name: "منتج", quantity: 10, minStock: -5, price: 10 },
    expectedError: "minStock",
    description: "Negative min stock",
  },
  {
    input: { name: "منتج", quantity: 10, minStock: 5, price: -10 },
    expectedError: "price",
    description: "Negative price",
  },
];

/**
 * Get low stock items
 */
export function getLowStockItems(): Inventory[] {
  return SAMPLE_INVENTORY.filter((item) => item.quantity < item.minStock);
}

/**
 * Get total inventory value
 */
export function getTotalInventoryValue(): number {
  return SAMPLE_INVENTORY.reduce((total, item) => total + item.quantity * item.price, 0);
}
