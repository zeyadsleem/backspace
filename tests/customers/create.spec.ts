import { test, expect } from "../fixtures/test-data";

test.describe("Create Customer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customers");
  });

  test("should open create customer dialog", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add/i });
    await addButton.click();

    await expect(page.getByText("Add Customer")).toBeVisible();
  });

  test("should create new customer with valid data", async ({ page, customerData }) => {
    const addButton = page.getByRole("button", { name: /add/i });
    await addButton.click();

    await page.getByLabel(/name/i).fill(customerData.name);
    await page.getByLabel(/phone/i).fill(customerData.phone);
    await page.getByLabel(/email/i).fill(customerData.email || "");
    await page.getByRole("combobox", { name: /type/i }).selectOption(customerData.customerType);
    await page.getByLabel(/notes/i).fill(customerData.notes || "");

    await page.getByRole("button", { name: /create/i }).click();

    await expect(page.getByText("Customer created successfully")).toBeVisible();
    await expect(page).toHaveURL("/customers");
  });

  test("should validate required fields", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add/i });
    await addButton.click();

    await page.getByRole("button", { name: /create/i }).click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/phone is required/i)).toBeVisible();
  });

  test("should cancel create customer", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add/i });
    await addButton.click();

    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page.getByText("Add Customer")).not.toBeVisible();
    await expect(page).toHaveURL("/customers");
  });

  test("should show newly created customer in list", async ({ page, customerData }) => {
    const addButton = page.getByRole("button", { name: /add/i });
    await addButton.click();

    await page.getByLabel(/name/i).fill(customerData.name);
    await page.getByLabel(/phone/i).fill(customerData.phone);
    await page.getByRole("combobox", { name: /type/i }).selectOption(customerData.customerType);

    await page.getByRole("button", { name: /create/i }).click();

    await page.waitForTimeout(1000);

    await expect(page.getByText(customerData.name)).toBeVisible();
  });
});
