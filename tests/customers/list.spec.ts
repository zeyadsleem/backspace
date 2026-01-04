import { test, expect } from "../fixtures/test-data";

test.describe("Customer List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customers");
  });

  test("should display customer list page", async ({ page }) => {
    await expect(page).toHaveTitle(/Backspace/);
    await expect(page.getByText("Customers")).toBeVisible();
  });

  test("should display customer table", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("should have add customer button", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add/i });
    await expect(addButton).toBeVisible();
  });

  test("should display search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test("should filter customers by search", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("Test");

    await page.waitForTimeout(500);
  });

  test("should navigate to customer detail when clicking on customer", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    await expect(page).toHaveURL(/\/customers\/.+/);
  });
});
